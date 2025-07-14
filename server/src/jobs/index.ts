import * as amqp from "amqplib"
import path from "path"
import fs from 'fs'


import { config } from "../config/env"
import { log } from "console"
import { TranscodingService } from "../services/transcoding.service";
import { MinioService } from "../services/minio.service";
import { producerDataInterface } from "../interfaces/producerDataInterface";
import {deleteUploadedFile} from "../middlewares/uploadFile"
import { dbService } from "../services/postgres.service"
import {sendVideoUploadSuccessToQueue} from "../utils/producer"

const baseTranscodeDir: string = path.resolve(__dirname, "../../transcodes")
if (!fs.existsSync(baseTranscodeDir)){
    fs.mkdirSync(baseTranscodeDir, {recursive: true})
}

const baseThumbnailDir: string = path.resolve(__dirname, "../../thumbnails")
if (!fs.existsSync(baseThumbnailDir)){
    fs.mkdirSync(baseThumbnailDir, {recursive: true})
}

async function notifyVideoUploaded(videoId: string) {
    try {
        const data = {}
        await sendVideoUploadSuccessToQueue({
            success: true,
            videoId
        })
    } catch (error) {
        console.error(`Error occured while publishing data into queue. error: ${error}`)
        throw Error("Error occured while publishing data into queue")
    }
}

async function processVideoUpload(connection: any) {
    // const connection = await ampq.connect(config.RABBITMQ_URL)
    const channel = await connection.createChannel()
    await channel.assertQueue(config.QUEUE_NAME, {
        deadLetterExchange: '',
        durable: true,
        deadLetterRoutingKey: config.DLQ_NAME
    })
    log("received data in queue", config.QUEUE_NAME)
    channel.consume(config.QUEUE_NAME, async (message: any) => {
        if (!message) return
        const data: producerDataInterface = JSON.parse(message.content.toString())
        log(`processing data: ${JSON.stringify(message)}`)
        const folderName = data.folderName // song
        const outputPath = path.resolve(baseTranscodeDir, folderName, (folderName+'.mpd'))
        const thumbnailPath = path.resolve(baseThumbnailDir, (folderName +'.jpg')) //song.jpg
        try {
            const transcoder = new TranscodingService()
            // need to create prefetch url from minio
            const minio = new MinioService()
            const objPath = folderName + '/' + data.filename
            const presignedUrl = await minio.getPresignedUrl(objPath)
            if (typeof presignedUrl !== "string") {
                log("Failed to get presigned URL:", presignedUrl instanceof Error ? presignedUrl.message : presignedUrl);
                throw new Error("Failed to get presigned URL")
            }
             // uploads/hls/song/song.mpd
            await transcoder.transcodeVideo(presignedUrl, outputPath)
            let uploadSuccess = await minio.uploadFolder(path.resolve(baseTranscodeDir, folderName), folderName)
            // create thumbnail of it and save in db
            await transcoder.extractThumbnail(presignedUrl, thumbnailPath)
            const uploadThumbnailSuccess = await minio.uploadFile(thumbnailPath, folderName+"/"+path.basename(thumbnailPath))
            if (uploadSuccess && uploadThumbnailSuccess){
                await deleteUploadedFile(path.dirname(outputPath))
                await deleteUploadedFile(thumbnailPath)
                const db = new dbService()
                // const thumbUrl = await minio.getPresignedUrl(folderName+"/"+(folderName +'.jpg'), 3600)
                await db.updateVideoData(data.id, {
                    status: "uploaded",
                    thumbnail: folderName+"/"+(folderName +'.jpg')
                })
                channel.ack(message)
                await notifyVideoUploaded(data.id)
            }
        } catch (error) {
            log(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`)
            await deleteUploadedFile(path.dirname(outputPath))
            await deleteUploadedFile(thumbnailPath)
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

    // Handle connection close
    connection.on('close', () => {
        log('RabbitMQ connection closed. Attempting to reconnect...')
        setTimeout(() => connectAndProcess(), 5000)
    })

    connection.on('error', (error: any) => {
        log('RabbitMQ connection error:', error)
    })
}

async function connectAndProcess() {
    const maxRetries = 10
    const retryDelay = 3000
    
    // Add initial delay to ensure RabbitMQ is ready
    log("Waiting for RabbitMQ to be ready...")
    await new Promise(resolve => setTimeout(resolve, 15000))
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            log(`Attempting to connect to RabbitMQ (attempt ${i + 1}/${maxRetries})...`)
            log(`Connecting to: ${config.RABBITMQ_URL}`)
            
            const connection = await amqp.connect(config.RABBITMQ_URL)
            log("Successfully connected to RabbitMQ!")
            await processVideoUpload(connection)
            return // Exit the function if connection is successful
        } catch (error) {
            log(`Failed to connect to RabbitMQ (attempt ${i + 1}/${maxRetries}): ${error}`)
            if (i < maxRetries - 1) {
                log(`Retrying in ${retryDelay}ms...`)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
            } else {
                log(`Failed to connect to RabbitMQ after ${maxRetries} attempts. Exiting...`)                
            }
        }
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error}`)
    log('Attempting to restart worker in 10 seconds...')
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            log(`Fatal error in worker: ${err}`)
        })
    }, 10000)
})

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
    log('Attempting to restart worker in 10 seconds...')
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            log(`Fatal error in worker: ${err}`)
        })
    }, 10000)
})

// Start the worker
log("Starting worker...")
connectAndProcess().catch((error) => {
    log(`Fatal error in worker: ${error}`)
})