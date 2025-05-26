"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RecordingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_service_1 = require("./storage.service");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
let RecordingService = RecordingService_1 = class RecordingService {
    constructor(configService, storageService) {
        this.configService = configService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(RecordingService_1.name);
        this.activeRecordings = new Map();
        const recordingDir = this.configService.get('RECORDING_DIR') || 'recordings';
        if (!fs.existsSync(recordingDir)) {
            fs.mkdirSync(recordingDir, { recursive: true });
        }
    }
    async startRecording(sessionId, inputStreams, options = {}) {
        try {
            const recordingId = crypto.randomUUID();
            const outputPath = path.join(this.configService.get('RECORDING_DIR') || 'recordings', `${sessionId}_${recordingId}.${options.format || 'mp4'}`);
            const command = ffmpeg();
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
            command
                .outputOptions([
                `-c:v ${options.format === 'webm' ? 'libvpx-vp9' : 'libx264'}`,
                `-preset ${options.quality === 'high' ? 'slow' : options.quality === 'medium' ? 'medium' : 'fast'}`,
                `-crf ${options.quality === 'high' ? '18' : options.quality === 'medium' ? '23' : '28'}`,
                `-r ${options.fps || 30}`,
                `-b:v ${options.videoBitrate || this.getVideoBitrate(options.quality, options.resolution)}`,
                `-c:a ${options.format === 'webm' ? 'libopus' : 'aac'}`,
                `-b:a ${options.audioBitrate || 128}k`,
                `-ac ${options.audioChannels || 2}`,
                `-ar ${options.audioSampleRate || 48000}`,
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
                        await this.updateRecordingMetadata(sessionId, recordingId, {
                            ...metadata,
                            storageUrl: uploadResult.url,
                            storageKey: uploadResult.key,
                            uploadTime: new Date(),
                        });
                        fs.unlinkSync(outputPath);
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to process recording ${recordingId}:`, error);
                }
                finally {
                    this.activeRecordings.delete(recordingId);
                }
            });
            process.run();
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
        }
        catch (error) {
            this.logger.error(`Failed to start recording for session ${sessionId}:`, error);
            throw error;
        }
    }
    async stopRecording(recordingId) {
        const recording = this.activeRecordings.get(recordingId);
        if (!recording) {
            throw new Error(`No active recording found with ID: ${recordingId}`);
        }
        try {
            recording.process.kill('SIGTERM');
            await this.updateRecordingMetadata(recording.metadata.sessionId, recordingId, {
                ...recording.metadata,
                endTime: new Date(),
                duration: Date.now() - recording.startTime.getTime(),
            });
        }
        catch (error) {
            this.logger.error(`Failed to stop recording ${recordingId}:`, error);
            throw error;
        }
    }
    async getRecordingStatus(recordingId) {
        const recording = this.activeRecordings.get(recordingId);
        if (!recording) {
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
    async getRecordingMetadata(recordingId) {
        return null;
    }
    async updateRecordingMetadata(sessionId, recordingId, metadata) {
    }
    getVideoBitrate(quality, resolution) {
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
    async cleanupOldRecordings(maxAgeDays = 7) {
        const recordingDir = this.configService.get('RECORDING_DIR') || 'recordings';
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
                }
                catch (error) {
                    this.logger.error(`Failed to cleanup recording ${file}:`, error);
                }
            }
        }
    }
};
RecordingService = RecordingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        storage_service_1.StorageService])
], RecordingService);
exports.RecordingService = RecordingService;
//# sourceMappingURL=recording.service.js.map