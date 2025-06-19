import { PrismaClient } from "../generated/prisma";
import { Client } from "minio";

import {config} from "../config/env"

export const prisma = new PrismaClient()

export const minioClient = new Client({
    endPoint: config.MINIO_HOST,
    port: config.MINIO_PORT,
    useSSL: false,
    accessKey: config.MINIO_USER,
    secretKey: config.MINIO_PASSWORD
})