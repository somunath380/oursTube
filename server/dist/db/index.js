"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esClient = exports.minioClient = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const minio_1 = require("minio");
const elasticsearch_1 = require("@elastic/elasticsearch");
const env_1 = require("../config/env");
exports.prisma = new prisma_1.PrismaClient();
exports.minioClient = new minio_1.Client({
    endPoint: env_1.config.MINIO_HOST || 'minio',
    port: env_1.config.MINIO_PORT,
    useSSL: false,
    accessKey: env_1.config.MINIO_USER,
    secretKey: env_1.config.MINIO_PASSWORD
});
exports.esClient = new elasticsearch_1.Client({
    node: env_1.config.ELASTICSEARCH_CLIENT_URL,
    headers: {
        'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
        'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
    }
});
//# sourceMappingURL=index.js.map