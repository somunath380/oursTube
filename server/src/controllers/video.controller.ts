import { Request, Response } from "express"
import fs from "fs"
import path from "path";
import axios from "axios";

import { dbService } from "../services/postgres.service";
import { MinioService } from "../services/minio.service";
import {EsService} from "../services/elasticsearch.service"
import { extractVideoMetadata } from "../utils/extractMetadata";
import { videoMetadataInterface } from '../interfaces/videoMetadataInterface';
import { producerDataInterface } from "../interfaces/producerDataInterface";
import {uploadVideo, deleteUploadedFile} from "../middlewares/uploadFile"
import { produceDataToQueue } from "../utils/producer";
import { config } from "../config/env";
import { sseClients } from "../shared/globalState";

const videoUploadPath: string = path.resolve(__dirname, "../../uploads")
if (!fs.existsSync(videoUploadPath)){
    fs.mkdirSync(videoUploadPath, {recursive: true})
}

export const searchVideo = async (req: Request, res: Response) => {
    try {
        const query = req.query.search as string;
        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Query parameter `q` is required",
            });
        }
        const esService = new EsService(config.ELASTICSEARCH_INDEX);
        // Ensure index exists
        await esService.createIndexIfNotExists();
        // Search for videos
        const searchResults = await esService.search(query);
        // Get full video details from database for each search result
        const db = new dbService();
        const videosWithDetails = await Promise.all(
            searchResults.map(async (result) => {
                try {
                    const videoDetails = await db.readVideo(result.id);
                    if (videoDetails instanceof Error) {
                        return null;
                    }
                    return {
                        ...videoDetails,
                        score: result.score
                    };
                } catch (error) {
                    console.error(`Error fetching video details for ID ${result.id}:`, error);
                    return null;
                }
            })
        );
        const validVideos = videosWithDetails
            .filter(video => video !== null)
            .filter((video, index, self) => 
                index === self.findIndex(v => v.id === video.id)
            );
        res.status(200).json({
            success: true,
            data: {
                query,
                total: validVideos.length,
                videos: validVideos
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error instanceof Error ? error.message : error
        });
    }
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
        if (!req.body.title || !req.body.description || !req.body.tags){
            await deleteUploadedFile(req.file.path)
            return res.status(400).json({
                success: false,
                message: "Title, Description and Tags needs to be provided"
            });
        }
        let tags: string[] = []
        if (!Array.isArray(req.body.tags && typeof req.body.tags === "string")){
            tags = req.body.tags.split(/\s+/)
        }
        const minio = new MinioService()
        const filePath = req.file?.path; // full path to the uploaded file
        const fileNameWithoutExt = path.parse(filePath).name;
        const objectName = `${fileNameWithoutExt}/${path.basename(filePath)}`;
        const isUploadedinMinio = await minio.uploadFile(filePath, objectName)
        if (isUploadedinMinio){
            const videoMetadata: videoMetadataInterface = await extractVideoMetadata(req.file.path, req.body?.title, req.body?.description)
            const db = new dbService()
            const inputDbData = {
                title: videoMetadata.title,
                description: videoMetadata.description,
                tags: tags,
                filepath: fileNameWithoutExt,
                status: "in-progress",
                duration: videoMetadata.duration,
                resolution: videoMetadata.resolution
            }
            const createdVideoInstance = await db.storeVideo(inputDbData)
            await deleteUploadedFile(path.dirname(filePath))
            if (!(createdVideoInstance instanceof Error)) {
                // add data in elasticsearch
                const esService = new EsService(config.ELASTICSEARCH_INDEX);
                await esService.indexDocument({
                    id: createdVideoInstance.id.toString(),
                    title: videoMetadata.title,
                    description: videoMetadata.title,
                    tags: tags,
                    upload_date: new Date().toISOString()
                })
                const data: producerDataInterface = {
                    id: createdVideoInstance.id,
                    folderName: fileNameWithoutExt,
                    filename: req.file.filename, // file.mp4
                    status: createdVideoInstance.status
                }
                await produceDataToQueue(config.QUEUE_NAME, data)
                res.status(200).json({
                    success: true,
                    videoId: createdVideoInstance.id
                })
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to save video instance in db"
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

export const fetchManifest = async (req: Request, res: Response) => {
    try {
        const { filepath } = req.params; // e.g., song123.mp4
        if (!filepath) {
            return res.status(400).json({
                success: false,
                message: "filepath is required",
            });
        }
        const folder = path.parse(filepath).name; // remove .mp4
        const objectPath = `${folder}/${folder}.mpd`;
        const minio = new MinioService();
        const presignedUrl = await minio.getPresignedUrl(objectPath, 60);
        if (presignedUrl instanceof Error) {
            throw new Error("Failed to get presigned URL");
        }
        const response = await axios.get(presignedUrl);
        let mpdContent = response.data; // this is the .mpd XML string
        // Replace <BaseURL> with proxy path to your backend
        const baseUrl = `<BaseURL>/api/v1/video/segment/${filepath}/</BaseURL>`;
        if (!mpdContent.includes('<BaseURL>')) {
            mpdContent = mpdContent.replace(
                /(<Period[^>]*>)/,
                `$1\n${baseUrl}`
            );
        }
        res.setHeader("Content-Type", "application/dash+xml");
        res.send(mpdContent);
    } catch (error) {
        console.error("Error serving manifest:", error);
        res.status(500).json({ error: "Failed to fetch manifest." });
    }
};

export const fetchSegment = async (req: Request, res: Response) => {
    try {
        const { filepath, filename } = req.params; // filepath = "song123.mp4", filename = "chunk-1-43.m4s"
        if (!filepath || !filename) {
            return res.status(400).json({
                success: false,
                message: "videoid and filename is required",
            });
        }
        // get the name of the folder from filepath in db
        // split .mp4 ext
        const folder = path.parse(filepath).name
        const objectPath = `${folder}/${filename}`;
        const minio = new MinioService();
        const presignedUrl = await minio.getPresignedUrl(objectPath, 60); // 1-minute
        if ((presignedUrl instanceof Error)){
            throw Error("failed to create presigned url")
        }
        // Pipe the file from MinIO to the client
        const fileStream = await axios.get(presignedUrl, { responseType: 'stream' });
        res.set(fileStream.headers);
        fileStream.data.pipe(res);
    } catch (error) {
        console.error('Error serving segment:', error);
        res.status(500).json({ error: 'Could not stream video segment.' });
    }
}

export const getAllVideos = async (req: Request, res: Response) => {
    try {
        const db = new dbService();
        const videos = await db.getAllVideos();
        const minio = new MinioService();
        if (videos instanceof Error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch videos",
                error: videos.message
            });
        }
        const videosWithThumbnail = await Promise.all(videos.map(async (video: any) => {
            const thumbnail = await minio.getPresignedUrl(video.filepath+"/"+video.filepath+".jpg", 3600);
            await db.updateVideoData(video.id, {thumbnail: thumbnail});
            return {
                ...video,
                thumbnail: thumbnail
            }
        }));
        res.status(200).json({
            success: true,
            data: {
                total: videos.length,
                videos: videosWithThumbnail
            }
        });
    } catch (error) {
        console.error('Get all videos error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch videos",
            error: error instanceof Error ? error.message : error
        });
    }
}

export const openSSEConnection = async (req: Request, res: Response) => {
    const {videoId} = req.params;
    const headers = new Headers(
        {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    );
    res.setHeaders(headers)
    sseClients.set(videoId, res)
    req.on("close", () => {
        console.log(`SSE connection closed for video ${videoId}`);
        sseClients.delete(videoId);
    });
}

