import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface RecordingOptions {
  quality?: 'high' | 'medium' | 'low';
  format?: 'mp4' | 'webm';
  resolution?: '1080p' | '720p' | '480p';
  audioBitrate?: number;
  videoBitrate?: number;
  fps?: number;
  audioChannels?: number;
  audioSampleRate?: number;
}

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);
  private activeRecordings: Map<string, {
    process: ffmpeg.FfmpegCommand;
    startTime: Date;
    options: RecordingOptions;
    outputPath: string;
    metadata: any;
  }> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {
    // Ensure recording directory exists
    const recordingDir = this.configService.get<string>('RECORDING_DIR') || 'recordings';
    if (!fs.existsSync(recordingDir)) {
      fs.mkdirSync(recordingDir, { recursive: true });
    }
  }

  async startRecording(
    sessionId: string,
    inputStreams: {
      video?: { url: string; type: 'screen' | 'camera' };
      audio?: { url: string; type: 'mic' | 'system' };
    }[],
    options: RecordingOptions = {},
  ): Promise<{ recordingId: string; outputPath: string }> {
    try {
      const recordingId = crypto.randomUUID();
      const outputPath = path.join(
        this.configService.get<string>('RECORDING_DIR') || 'recordings',
        `${sessionId}_${recordingId}.${options.format || 'mp4'}`,
      );

      // Configure FFmpeg command
      const command = ffmpeg();

      // Add input streams
      for (const stream of inputStreams) {
        if (stream.video) {
          command.input(stream.video.url)
            .inputOptions([
              '-f webm',
              '-re',
              stream.video.type === 'screen' ? '-draw_mouse 1' : '',
            ]);
        }
        if (stream.audio) {
          command.input(stream.audio.url)
            .inputOptions([
              '-f webm',
              '-re',
            ]);
        }
      }

      // Configure output
      command
        .outputOptions([
          // Video settings
          `-c:v ${options.format === 'webm' ? 'libvpx-vp9' : 'libx264'}`,
          `-preset ${options.quality === 'high' ? 'slow' : options.quality === 'medium' ? 'medium' : 'fast'}`,
          `-crf ${options.quality === 'high' ? '18' : options.quality === 'medium' ? '23' : '28'}`,
          `-r ${options.fps || 30}`,
          `-b:v ${options.videoBitrate || this.getVideoBitrate(options.quality, options.resolution)}`,
          // Audio settings
          `-c:a ${options.format === 'webm' ? 'libopus' : 'aac'}`,
          `-b:a ${options.audioBitrate || 128}k`,
          `-ac ${options.audioChannels || 2}`,
          `-ar ${options.audioSampleRate || 48000}`,
          // Other settings
          '-movflags +faststart',
          '-pix_fmt yuv420p',
          '-g 60',
          '-keyint_min 60',
          '-sc_threshold 0',
          '-bf 2',
          '-b_strategy 2',
          '-refs 3',
        ])
        .output(outputPath);

      // Start recording
      const process = command
        .on('start', (commandLine) => {
          this.logger.log(`Started recording ${recordingId} with command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          this.logger.debug(`Recording ${recordingId} progress:`, progress);
        })
        .on('error', (err) => {
          this.logger.error(`Recording ${recordingId} error:`, err);
          this.activeRecordings.delete(recordingId);
        })
        .on('end', async () => {
          this.logger.log(`Recording ${recordingId} completed`);
          
          // Upload to storage
          try {
            const recording = this.activeRecordings.get(recordingId);
            if (recording) {
              const { metadata } = recording;
              const uploadResult = await this.storageService.uploadFile({
                filePath: outputPath,
                bucket: 'recordings',
                key: `${sessionId}/${recordingId}.${options.format || 'mp4'}`,
                metadata: {
                  ...metadata,
                  sessionId,
                  recordingId,
                  format: options.format || 'mp4',
                  quality: options.quality || 'medium',
                  resolution: options.resolution || '720p',
                  duration: Date.now() - recording.startTime.getTime(),
                },
              });

              // Update recording metadata
              await this.updateRecordingMetadata(sessionId, recordingId, {
                ...metadata,
                storageUrl: uploadResult.url,
                storageKey: uploadResult.key,
                uploadTime: new Date(),
              });

              // Cleanup local file
              fs.unlinkSync(outputPath);
            }
          } catch (error) {
            this.logger.error(`Failed to process recording ${recordingId}:`, error);
          } finally {
            this.activeRecordings.delete(recordingId);
          }
        });

      // Start the recording process
      process.run();

      // Store recording info
      this.activeRecordings.set(recordingId, {
        process,
        startTime: new Date(),
        options,
        outputPath,
        metadata: {
          sessionId,
          streams: inputStreams,
          startTime: new Date(),
        },
      });

      return { recordingId, outputPath };
    } catch (error) {
      this.logger.error(`Failed to start recording for session ${sessionId}:`, error);
      throw error;
    }
  }

  async stopRecording(recordingId: string): Promise<void> {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      throw new Error(`No active recording found with ID: ${recordingId}`);
    }

    try {
      // Stop FFmpeg process
      recording.process.kill('SIGTERM');

      // Update metadata
      await this.updateRecordingMetadata(
        recording.metadata.sessionId,
        recordingId,
        {
          ...recording.metadata,
          endTime: new Date(),
          duration: Date.now() - recording.startTime.getTime(),
        },
      );
    } catch (error) {
      this.logger.error(`Failed to stop recording ${recordingId}:`, error);
      throw error;
    }
  }

  async getRecordingStatus(recordingId: string): Promise<{
    status: 'active' | 'completed' | 'failed';
    startTime: Date;
    duration?: number;
    metadata?: any;
  }> {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      // Check if recording exists in storage
      const metadata = await this.getRecordingMetadata(recordingId);
      if (metadata) {
        return {
          status: 'completed',
          startTime: metadata.startTime,
          duration: metadata.duration,
          metadata,
        };
      }
      throw new Error(`No recording found with ID: ${recordingId}`);
    }

    return {
      status: 'active',
      startTime: recording.startTime,
      metadata: recording.metadata,
    };
  }

  async getRecordingMetadata(recordingId: string): Promise<any> {
    // Implement metadata retrieval from database or storage
    // This is a placeholder implementation
    return null;
  }

  private async updateRecordingMetadata(
    sessionId: string,
    recordingId: string,
    metadata: any,
  ): Promise<void> {
    // Implement metadata update in database or storage
    // This is a placeholder implementation
  }

  private getVideoBitrate(quality: string, resolution: string): string {
    const bitrates = {
      high: {
        '1080p': '4000k',
        '720p': '2500k',
        '480p': '1000k',
      },
      medium: {
        '1080p': '2500k',
        '720p': '1500k',
        '480p': '800k',
      },
      low: {
        '1080p': '1500k',
        '720p': '1000k',
        '480p': '500k',
      },
    };

    return bitrates[quality || 'medium'][resolution || '720p'];
  }

  async cleanupOldRecordings(maxAgeDays: number = 7): Promise<void> {
    const recordingDir = this.configService.get<string>('RECORDING_DIR') || 'recordings';
    const files = fs.readdirSync(recordingDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(recordingDir, file);
      const stats = fs.statSync(filePath);
      const ageDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (ageDays > maxAgeDays) {
        try {
          fs.unlinkSync(filePath);
          this.logger.log(`Cleaned up old recording: ${file}`);
        } catch (error) {
          this.logger.error(`Failed to cleanup recording ${file}:`, error);
        }
      }
    }
  }
} 