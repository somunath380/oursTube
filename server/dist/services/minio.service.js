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
exports.MinioService = void 0;
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const console_1 = require("console");
const env_1 = require("../config/env");
class MinioService {
    constructor(bucketName = env_1.config.MINIO_VIDEO_UPLOAD_BUCKET_NAME) {
        this.client = db_1.minioClient;
        this.bucket = bucketName;
    }
    uploadFile(localFilePath, objectName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mimeType = this.getMimeType(localFilePath);
                yield this.client.fPutObject(this.bucket, objectName, localFilePath, {
                    'Content-Type': mimeType,
                });
                (0, console_1.log)(`Uploaded file ${objectName} to bucket ${this.bucket}`);
                return true;
            }
            catch (error) {
                (0, console_1.log)('error while uploading file. error: ', error);
                throw new Error(`error while uploading file. error: ${error}`);
            }
        });
    }
    getPresignedUrl(objectName_1) {
        return __awaiter(this, arguments, void 0, function* (objectName, expiryInSeconds = 86400) {
            try {
                return this.client.presignedUrl('GET', this.bucket, objectName, expiryInSeconds);
            }
            catch (error) {
                (0, console_1.log)('error while fetching presigned url. error: ', error);
                throw new Error(`error while fetching presigned url. error: ${error}`);
            }
        });
    }
    getMimeType(filename) {
        const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const fileExtension = path_1.default.extname(filename).toLowerCase();
        if (allowedVideoTypes.includes(fileExtension)) {
            return 'video/mp4';
        }
        throw new Error('Unsupported file type');
    }
}
exports.MinioService = MinioService;
//# sourceMappingURL=minio.service.js.map