import { Injectable, Logger } from '@nestjs/common';
import * as mediasoup from 'mediasoup';

@Injectable()
export class MediaSoupService {
  private readonly logger = new Logger(MediaSoupService.name);
  private worker: mediasoup.types.Worker;

  constructor() {
    this.initializeWorker();
  }

  getWorker(): mediasoup.types.Worker {
    return this.worker;
  }

  async initializeWorker() {
    try {
      this.worker = await mediasoup.createWorker({
        logLevel: 'warn',
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
          'rtx',
          'bwe',
          'score',
          'simulcast',
          'svc',
          'sctp',
        ],
      });

      this.logger.log('MediaSoup worker created');

      // Monitor worker
      this.worker.on('died', () => {
        this.logger.error('MediaSoup worker died, exiting in 2 seconds...');
        setTimeout(() => process.exit(1), 2000);
      });
    } catch (error) {
      this.logger.error('Failed to create MediaSoup worker:', error);
      throw error;
    }
  }

  async createRouter(options: {
    mediaCodecs: mediasoup.types.RtpCodecCapability[];
  }): Promise<mediasoup.types.Router> {
    try {
      const router = await this.worker.createRouter({ mediaCodecs: options.mediaCodecs });
      this.logger.log(`Router created: ${router.id}`);
      return router;
    } catch (error) {
      this.logger.error('Failed to create router:', error);
      throw error;
    }
  }

  async createWebRtcTransport(
    router: mediasoup.types.Router,
    options: {
      listenIps: { ip: string; announcedIp?: string }[];
      enableUdp?: boolean;
      enableTcp?: boolean;
      preferUdp?: boolean;
      initialAvailableOutgoingBitrate?: number;
      minimumAvailableOutgoingBitrate?: number;
      maxSctpMessageSize?: number;
      numSctpStreams?: { OS: number; MIS: number };
      maxIncomingBitrate?: number;
    },
  ): Promise<mediasoup.types.WebRtcTransport> {
    try {
      const transport = await router.createWebRtcTransport({
        listenIps: options.listenIps,
        enableUdp: options.enableUdp ?? true,
        enableTcp: options.enableTcp ?? true,
        preferUdp: options.preferUdp ?? true,
        initialAvailableOutgoingBitrate: options.initialAvailableOutgoingBitrate ?? 1000,
        maxSctpMessageSize: options.maxSctpMessageSize ?? 262144,
        numSctpStreams: options.numSctpStreams ?? { OS: 1024, MIS: 1024 },
        // maxIncomingBitrate: options.maxIncomingBitrate, // Not available in current MediaSoup version
      });

      this.logger.log(`WebRTC transport created: ${transport.id}`);

      // Monitor transport
      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          this.logger.log(`Transport closed: ${transport.id}`);
        }
      });

      transport.on('@close', () => {
        this.logger.log(`Transport closed: ${transport.id}`);
      });

      return transport;
    } catch (error) {
      this.logger.error('Failed to create WebRTC transport:', error);
      throw error;
    }
  }

  async createPlainTransport(
    router: mediasoup.types.Router,
    options: {
      listenIp: { ip: string; announcedIp?: string };
      port?: number;
      rtcpMux?: boolean;
      comedia?: boolean;
      enableSctp?: boolean;
      numSctpStreams?: { OS: number; MIS: number };
      maxSctpMessageSize?: number;
      enableTcp?: boolean;
      preferUdp?: boolean;
      initialAvailableOutgoingBitrate?: number;
    },
  ): Promise<mediasoup.types.PlainTransport> {
    try {
      const transport = await router.createPlainTransport({
        listenIp: options.listenIp,
        port: options.port,
        rtcpMux: options.rtcpMux ?? false,
        comedia: options.comedia ?? false,
        enableSctp: options.enableSctp ?? false,
        numSctpStreams: options.numSctpStreams,
        maxSctpMessageSize: options.maxSctpMessageSize,
        // initialAvailableOutgoingBitrate: options.initialAvailableOutgoingBitrate, // Not available for plain transport
      });

      this.logger.log(`Plain transport created: ${transport.id}`);
      return transport;
    } catch (error) {
      this.logger.error('Failed to create plain transport:', error);
      throw error;
    }
  }

  async createPipeTransport(
    router: mediasoup.types.Router,
    options: {
      listenIp: { ip: string; announcedIp?: string };
      port?: number;
      enableSctp?: boolean;
      numSctpStreams?: { OS: number; MIS: number };
      maxSctpMessageSize?: number;
      enableRtx?: boolean;
      enableSrtp?: boolean;
    },
  ): Promise<mediasoup.types.PipeTransport> {
    try {
      const transport = await router.createPipeTransport({
        listenIp: options.listenIp,
        port: options.port,
        enableSctp: options.enableSctp ?? false,
        numSctpStreams: options.numSctpStreams,
        maxSctpMessageSize: options.maxSctpMessageSize,
        enableRtx: options.enableRtx ?? false,
        enableSrtp: options.enableSrtp ?? false,
      });

      this.logger.log(`Pipe transport created: ${transport.id}`);
      return transport;
    } catch (error) {
      this.logger.error('Failed to create pipe transport:', error);
      throw error;
    }
  }

  async createDirectTransport(
    router: mediasoup.types.Router,
    options: {
      maxMessageSize?: number;
      enableSctp?: boolean;
      numSctpStreams?: { OS: number; MIS: number };
      maxSctpMessageSize?: number;
      appData?: any;
    },
  ): Promise<mediasoup.types.DirectTransport> {
    try {
      const transport = await router.createDirectTransport({
        maxMessageSize: options.maxMessageSize,
        // numSctpStreams: options.numSctpStreams, // Not available in DirectTransport
        // maxSctpMessageSize: options.maxSctpMessageSize, // Not available in DirectTransport
        appData: options.appData,
      });

      this.logger.log(`Direct transport created: ${transport.id}`);
      return transport;
    } catch (error) {
      this.logger.error('Failed to create direct transport:', error);
      throw error;
    }
  }

  async createDataProducer(
    transport: mediasoup.types.WebRtcTransport | mediasoup.types.PlainTransport | mediasoup.types.DirectTransport,
    options: {
      ordered?: boolean;
      maxRetransmits?: number;
      label?: string;
      protocol?: string;
      appData?: any;
    },
  ): Promise<mediasoup.types.DataProducer> {
    try {
      const dataProducer = await transport.produceData({
        sctpStreamParameters: {
          streamId: 0,
          ordered: options.ordered,
          maxRetransmits: options.maxRetransmits,
        },
        label: options.label,
        protocol: options.protocol,
        appData: options.appData,
      });

      this.logger.log(`Data producer created: ${dataProducer.id}`);
      return dataProducer;
    } catch (error) {
      this.logger.error('Failed to create data producer:', error);
      throw error;
    }
  }

  async createDataConsumer(
    transport: mediasoup.types.WebRtcTransport | mediasoup.types.PlainTransport | mediasoup.types.DirectTransport,
    options: {
      dataProducerId: string;
      ordered?: boolean;
      maxRetransmits?: number;
      appData?: any;
    },
  ): Promise<mediasoup.types.DataConsumer> {
    try {
      const dataConsumer = await transport.consumeData({
        dataProducerId: options.dataProducerId,
        ordered: options.ordered,
        maxRetransmits: options.maxRetransmits,
        appData: options.appData,
      });

      this.logger.log(`Data consumer created: ${dataConsumer.id}`);
      return dataConsumer;
    } catch (error) {
      this.logger.error('Failed to create data consumer:', error);
      throw error;
    }
  }

  async createActiveSpeakerObserver(
    router: mediasoup.types.Router,
    options: {
      interval?: number;
      appData?: any;
    },
  ): Promise<mediasoup.types.ActiveSpeakerObserver> {
    try {
      const observer = await router.createActiveSpeakerObserver({
        interval: options.interval ?? 300,
        appData: options.appData,
      });

      this.logger.log(`Active speaker observer created: ${observer.id}`);
      return observer;
    } catch (error) {
      this.logger.error('Failed to create active speaker observer:', error);
      throw error;
    }
  }

  async createAudioLevelObserver(
    router: mediasoup.types.Router,
    options: {
      maxEntries?: number;
      threshold?: number;
      interval?: number;
      appData?: any;
    },
  ): Promise<mediasoup.types.AudioLevelObserver> {
    try {
      const observer = await router.createAudioLevelObserver({
        maxEntries: options.maxEntries ?? 1,
        threshold: options.threshold ?? -80,
        interval: options.interval ?? 1000,
        appData: options.appData,
      });

      this.logger.log(`Audio level observer created: ${observer.id}`);
      return observer;
    } catch (error) {
      this.logger.error('Failed to create audio level observer:', error);
      throw error;
    }
  }
} 