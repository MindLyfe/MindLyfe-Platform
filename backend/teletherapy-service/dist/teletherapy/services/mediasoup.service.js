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
var MediaSoupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaSoupService = void 0;
const common_1 = require("@nestjs/common");
const mediasoup = require("mediasoup");
let MediaSoupService = MediaSoupService_1 = class MediaSoupService {
    constructor() {
        this.logger = new common_1.Logger(MediaSoupService_1.name);
        this.initializeWorker();
    }
    getWorker() {
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
            this.worker.on('died', () => {
                this.logger.error('MediaSoup worker died, exiting in 2 seconds...');
                setTimeout(() => process.exit(1), 2000);
            });
        }
        catch (error) {
            this.logger.error('Failed to create MediaSoup worker:', error);
            throw error;
        }
    }
    async createRouter(options) {
        try {
            const router = await this.worker.createRouter({ mediaCodecs: options.mediaCodecs });
            this.logger.log(`Router created: ${router.id}`);
            return router;
        }
        catch (error) {
            this.logger.error('Failed to create router:', error);
            throw error;
        }
    }
    async createWebRtcTransport(router, options) {
        try {
            const transport = await router.createWebRtcTransport({
                listenIps: options.listenIps,
                enableUdp: options.enableUdp ?? true,
                enableTcp: options.enableTcp ?? true,
                preferUdp: options.preferUdp ?? true,
                initialAvailableOutgoingBitrate: options.initialAvailableOutgoingBitrate ?? 1000,
                maxSctpMessageSize: options.maxSctpMessageSize ?? 262144,
                numSctpStreams: options.numSctpStreams ?? { OS: 1024, MIS: 1024 },
            });
            this.logger.log(`WebRTC transport created: ${transport.id}`);
            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    this.logger.log(`Transport closed: ${transport.id}`);
                }
            });
            transport.on('@close', () => {
                this.logger.log(`Transport closed: ${transport.id}`);
            });
            return transport;
        }
        catch (error) {
            this.logger.error('Failed to create WebRTC transport:', error);
            throw error;
        }
    }
    async createPlainTransport(router, options) {
        try {
            const transport = await router.createPlainTransport({
                listenIp: options.listenIp,
                port: options.port,
                rtcpMux: options.rtcpMux ?? false,
                comedia: options.comedia ?? false,
                enableSctp: options.enableSctp ?? false,
                numSctpStreams: options.numSctpStreams,
                maxSctpMessageSize: options.maxSctpMessageSize,
            });
            this.logger.log(`Plain transport created: ${transport.id}`);
            return transport;
        }
        catch (error) {
            this.logger.error('Failed to create plain transport:', error);
            throw error;
        }
    }
    async createPipeTransport(router, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to create pipe transport:', error);
            throw error;
        }
    }
    async createDirectTransport(router, options) {
        try {
            const transport = await router.createDirectTransport({
                maxMessageSize: options.maxMessageSize,
                appData: options.appData,
            });
            this.logger.log(`Direct transport created: ${transport.id}`);
            return transport;
        }
        catch (error) {
            this.logger.error('Failed to create direct transport:', error);
            throw error;
        }
    }
    async createDataProducer(transport, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to create data producer:', error);
            throw error;
        }
    }
    async createDataConsumer(transport, options) {
        try {
            const dataConsumer = await transport.consumeData({
                dataProducerId: options.dataProducerId,
                ordered: options.ordered,
                maxRetransmits: options.maxRetransmits,
                appData: options.appData,
            });
            this.logger.log(`Data consumer created: ${dataConsumer.id}`);
            return dataConsumer;
        }
        catch (error) {
            this.logger.error('Failed to create data consumer:', error);
            throw error;
        }
    }
    async createActiveSpeakerObserver(router, options) {
        try {
            const observer = await router.createActiveSpeakerObserver({
                interval: options.interval ?? 300,
                appData: options.appData,
            });
            this.logger.log(`Active speaker observer created: ${observer.id}`);
            return observer;
        }
        catch (error) {
            this.logger.error('Failed to create active speaker observer:', error);
            throw error;
        }
    }
    async createAudioLevelObserver(router, options) {
        try {
            const observer = await router.createAudioLevelObserver({
                maxEntries: options.maxEntries ?? 1,
                threshold: options.threshold ?? -80,
                interval: options.interval ?? 1000,
                appData: options.appData,
            });
            this.logger.log(`Audio level observer created: ${observer.id}`);
            return observer;
        }
        catch (error) {
            this.logger.error('Failed to create audio level observer:', error);
            throw error;
        }
    }
};
MediaSoupService = MediaSoupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MediaSoupService);
exports.MediaSoupService = MediaSoupService;
//# sourceMappingURL=mediasoup.service.js.map