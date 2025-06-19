import ampq from "amqplib"
import path from "path"
import fs from 'fs'


import { config } from "../config/env"
import { log } from "console"
import { TranscodingService } from "../services/transcoding.service";
import { MinioService } from "../services/minio.service";
import { producerDataInterface } from "../interfaces/producerDataInterface";
import {deleteUploadedFile} from "../middlewares/uploadFile"
import { dbService } from "../services/postgres.service"

const transcodedVideoSavedPath: string = path.resolve(__dirname, "../../transcodes")
if (!fs.existsSync(transcodedVideoSavedPath)){
    fs.mkdirSync(transcodedVideoSavedPath, {recursive: true})
}

async function processVideoUpload() {
    const connection = await ampq.connect(config.RABBITMQ_URL)
    const channel = await connection.createChannel()
    await channel.assertQueue(config.QUEUE_NAME, {
        deadLetterExchange: '',
        durable: true,
        deadLetterRoutingKey: config.DLQ_NAME
    })
    log("processing data in queue", config.QUEUE_NAME)
    channel.consume(config.QUEUE_NAME, async (message) => {
        if (!message) return
        const data: producerDataInterface = JSON.parse(message.content.toString())
        log(`processing data: ${JSON.stringify(message)}`)
        try {
            const transcoder = new TranscodingService()
            // need to create prefetch url from minio
            const minio = new MinioService()
            const presignedUrl = await minio.getPresignedUrl(data.filepath)
            if (typeof presignedUrl !== "string") {
                log("Failed to get presigned URL:", presignedUrl instanceof Error ? presignedUrl.message : presignedUrl);
                throw new Error("Failed to get presigned URL")
            }
            const folderName = path.parse(data.filepath).name // song
            const fileName = folderName+".mpd" // song.mpd
            const outputPath = path.resolve(transcodedVideoSavedPath, folderName, fileName) // uploads/hls/song/song.mpd
            await transcoder.transcodeVideo(presignedUrl, outputPath)
            let uploadSuccess = await minio.uploadFolder(path.resolve(transcodedVideoSavedPath, folderName), folderName)
            if (uploadSuccess){
                channel.ack(message)
                await deleteUploadedFile(path.resolve(transcodedVideoSavedPath, folderName))
                const db = new dbService()
                await db.updateVideoStatus(data.id)
            }
        } catch (error) {
            log(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`)
            const folderName = path.parse(data.filepath).name // song
            await deleteUploadedFile(path.resolve(transcodedVideoSavedPath, folderName))
            const retryCount = message.properties && message.properties.headers && typeof message.properties.headers["x-retry"] !== "undefined"
                ? message.properties.headers["x-retry"]
                : 0
            if (retryCount < 3){
                channel.sendToQueue(config.QUEUE_NAME, Buffer.from(message.content.toString()), {
                    headers: {"x-retry": retryCount + 1},
                    persistent: true
                })
                log(`retrying process, current retry count: ${retryCount+1}`)
            } else {
                log(`message failed after 3 retries, sending to ${config.DLQ_NAME}`)
                channel.sendToQueue(config.DLQ_NAME, Buffer.from(message.content.toString()), {persistent: true})
            }
            channel.nack(message, false, false)
        }
    })
}

processVideoUpload()