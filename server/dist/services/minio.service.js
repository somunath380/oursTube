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
const env_1 = require("../config/env");
const mime_types_1 = __importDefault(require("mime-types"));
const fs_1 = __importDefault(require("fs"));
class MinioService {
    constructor(bucketName = env_1.config.MINIO_VIDEO_UPLOAD_BUCKET_NAME) {
        this.client = db_1.minioClient;
        this.bucket = bucketName;
    }
    uploadFile(localFilePath_1, objectName_1) {
        return __awaiter(this, arguments, void 0, function* (localFilePath, objectName, bucketName = this.bucket) {
            try {
                const mimeType = mime_types_1.default.lookup(localFilePath) || 'application/octet-stream';
                yield this.client.fPutObject(bucketName, objectName, localFilePath, {
                    'Content-Type': mimeType,
                });
                console.log(`Uploaded file ${objectName} to bucket ${bucketName}`);
                return true;
            }
            catch (error) {
                console.error('error while uploading file. error: ', error);
                throw new Error(`error while uploading file. error: ${error}`);
            }
        });
    }
    uploadFolder(folderPath_1) {
        return __awaiter(this, arguments, void 0, function* (folderPath, prefix = '') {
            const uploadRecursive = (dir, basePrefix) => __awaiter(this, void 0, void 0, function* () {
                const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(dir, entry.name);
                    const relativePath = path_1.default.relative(folderPath, fullPath);
                    const objectName = path_1.default.join(basePrefix, relativePath).replace(/\\/g, '/');
                    if (entry.isDirectory()) {
                        yield uploadRecursive(fullPath, basePrefix);
                    }
                    else {
                        yield this.uploadFile(fullPath, objectName);
                    }
                }
            });
            try {
                yield uploadRecursive(folderPath, prefix);
                return true;
            }
            catch (error) {
                console.error('error while uploading folder. error: ', error);
                throw new Error(`error while uploading folder. error: ${error}`);
            }
        });
    }
    getPresignedUrl(objectName_1) {
        return __awaiter(this, arguments, void 0, function* (objectName, expiryInSeconds = 86400) {
            try {
                return this.client.presignedUrl('GET', this.bucket, objectName, expiryInSeconds);
            }
            catch (error) {
                console.error('error while fetching presigned url. error: ', error);
                throw new Error(`error while fetching presigned url. error: ${error}`);
            }
        });
    }
}
exports.MinioService = MinioService;
//# sourceMappingURL=minio.service.js.map