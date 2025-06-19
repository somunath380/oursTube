"use strict";
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
const amqplib_1 = __importDefault(require("amqplib"));
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
function processVideoUpload() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield amqplib_1.default.connect(env_1.config.RABBITMQ_URL);
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
            (0, console_1.log)(`processing data: ${message}`);
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
                (0, console_1.log)(`Error processing data. error: ${error} for data: ${message}`);
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
    });
}
processVideoUpload();
//# sourceMappingURL=index.js.map