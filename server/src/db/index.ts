import { PrismaClient } from "../generated/prisma";
import { Client } from "minio";
import { Client as elasticClient } from "@elastic/elasticsearch";

import {config} from "../config/env"

export const prisma = new PrismaClient()

export const minioClient = new Client({
    endPoint: config.MINIO_HOST || 'minio',
    port: config.MINIO_PORT,
    useSSL: false,
    accessKey: config.MINIO_USER,
    secretKey: config.MINIO_PASSWORD
})

export const esClient = new elasticClient({
    node: config.ELASTICSEARCH_CLIENT_URL,
    headers: {
        'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
        'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
    }
})
