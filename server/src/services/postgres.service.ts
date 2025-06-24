import { prisma } from "../db";
import { PrismaClient } from "../generated/prisma";
import {dbInputInterface} from "../interfaces/dbInterface"
import { log } from "console";

export class dbService {
    private dbClient: PrismaClient;

    constructor() {
        this.dbClient = prisma;
    }
    /**
     * Create video entry in db
     */
    async storeVideo(data: dbInputInterface): Promise<ReturnType<typeof this.dbClient.video.create> | Error> {
        try {
            const inputData = {
                title: data.title,
                description: data.description,
                tags: data.tags,
                filepath: data.filepath,
                status: data.status,
                duration: typeof data.duration === 'number' ? data.duration : Number(data.duration),
                resolution: data.resolution
            };
            const video = await this.dbClient.video.create({ data: inputData });
            return video;
        } catch (error) {
            log("Error saving video entry. error: ", error)
            throw new Error("Error saving video entry");
        }
    }
    /**
     * read video entry in db
     */
    async readVideo(id: string): Promise<ReturnType<typeof this.dbClient.video.findUniqueOrThrow> | Error> {
        try {
            const videoData = await this.dbClient.video.findUniqueOrThrow({
                where: {id: id}
            });
            return videoData;
        } catch (error) {
            log("Error getting video entry. error: ", error)
            throw new Error("Error getting video entry");
        }
    }
    /**
     * update status of video
     */
    async updateVideoData(id: string, data: any): Promise<ReturnType<typeof this.dbClient.video.update> | Error>{
        try {
            const videoData = await this.dbClient.video.update({
                where: {id: id},
                data
            })
            return videoData
        } catch (error) {
            log("Error updating video status. error: ", error)
            throw new Error("Error updating video status");
        }
    }

    
    async getAllVideos(): Promise<ReturnType<typeof this.dbClient.video.findMany> | Error> {
        try {
            const videos = await this.dbClient.video.findMany({
                orderBy: {
                    created_at: 'desc'
                }
            });
            return videos;
        } catch (error) {
            log("Error getting all videos. error: ", error)
            throw new Error("Error getting all videos");
        }
    }
}