"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = __importStar(require("amqplib"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const console_1 = require("console");
const transcoding_service_1 = require("../services/transcoding.service");
const minio_service_1 = require("../services/minio.service");
const uploadFile_1 = require("../middlewares/uploadFile");
const postgres_service_1 = require("../services/postgres.service");
const producer_1 = require("../utils/producer");
const baseTranscodeDir = path_1.default.resolve(__dirname, "../../transcodes");
if (!fs_1.default.existsSync(baseTranscodeDir)) {
    fs_1.default.mkdirSync(baseTranscodeDir, { recursive: true });
}
const baseThumbnailDir = path_1.default.resolve(__dirname, "../../thumbnails");
if (!fs_1.default.existsSync(baseThumbnailDir)) {
    fs_1.default.mkdirSync(baseThumbnailDir, { recursive: true });
}
function notifyVideoUploaded(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = {};
            yield (0, producer_1.sendVideoUploadSuccessToQueue)({
                success: true,
                videoId
            });
        }
        catch (error) {
            console.error(`Error occured while publishing data into queue. error: ${error}`);
            throw Error("Error occured while publishing data into queue");
        }
    });
}
function processVideoUpload(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = yield connection.createChannel();
        yield channel.assertQueue(env_1.config.QUEUE_NAME, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: env_1.config.DLQ_NAME
        });
        (0, console_1.log)("received data in queue", env_1.config.QUEUE_NAME);
        channel.consume(env_1.config.QUEUE_NAME, (message) => __awaiter(this, void 0, void 0, function* () {
            if (!message)
                return;
            const data = JSON.parse(message.content.toString());
            (0, console_1.log)(`processing data: ${JSON.stringify(message)}`);
            const folderName = data.folderName;
            const outputPath = path_1.default.resolve(baseTranscodeDir, folderName, (folderName + '.mpd'));
            const thumbnailPath = path_1.default.resolve(baseThumbnailDir, (folderName + '.jpg'));
            try {
                const transcoder = new transcoding_service_1.TranscodingService();
                const minio = new minio_service_1.MinioService();
                const objPath = folderName + '/' + data.filename;
                const presignedUrl = yield minio.getPresignedUrl(objPath);
                if (typeof presignedUrl !== "string") {
                    (0, console_1.log)("Failed to get presigned URL:", presignedUrl instanceof Error ? presignedUrl.message : presignedUrl);
                    throw new Error("Failed to get presigned URL");
                }
                yield transcoder.transcodeVideo(presignedUrl, outputPath);
                let uploadSuccess = yield minio.uploadFolder(path_1.default.resolve(baseTranscodeDir, folderName), folderName);
                yield transcoder.extractThumbnail(presignedUrl, thumbnailPath);
                const uploadThumbnailSuccess = yield minio.uploadFile(thumbnailPath, folderName + "/" + path_1.default.basename(thumbnailPath));
                if (uploadSuccess && uploadThumbnailSuccess) {
                    yield (0, uploadFile_1.deleteUploadedFile)(path_1.default.dirname(outputPath));
                    yield (0, uploadFile_1.deleteUploadedFile)(thumbnailPath);
                    const db = new postgres_service_1.dbService();
                    const thumbUrl = yield minio.getPresignedUrl(folderName + "/" + (folderName + '.jpg'), 3600);
                    yield db.updateVideoData(data.id, {
                        status: "uploaded",
                        thumbnail: thumbUrl
                    });
                    channel.ack(message);
                    yield notifyVideoUploaded(data.id);
                }
            }
            catch (error) {
                (0, console_1.log)(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`);
                yield (0, uploadFile_1.deleteUploadedFile)(path_1.default.dirname(outputPath));
                yield (0, uploadFile_1.deleteUploadedFile)(thumbnailPath);
                const retryCount = message.properties && message.properties.headers && typeof message.properties.headers["x-retry"] !== "undefined"
                    ? message.properties.headers["x-retry"]
                    : 0;
                if (retryCount < 3) {
                    channel.sendToQueue(env_1.config.QUEUE_NAME, Buffer.from(message.content.toString()), {
                        headers: { "x-retry": retryCount + 1 },
                        persistent: true
                    });
                    (0, console_1.log)(`retrying process, current retry count: ${retryCount + 1}`);
                }
                else {
                    (0, console_1.log)(`message failed after 3 retries, sending to ${env_1.config.DLQ_NAME}`);
                    channel.sendToQueue(env_1.config.DLQ_NAME, Buffer.from(message.content.toString()), { persistent: true });
                }
                channel.nack(message, false, false);
            }
        }));
        connection.on('close', () => {
            (0, console_1.log)('RabbitMQ connection closed. Attempting to reconnect...');
            setTimeout(() => connectAndProcess(), 5000);
        });
        connection.on('error', (error) => {
            (0, console_1.log)('RabbitMQ connection error:', error);
        });
    });
}
function connectAndProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        const maxRetries = 10;
        const retryDelay = 3000;
        (0, console_1.log)("Waiting for RabbitMQ to be ready...");
        yield new Promise(resolve => setTimeout(resolve, 15000));
        for (let i = 0; i < maxRetries; i++) {
            try {
                (0, console_1.log)(`Attempting to connect to RabbitMQ (attempt ${i + 1}/${maxRetries})...`);
                (0, console_1.log)(`Connecting to: ${env_1.config.RABBITMQ_URL}`);
                const connection = yield amqp.connect(env_1.config.RABBITMQ_URL);
                (0, console_1.log)("Successfully connected to RabbitMQ!");
                yield processVideoUpload(connection);
                return;
            }
            catch (error) {
                (0, console_1.log)(`Failed to connect to RabbitMQ (attempt ${i + 1}/${maxRetries}): ${error}`);
                if (i < maxRetries - 1) {
                    (0, console_1.log)(`Retrying in ${retryDelay}ms...`);
                    yield new Promise(resolve => setTimeout(resolve, retryDelay));
                }
                else {
                    (0, console_1.log)(`Failed to connect to RabbitMQ after ${maxRetries} attempts. Exiting...`);
                }
            }
        }
    });
}
process.on('uncaughtException', (error) => {
    (0, console_1.log)(`Uncaught Exception: ${error}`);
    (0, console_1.log)('Attempting to restart worker in 10 seconds...');
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            (0, console_1.log)(`Fatal error in worker: ${err}`);
        });
    }, 10000);
});
process.on('unhandledRejection', (reason, promise) => {
    (0, console_1.log)(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    (0, console_1.log)('Attempting to restart worker in 10 seconds...');
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            (0, console_1.log)(`Fatal error in worker: ${err}`);
        });
    }, 10000);
});
(0, console_1.log)("Starting worker...");
connectAndProcess().catch((error) => {
    (0, console_1.log)(`Fatal error in worker: ${error}`);
});
//# sourceMappingURL=index.js.map