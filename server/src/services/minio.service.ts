import { Client } from 'minio';
import path from 'path';
import { minioClient } from "../db";
import { log } from 'console';
import {config} from "../config/env"
import mime from 'mime-types';
import fs from "fs"

export class MinioService {
    private client: Client;
    private bucket: string;

    constructor(bucketName: string = config.MINIO_VIDEO_UPLOAD_BUCKET_NAME) {
        this.client = minioClient;
        this.bucket = bucketName;
    }
    async uploadFile(localFilePath: string, objectName: string, bucketName: string = this.bucket): Promise<boolean | Error> {
        try {
            const mimeType = mime.lookup(localFilePath) || 'application/octet-stream';
            await this.client.fPutObject(bucketName, objectName, localFilePath, {
                'Content-Type': mimeType,
            });
            console.log(`Uploaded file ${objectName} to bucket ${bucketName}`);
            return true;
        } catch (error) {
            console.error('error while uploading file. error: ', error);
            throw new Error(`error while uploading file. error: ${error}`);
        }
    }
    async uploadFolder(folderPath: string, prefix: string = ''): Promise<boolean | Error> {
        const uploadRecursive = async (dir: string, basePrefix: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(folderPath, fullPath);
                const objectName = path.join(basePrefix, relativePath).replace(/\\/g, '/');
                if (entry.isDirectory()) {
                    await uploadRecursive(fullPath, basePrefix);
                } else {
                    await this.uploadFile(fullPath, objectName);
                }
            }
        };
        try {
            await uploadRecursive(folderPath, prefix);
            return true
        } catch (error) {
            console.error('error while uploading folder. error: ', error);
            throw new Error(`error while uploading folder. error: ${error}`);
        }
    }
    async getPresignedUrl(objectName: string, expiryInSeconds = 86400): Promise<string | Error> {
        try {
            return this.client.presignedUrl('GET', this.bucket, objectName, expiryInSeconds);
        } catch (error) {
            console.error('error while fetching presigned url. error: ', error);
            throw new Error(`error while fetching presigned url. error: ${error}`);
        }
    }
}
