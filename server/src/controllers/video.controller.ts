import { Request, Response } from "express"
import fs from "fs"
import path from "path";

import { TranscodingService } from "../services/transcoding.service";
import { dbService } from "../services/postgres.service";
import { MinioService } from "../services/minio.service";
import { extractVideoMetadata } from "../utils/extractMetadata";
import { videoMetadataInterface } from '../interfaces/videoMetadataInterface';
import {uploadVideo, deleteUploadedFile} from "../middlewares/uploadFile"

const videoUploadPath: string = path.resolve(__dirname, "../../uploads")
if (!fs.existsSync(videoUploadPath)){
    fs.mkdirSync(videoUploadPath, {recursive: true})
}

export const uploadVideoHandler = async (req: Request, res: Response) => {
    const uploadVideoFunc = () =>
    new Promise<void>((resolve, reject) => {
        const upload = uploadVideo.single('video');
        upload(req, res, err => {
            if (err) reject(err);
            else resolve();
        });
    });
    try {
        await uploadVideoFunc()
        if (!req.file){
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        if (!req.body.title || !req.body.description){
            await deleteUploadedFile(req.file.path)
            return res.status(400).json({
                success: false,
                message: "Title and Description needs to be provided"
            });
        }
        const minio = new MinioService()
        const isUploadedinMinio = await minio.uploadFile(req.file.path, req.file?.filename)
        if (isUploadedinMinio){
            const videoMetadata: videoMetadataInterface = await extractVideoMetadata(req.file.path, req.body?.title, req.body?.description)
            const db = new dbService()
            const uploadedVideoObjName = req.file.filename
            const inputDbData = {
                title: videoMetadata.title,
                description: videoMetadata.description,
                filepath: uploadedVideoObjName,
                status: "in-progress",
                duration: videoMetadata.duration,
                resolution: videoMetadata.resolution
            }
            const createdVideoInstance = await db.storeVideo(inputDbData)
            await deleteUploadedFile(req.file.path)
            if (createdVideoInstance){
                res.status(200).json({
                    success: true
                })
            }
        }
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)){
            await deleteUploadedFile(req.file.path)
        }
        res.status(500).json({
                success: false,
                message: "File Uploading failed",
                error: error instanceof Error ? error.message : error
            });
    }
}
