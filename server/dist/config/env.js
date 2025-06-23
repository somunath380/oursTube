"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    PORT: Number(process.env.PORT),
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIREY: 60 * 60 * 24 * 2,
    JWT_REFRESH_EXPIRY: 60 * 60 * 24 * 7,
    PG_USER: String(process.env.PG_USER),
    PG_PASSWORD: String(process.env.PG_PASSWORD),
    PG_DB: String(process.env.PG_DB),
    PG_PORT: Number(process.env.PG_PORT),
    PG_HOST: String(process.env.PG_HOST),
    MINIO_USER: String(process.env.MINIO_USER),
    MINIO_PASSWORD: String(process.env.MINIO_PASSWORD),
    MINIO_HOST: String(process.env.MINIO_HOST),
    MINIO_PORT: Number(process.env.MINIO_PORT),
    MINIO_VIDEO_UPLOAD_BUCKET_NAME: String(process.env.MINIO_VIDEO_UPLOAD_BUCKET_NAME),
    MINIO_MPD_UPLOAD_BUCKET_NAME: String(process.env.MINIO_MPD_UPLOAD_BUCKET_NAME),
    RABBITMQ_URL: String(process.env.RABBITMQ_URL),
    QUEUE_NAME: String(process.env.QUEUE_NAME),
    DLQ_NAME: String(process.env.DLQ_NAME),
    ELASTICSEARCH_CLIENT_URL: String(process.env.ELASTICSEARCH_CLIENT_URL),
    ELASTICSEARCH_INDEX: String(process.env.ELASTICSEARCH_INDEX),
};
//# sourceMappingURL=env.js.map