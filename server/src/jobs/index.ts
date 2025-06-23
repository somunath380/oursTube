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

const transcodedVideoSavedPath: string = path.resolve(__dirname, "../../transcodes")
if (!fs.existsSync(transcodedVideoSavedPath)){
    fs.mkdirSync(transcodedVideoSavedPath, {recursive: true})
}

// Debug configuration
log("=== Worker Configuration ===")
log(`RABBITMQ_URL: ${config.RABBITMQ_URL}`)
log(`QUEUE_NAME: ${config.QUEUE_NAME}`)
log(`DLQ_NAME: ${config.DLQ_NAME}`)
log("===========================")

async function testRabbitMQConnection(): Promise<boolean> {
    try {
        log(`Testing connection to: ${config.RABBITMQ_URL}`)
        const connection = await amqp.connect(config.RABBITMQ_URL)
        await connection.close()
        log("RabbitMQ connection test successful!")
        return true
    } catch (error) {
        log(`RabbitMQ connection test failed: ${error}`)
        return false
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
    log("processing data in queue", config.QUEUE_NAME)
    channel.consume(config.QUEUE_NAME, async (message: any) => {
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
    const maxRetries = 30
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
                process.exit(1)
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
            process.exit(1)
        })
    }, 10000)
})

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
    log('Attempting to restart worker in 10 seconds...')
    setTimeout(() => {
        connectAndProcess().catch((err) => {
            log(`Fatal error in worker: ${err}`)
            process.exit(1)
        })
    }, 10000)
})

// Start the worker
log("Starting worker...")
connectAndProcess().catch((error) => {
    log(`Fatal error in worker: ${error}`)
    process.exit(1)
})