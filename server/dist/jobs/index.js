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
const transcodedVideoSavedPath = path_1.default.resolve(__dirname, "../../transcodes");
if (!fs_1.default.existsSync(transcodedVideoSavedPath)) {
    fs_1.default.mkdirSync(transcodedVideoSavedPath, { recursive: true });
}
(0, console_1.log)("=== Worker Configuration ===");
(0, console_1.log)(`NODE_ENV: ${env_1.config.NODE_ENV}`);
(0, console_1.log)(`RABBITMQ_URL: ${env_1.config.RABBITMQ_URL}`);
(0, console_1.log)(`QUEUE_NAME: ${env_1.config.QUEUE_NAME}`);
(0, console_1.log)(`DLQ_NAME: ${env_1.config.DLQ_NAME}`);
(0, console_1.log)("===========================");
function testRabbitMQConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, console_1.log)(`Testing connection to: ${env_1.config.RABBITMQ_URL}`);
            const connection = yield amqp.connect(env_1.config.RABBITMQ_URL);
            yield connection.close();
            (0, console_1.log)("RabbitMQ connection test successful!");
            return true;
        }
        catch (error) {
            (0, console_1.log)(`RabbitMQ connection test failed: ${error}`);
            return false;
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
        (0, console_1.log)("processing data in queue", env_1.config.QUEUE_NAME);
        channel.consume(env_1.config.QUEUE_NAME, (message) => __awaiter(this, void 0, void 0, function* () {
            if (!message)
                return;
            const data = JSON.parse(message.content.toString());
            (0, console_1.log)(`processing data: ${JSON.stringify(message)}`);
            try {
                const transcoder = new transcoding_service_1.TranscodingService();
                const minio = new minio_service_1.MinioService();
                const presignedUrl = yield minio.getPresignedUrl(data.filepath);
                if (typeof presignedUrl !== "string") {
                    (0, console_1.log)("Failed to get presigned URL:", presignedUrl instanceof Error ? presignedUrl.message : presignedUrl);
                    throw new Error("Failed to get presigned URL");
                }
                const folderName = path_1.default.parse(data.filepath).name;
                const fileName = folderName + ".mpd";
                const outputPath = path_1.default.resolve(transcodedVideoSavedPath, folderName, fileName);
                yield transcoder.transcodeVideo(presignedUrl, outputPath);
                let uploadSuccess = yield minio.uploadFolder(path_1.default.resolve(transcodedVideoSavedPath, folderName), folderName);
                if (uploadSuccess) {
                    channel.ack(message);
                    yield (0, uploadFile_1.deleteUploadedFile)(path_1.default.resolve(transcodedVideoSavedPath, folderName));
                    const db = new postgres_service_1.dbService();
                    yield db.updateVideoStatus(data.id);
                }
            }
            catch (error) {
                (0, console_1.log)(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`);
                const folderName = path_1.default.parse(data.filepath).name;
                yield (0, uploadFile_1.deleteUploadedFile)(path_1.default.resolve(transcodedVideoSavedPath, folderName));
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
        const maxRetries = 30;
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
                    process.exit(1);
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
            process.exit(1);
        });
    }, 10000);
});
process.on('unhandledRejection', (reason, promise) => {
    (0, console_1.log)(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    (0, console_1.log)('Attempting to restart worker in 10 seconds...');
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            (0, console_1.log)(`Fatal error in worker: ${err}`);
            process.exit(1);
        });
    }, 10000);
});
(0, console_1.log)("Starting worker...");
connectAndProcess().catch((error) => {
    (0, console_1.log)(`Fatal error in worker: ${error}`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map