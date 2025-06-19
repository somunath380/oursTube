import { Client } from 'minio';
import path from 'path';
import { minioClient } from "../db";
import { log } from 'console';
import {config} from "../config/env"

export class MinioService {
    private client: Client;
    private bucket: string;

    constructor(bucketName: string = config.MINIO_VIDEO_UPLOAD_BUCKET_NAME) {
        this.client = minioClient
        this.bucket = bucketName;
    }
    /**
     * Uploads a file to MinIO bucket.
     * @param localFilePath full path to the file
     * @param objectName object name to use in the bucket
     */
    async uploadFile(localFilePath: string, objectName: string): Promise<boolean|Error> {
        try {
            const mimeType = this.getMimeType(localFilePath);
            await this.client.fPutObject(this.bucket, objectName, localFilePath, {
                'Content-Type': mimeType,
            });
            log(`Uploaded file ${objectName} to bucket ${this.bucket}`);
            return true
        } catch (error) {
            log('error while uploading file. error: ', error)
            throw new Error(`error while uploading file. error: ${error}`)
        }
    }

    /**
     * Generates a presigned GET URL for a file.
     * @param objectName the object's name in the bucket
     * @param expiryInSeconds time before link expires (default 1 day)
     */
    async getPresignedUrl(objectName: string, expiryInSeconds = 86400): Promise<string|Error> {
        try {
            return this.client.presignedUrl('GET', this.bucket, objectName, expiryInSeconds);
        } catch (error) {
            log('error while fetching presigned url. error: ', error)
            throw new Error(`error while fetching presigned url. error: ${error}`)
        }
    }

    /**
     * Basic MIME type detection based on file extension.
     */
    private getMimeType(filename: string): string {
        const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const fileExtension = path.extname(filename).toLowerCase();
        if (allowedVideoTypes.includes(fileExtension)) {
            return 'video/mp4';
        }
        throw new Error('Unsupported file type');
    }
}
