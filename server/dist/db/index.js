"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minioClient = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const minio_1 = require("minio");
const env_1 = require("../config/env");
exports.prisma = new prisma_1.PrismaClient();
exports.minioClient = new minio_1.Client({
    endPoint: env_1.config.MINIO_HOST || 'minio',
    port: env_1.config.MINIO_PORT,
    useSSL: false,
    accessKey: env_1.config.MINIO_USER,
    secretKey: env_1.config.MINIO_PASSWORD
});
//# sourceMappingURL=index.js.map