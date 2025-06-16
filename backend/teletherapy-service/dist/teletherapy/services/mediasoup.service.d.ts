import * as mediasoup from 'mediasoup';
export declare class MediaSoupService {
    private readonly logger;
    private worker;
    constructor();
    getWorker(): mediasoup.types.Worker;
    initializeWorker(): Promise<void>;
    createRouter(options: {
        mediaCodecs: mediasoup.types.RtpCodecCapability[];
    }): Promise<mediasoup.types.Router>;
    createWebRtcTransport(router: mediasoup.types.Router, options: {
        listenIps: {
            ip: string;
            announcedIp?: string;
        }[];
        enableUdp?: boolean;
        enableTcp?: boolean;
        preferUdp?: boolean;
        initialAvailableOutgoingBitrate?: number;
        minimumAvailableOutgoingBitrate?: number;
        maxSctpMessageSize?: number;
        numSctpStreams?: {
            OS: number;
            MIS: number;
        };
        maxIncomingBitrate?: number;
    }): Promise<mediasoup.types.WebRtcTransport>;
    createPlainTransport(router: mediasoup.types.Router, options: {
        listenIp: {
            ip: string;
            announcedIp?: string;
        };
        port?: number;
        rtcpMux?: boolean;
        comedia?: boolean;
        enableSctp?: boolean;
        numSctpStreams?: {
            OS: number;
            MIS: number;
        };
        maxSctpMessageSize?: number;
        enableTcp?: boolean;
        preferUdp?: boolean;
        initialAvailableOutgoingBitrate?: number;
    }): Promise<mediasoup.types.PlainTransport>;
    createPipeTransport(router: mediasoup.types.Router, options: {
        listenIp: {
            ip: string;
            announcedIp?: string;
        };
        port?: number;
        enableSctp?: boolean;
        numSctpStreams?: {
            OS: number;
            MIS: number;
        };
        maxSctpMessageSize?: number;
        enableRtx?: boolean;
        enableSrtp?: boolean;
    }): Promise<mediasoup.types.PipeTransport>;
    createDirectTransport(router: mediasoup.types.Router, options: {
        maxMessageSize?: number;
        enableSctp?: boolean;
        numSctpStreams?: {
            OS: number;
            MIS: number;
        };
        maxSctpMessageSize?: number;
        appData?: any;
    }): Promise<mediasoup.types.DirectTransport>;
    createDataProducer(transport: mediasoup.types.WebRtcTransport | mediasoup.types.PlainTransport | mediasoup.types.DirectTransport, options: {
        ordered?: boolean;
        maxRetransmits?: number;
        label?: string;
        protocol?: string;
        appData?: any;
    }): Promise<mediasoup.types.DataProducer>;
    createDataConsumer(transport: mediasoup.types.WebRtcTransport | mediasoup.types.PlainTransport | mediasoup.types.DirectTransport, options: {
        dataProducerId: string;
        ordered?: boolean;
        maxRetransmits?: number;
        appData?: any;
    }): Promise<mediasoup.types.DataConsumer>;
    createActiveSpeakerObserver(router: mediasoup.types.Router, options: {
        interval?: number;
        appData?: any;
    }): Promise<mediasoup.types.ActiveSpeakerObserver>;
    createAudioLevelObserver(router: mediasoup.types.Router, options: {
        maxEntries?: number;
        threshold?: number;
        interval?: number;
        appData?: any;
    }): Promise<mediasoup.types.AudioLevelObserver>;
}
