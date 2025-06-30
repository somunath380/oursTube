import {log} from "console"
import {config} from "../config/env"
import * as amqp from "amqplib"

import {sseClients} from "../shared/globalState"

async function sendSuccessNotification(connection: any) {
    const channel = await connection.createChannel()
    await channel.assertQueue(config.NOTIFY_QUEUE_NAME, {
        deadLetterExchange: '',
        durable: true,
        deadLetterRoutingKey: config.DLQ_NOTIFY_NAME
    })
    log("received data in queue", config.NOTIFY_QUEUE_NAME)
    channel.consume(config.NOTIFY_QUEUE_NAME, async (message: any) => {
        try {
            if (!message) return
            const data: any = JSON.parse(message.content.toString())
            log(`Processing notification message: ${JSON.stringify(data)}`)
            const videoId = data?.videoId
            // get the video id and response obj from sseClients
            const client = sseClients.get(videoId)
            if (client) {
                client.write(`data: ${JSON.stringify({ status: "uploaded", videoId })}\n\n`);
                client.end(); // close connection if done (or keep open if you want to send more events)
                sseClients.delete(videoId);
                channel.ack(message)
            } else {
                log(`No SSE client found for videoId: ${videoId}`)
                channel.ack(message) // Still ack the message even if no client found
            }
        } catch (error) {
            log(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`)
            const retryCount = message.properties && message.properties.headers && typeof message.properties.headers["x-retry"] !== "undefined"
                ? message.properties.headers["x-retry"]
                : 0
            if (retryCount < 3){
                channel.sendToQueue(config.DLQ_NOTIFY_NAME, Buffer.from(message.content.toString()), {
                    headers: {"x-retry": retryCount + 1},
                    persistent: true
                })
                log(`retrying process, current retry count: ${retryCount+1}`)
            } else {
                log(`message failed after 3 retries, sending to ${config.DLQ_NOTIFY_NAME}`)
                channel.sendToQueue(config.DLQ_NOTIFY_NAME, Buffer.from(message.content.toString()), {persistent: true})
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

export const connectAndProcess = async () => {
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
            await sendSuccessNotification(connection)
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

// // start consumer in API server
// connectAndProcess().catch((error) => {
//     log(`Fatal error in worker: ${error}`)
// })