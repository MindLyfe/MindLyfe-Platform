"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingProcessor = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var lib_storage_1 = require("@aws-sdk/lib-storage");
var winston_1 = require("winston");
var date_fns_1 = require("date-fns");
var zlib_1 = require("zlib");
var util_1 = require("util");
var uuid_1 = require("uuid");
var openai_1 = require("openai");
var tiktoken_1 = require("tiktoken");
var data_lake_logger_1 = require("@mindlyfe/data-lake-logger");
var gzipAsync = (0, util_1.promisify)(zlib_1.gzip);
var gunzipAsync = (0, util_1.promisify)(zlib_1.gunzip);
var EmbeddingProcessor = /** @class */ (function () {
    function EmbeddingProcessor(config) {
        this.config = config;
        this.s3Client = new client_s3_1.S3Client({
            region: config.region,
        });
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.consentManager = new data_lake_logger_1.ConsentManager();
        this.logger = (0, winston_1.createLogger)({
            level: 'info',
            format: require('winston').format.combine(require('winston').format.timestamp(), require('winston').format.json()),
            transports: [
                new require('winston').transports.Console(),
            ],
        });
    }
    /**
     * Process embeddings for the configured date range and services
     */
    EmbeddingProcessor.prototype.processEmbeddings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, stats, eligibleUsers, allEmbeddings, _i, _a, service, serviceEmbeddings, _b, backupKey, _c, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        startTime = Date.now();
                        this.logger.info('Starting embedding processing', {
                            dateRange: this.config.dateRange,
                            services: this.config.services,
                            embeddingModel: this.config.embeddingModel,
                        });
                        stats = {
                            totalTextsProcessed: 0,
                            totalChunks: 0,
                            totalEmbeddings: 0,
                            averageChunkSize: 0,
                            processingTimeMs: 0,
                            servicesProcessed: [],
                            vectorsStored: 0,
                            backupFileSize: 0,
                            dateRange: {
                                start: this.config.dateRange.start.toISOString(),
                                end: this.config.dateRange.end.toISOString(),
                            },
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 13, , 14]);
                        eligibleUsers = [];
                        if (!this.config.filterByConsent) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.consentManager.getEligibleUsersForAITraining()];
                    case 2:
                        eligibleUsers = _d.sent();
                        this.logger.info("Found ".concat(eligibleUsers.length, " users eligible for embedding processing"));
                        _d.label = 3;
                    case 3:
                        allEmbeddings = [];
                        _i = 0, _a = this.config.services;
                        _d.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        service = _a[_i];
                        this.logger.info("Processing service: ".concat(service));
                        return [4 /*yield*/, this.processService(service, eligibleUsers)];
                    case 5:
                        serviceEmbeddings = _d.sent();
                        allEmbeddings.push.apply(allEmbeddings, serviceEmbeddings);
                        stats.servicesProcessed.push(service);
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        // Calculate statistics
                        stats.totalTextsProcessed = allEmbeddings.length;
                        stats.totalChunks = allEmbeddings.length; // Each embedding represents one chunk
                        stats.totalEmbeddings = allEmbeddings.length;
                        stats.averageChunkSize = this.calculateAverageChunkSize(allEmbeddings);
                        if (!(this.config.vectorDatabase !== 's3-only')) return [3 /*break*/, 9];
                        _b = stats;
                        return [4 /*yield*/, this.storeInVectorDatabase(allEmbeddings)];
                    case 8:
                        _b.vectorsStored = _d.sent();
                        _d.label = 9;
                    case 9:
                        if (!this.config.backupToS3) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.backupToS3(allEmbeddings)];
                    case 10:
                        backupKey = _d.sent();
                        _c = stats;
                        return [4 /*yield*/, this.getFileSize(backupKey)];
                    case 11:
                        _c.backupFileSize = _d.sent();
                        _d.label = 12;
                    case 12:
                        stats.processingTimeMs = Date.now() - startTime;
                        this.logger.info('Embedding processing completed', stats);
                        return [2 /*return*/, stats];
                    case 13:
                        error_1 = _d.sent();
                        this.logger.error('Embedding processing failed', error_1);
                        throw error_1;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process embeddings for a specific service
     */
    EmbeddingProcessor.prototype.processService = function (service, eligibleUsers) {
        return __awaiter(this, void 0, void 0, function () {
            var embeddings, prefixes, _i, prefixes_1, prefix, objects, _a, objects_1, object, logs, chunks, batchEmbeddings, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        embeddings = [];
                        prefixes = this.generateS3Prefixes(service, this.config.dateRange.start, this.config.dateRange.end);
                        _i = 0, prefixes_1 = prefixes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < prefixes_1.length)) return [3 /*break*/, 11];
                        prefix = prefixes_1[_i];
                        this.logger.debug("Processing prefix: ".concat(prefix));
                        return [4 /*yield*/, this.listS3Objects(prefix)];
                    case 2:
                        objects = _b.sent();
                        _a = 0, objects_1 = objects;
                        _b.label = 3;
                    case 3:
                        if (!(_a < objects_1.length)) return [3 /*break*/, 10];
                        object = objects_1[_a];
                        if (!object.Key)
                            return [3 /*break*/, 9];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, this.downloadAndParseLogs(object.Key)];
                    case 5:
                        logs = _b.sent();
                        return [4 /*yield*/, this.extractTextChunks(logs, service, eligibleUsers)];
                    case 6:
                        chunks = _b.sent();
                        return [4 /*yield*/, this.processBatches(chunks)];
                    case 7:
                        batchEmbeddings = _b.sent();
                        embeddings.push.apply(embeddings, batchEmbeddings);
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        this.logger.warn("Failed to process object ".concat(object.Key, ":"), error_2);
                        return [3 /*break*/, 9];
                    case 9:
                        _a++;
                        return [3 /*break*/, 3];
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/, embeddings];
                }
            });
        });
    };
    /**
     * Generate S3 prefixes for the date range
     */
    EmbeddingProcessor.prototype.generateS3Prefixes = function (service, startDate, endDate) {
        var prefixes = [];
        var currentDate = (0, date_fns_1.startOfDay)(startDate);
        while (currentDate <= endDate) {
            var year = (0, date_fns_1.format)(currentDate, 'yyyy');
            var month = (0, date_fns_1.format)(currentDate, 'MM');
            var day = (0, date_fns_1.format)(currentDate, 'dd');
            prefixes.push("raw/".concat(service, "/").concat(year, "/").concat(month, "/").concat(day, "/"));
            currentDate = (0, date_fns_1.subDays)(currentDate, -1); // Add one day
        }
        return prefixes;
    };
    /**
     * List objects in S3 with a given prefix
     */
    EmbeddingProcessor.prototype.listS3Objects = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var objects, continuationToken, command, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objects = [];
                        _a.label = 1;
                    case 1:
                        command = new client_s3_1.ListObjectsV2Command({
                            Bucket: this.config.bucketName,
                            Prefix: prefix,
                            ContinuationToken: continuationToken,
                        });
                        return [4 /*yield*/, this.s3Client.send(command)];
                    case 2:
                        response = _a.sent();
                        if (response.Contents) {
                            objects.push.apply(objects, response.Contents);
                        }
                        continuationToken = response.NextContinuationToken;
                        _a.label = 3;
                    case 3:
                        if (continuationToken) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4: return [2 /*return*/, objects];
                }
            });
        });
    };
    /**
     * Download and parse logs from S3
     */
    EmbeddingProcessor.prototype.downloadAndParseLogs = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var command, response, chunks, reader, _a, reader_1, reader_1_1, chunk, e_1_1, data, logs, lines, _i, lines_1, line, log;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        command = new client_s3_1.GetObjectCommand({
                            Bucket: this.config.bucketName,
                            Key: key,
                        });
                        return [4 /*yield*/, this.s3Client.send(command)];
                    case 1:
                        response = _e.sent();
                        if (!response.Body) {
                            throw new Error("No body in S3 response for key: ".concat(key));
                        }
                        chunks = [];
                        reader = response.Body;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, reader_1 = __asyncValues(reader);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, reader_1.next()];
                    case 4:
                        if (!(reader_1_1 = _e.sent(), _b = reader_1_1.done, !_b)) return [3 /*break*/, 6];
                        _d = reader_1_1.value;
                        _a = false;
                        chunk = _d;
                        chunks.push(chunk);
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = reader_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(reader_1)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        data = Buffer.concat(chunks);
                        if (!key.endsWith('.gz')) return [3 /*break*/, 15];
                        return [4 /*yield*/, gunzipAsync(data)];
                    case 14:
                        data = _e.sent();
                        _e.label = 15;
                    case 15:
                        logs = [];
                        lines = data.toString('utf8').split('\n');
                        for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                            line = lines_1[_i];
                            if (line.trim()) {
                                try {
                                    log = JSON.parse(line);
                                    logs.push(log);
                                }
                                catch (error) {
                                    this.logger.warn("Failed to parse log line: ".concat(line));
                                }
                            }
                        }
                        return [2 /*return*/, logs];
                }
            });
        });
    };
    /**
     * Extract text chunks from logs
     */
    EmbeddingProcessor.prototype.extractTextChunks = function (logs, service, eligibleUsers) {
        return __awaiter(this, void 0, void 0, function () {
            var chunks, _i, logs_1, log, serviceChunks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chunks = [];
                        _i = 0, logs_1 = logs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < logs_1.length)) return [3 /*break*/, 4];
                        log = logs_1[_i];
                        // Check if user is eligible if consent filtering is enabled
                        if (this.config.filterByConsent && log.user_id && !eligibleUsers.includes(log.user_id)) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, this.extractServiceSpecificText(log, service)];
                    case 2:
                        serviceChunks = _a.sent();
                        chunks.push.apply(chunks, serviceChunks);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, chunks];
                }
            });
        });
    };
    /**
     * Extract service-specific text for embedding
     */
    EmbeddingProcessor.prototype.extractServiceSpecificText = function (log, service) {
        return __awaiter(this, void 0, void 0, function () {
            var chunks, journalChunks, _i, journalChunks_1, chunk;
            return __generator(this, function (_a) {
                chunks = [];
                switch (service) {
                    case 'lyfbot-service':
                        if ('prompt' in log && 'response' in log && log.prompt && log.response) {
                            // Create chunks for both prompt and response
                            chunks.push(this.createTextChunk(log.prompt, 'lyfbot-prompt', log), this.createTextChunk(log.response, 'lyfbot-response', log));
                        }
                        break;
                    case 'journal-service':
                        if ('entry_content' in log && log.entry_content) {
                            journalChunks = this.splitTextIntoChunks(log.entry_content);
                            for (_i = 0, journalChunks_1 = journalChunks; _i < journalChunks_1.length; _i++) {
                                chunk = journalChunks_1[_i];
                                chunks.push(this.createTextChunk(chunk, 'journal-entry', log));
                            }
                        }
                        break;
                    case 'chat-service':
                        if ('message_type' in log && log.message_type === 'text' && 'message_content' in log) {
                            chunks.push(this.createTextChunk(log.message_content, 'chat-message', log));
                        }
                        break;
                    case 'community-service':
                        if ('content_type' in log && log.content_type === 'post' && 'content' in log) {
                            chunks.push(this.createTextChunk(log.content, 'community-post', log));
                        }
                        break;
                }
                return [2 /*return*/, chunks];
            });
        });
    };
    /**
     * Create a text chunk object
     */
    EmbeddingProcessor.prototype.createTextChunk = function (text, source, log) {
        return {
            id: (0, uuid_1.v4)(),
            text: text,
            source: source,
            userId: log.user_id,
            timestamp: log.timestamp,
            metadata: {
                service: log.service,
                interaction_type: log.interaction_type,
                session_id: log.session_id,
            },
            tokenCount: this.countTokens(text),
        };
    };
    /**
     * Split text into chunks based on token count
     */
    EmbeddingProcessor.prototype.splitTextIntoChunks = function (text) {
        var tokens = (0, tiktoken_1.encode)(text);
        var chunks = [];
        for (var i = 0; i < tokens.length; i += this.config.chunkSize - this.config.chunkOverlap) {
            var chunkTokens = tokens.slice(i, i + this.config.chunkSize);
            var chunkText = new TextDecoder().decode(new Uint8Array(chunkTokens));
            chunks.push(chunkText);
        }
        return chunks;
    };
    /**
     * Count tokens in text
     */
    EmbeddingProcessor.prototype.countTokens = function (text) {
        return (0, tiktoken_1.encode)(text).length;
    };
    /**
     * Process chunks in batches to create embeddings
     */
    EmbeddingProcessor.prototype.processBatches = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var embeddings, i, batch, batchEmbeddings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embeddings = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < chunks.length)) return [3 /*break*/, 5];
                        batch = chunks.slice(i, i + this.config.batchSize);
                        return [4 /*yield*/, this.createEmbeddings(batch)];
                    case 2:
                        batchEmbeddings = _a.sent();
                        embeddings.push.apply(embeddings, batchEmbeddings);
                        if (!(i + this.config.batchSize < chunks.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.delay(100)];
                    case 3:
                        _a.sent(); // 100ms delay between batches
                        _a.label = 4;
                    case 4:
                        i += this.config.batchSize;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, embeddings];
                }
            });
        });
    };
    /**
     * Create embeddings for a batch of text chunks
     */
    EmbeddingProcessor.prototype.createEmbeddings = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var texts, response_1, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        texts = chunks.map(function (chunk) { return chunk.text; });
                        return [4 /*yield*/, this.openai.embeddings.create({
                                model: this.config.embeddingModel,
                                input: texts,
                            })];
                    case 1:
                        response_1 = _a.sent();
                        return [2 /*return*/, chunks.map(function (chunk, index) { return ({
                                user_id: chunk.userId || 'anonymous',
                                text: chunk.text,
                                embedding: response_1.data[index].embedding,
                                source: chunk.source,
                                timestamp: chunk.timestamp,
                                metadata: __assign(__assign({}, chunk.metadata), { chunk_id: chunk.id, token_count: chunk.tokenCount, embedding_model: _this.config.embeddingModel }),
                            }); })];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Failed to create embeddings for batch', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Store embeddings in vector database
     */
    EmbeddingProcessor.prototype.storeInVectorDatabase = function (embeddings) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with Qdrant or Weaviate
                // For now, return the count as if stored
                this.logger.info("Would store ".concat(embeddings.length, " embeddings in ").concat(this.config.vectorDatabase));
                return [2 /*return*/, embeddings.length];
            });
        });
    };
    /**
     * Backup embeddings to S3
     */
    EmbeddingProcessor.prototype.backupToS3 = function (embeddings) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, filename, key, jsonContent, compressedContent, upload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd-HHmmss');
                        filename = "embeddings_backup_".concat(timestamp, "_").concat((0, uuid_1.v4)().substring(0, 8), ".json");
                        key = "".concat(this.config.outputPath, "/").concat(filename);
                        jsonContent = JSON.stringify(embeddings, null, 2);
                        return [4 /*yield*/, gzipAsync(Buffer.from(jsonContent, 'utf8'))];
                    case 1:
                        compressedContent = _a.sent();
                        upload = new lib_storage_1.Upload({
                            client: this.s3Client,
                            params: {
                                Bucket: this.config.bucketName,
                                Key: "".concat(key, ".gz"),
                                Body: compressedContent,
                                ContentType: 'application/gzip',
                                Metadata: {
                                    'mindlyf-embeddings': 'backup',
                                    'backup-timestamp': new Date().toISOString(),
                                    'embedding-count': embeddings.length.toString(),
                                    'embedding-model': this.config.embeddingModel,
                                },
                            },
                        });
                        return [4 /*yield*/, upload.done()];
                    case 2:
                        _a.sent();
                        this.logger.info("Backed up ".concat(embeddings.length, " embeddings to ").concat(key, ".gz"));
                        return [2 /*return*/, "".concat(key, ".gz")];
                }
            });
        });
    };
    /**
     * Calculate average chunk size
     */
    EmbeddingProcessor.prototype.calculateAverageChunkSize = function (embeddings) {
        if (embeddings.length === 0)
            return 0;
        var totalTokens = embeddings.reduce(function (sum, emb) { var _a; return sum + (((_a = emb.metadata) === null || _a === void 0 ? void 0 : _a.token_count) || 0); }, 0);
        return totalTokens / embeddings.length;
    };
    /**
     * Get file size from S3
     */
    EmbeddingProcessor.prototype.getFileSize = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var command, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        command = new client_s3_1.ListObjectsV2Command({
                            Bucket: this.config.bucketName,
                            Prefix: key,
                        });
                        return [4 /*yield*/, this.s3Client.send(command)];
                    case 1:
                        response = _a.sent();
                        if (response.Contents && response.Contents.length > 0) {
                            return [2 /*return*/, response.Contents[0].Size || 0];
                        }
                        return [2 /*return*/, 0];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.warn("Failed to get file size for ".concat(key, ":"), error_4);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delay utility
     */
    EmbeddingProcessor.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /**
     * Static method to process embeddings for a date range
     */
    EmbeddingProcessor.processDateRange = function (startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (startDate, endDate, services, options) {
            var config, processor;
            if (services === void 0) { services = ['lyfbot-service', 'journal-service', 'chat-service']; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = __assign({ bucketName: process.env.DATA_LAKE_BUCKET_NAME || 'mindlyf-data-lake', region: process.env.AWS_REGION || 'us-east-1', outputPath: 'embeddings', services: services, dateRange: { start: startDate, end: endDate }, embeddingModel: 'text-embedding-ada-002', chunkSize: 1000, chunkOverlap: 200, batchSize: 100, vectorDatabase: 'qdrant', backupToS3: true, filterByConsent: true }, options);
                        processor = new EmbeddingProcessor(config);
                        return [4 /*yield*/, processor.processEmbeddings()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Static method to process embeddings for the last N days
     */
    EmbeddingProcessor.processLastDays = function (days_1) {
        return __awaiter(this, arguments, void 0, function (days, services, options) {
            var endDate, startDate;
            if (services === void 0) { services = ['lyfbot-service', 'journal-service', 'chat-service']; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                endDate = (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(new Date(), 1));
                startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(endDate, days - 1));
                return [2 /*return*/, this.processDateRange(startDate, endDate, services, options)];
            });
        });
    };
    return EmbeddingProcessor;
}());
exports.EmbeddingProcessor = EmbeddingProcessor;
