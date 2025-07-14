"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = exports.esClient = exports.minioClient = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const minio_1 = require("minio");
const elasticsearch_1 = require("@elastic/elasticsearch");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
exports.prisma = new prisma_1.PrismaClient();
exports.minioClient = new minio_1.Client({
    endPoint: env_1.config.MINIO_HOST,
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
exports.RedisClient = new ioredis_1.default({
    host: env_1.config.REDIS_HOST,
    port: Number(env_1.config.REDIS_PORT),
    password: env_1.config.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});
//# sourceMappingURL=index.js.map