import amqp from "amqplib"
import {config} from "../config/env"
import { log } from "console"
import { producerDataInterface } from "../interfaces/producerDataInterface"

export const produceDataToQueue = async (queueName: string, data: producerDataInterface) => {
    try {
        const connection = await amqp.connect(config.RABBITMQ_URL)
        const channel = await connection.createChannel()
        await channel.assertQueue(queueName, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: config.DLQ_NAME
        })
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
        log(`data sent to queue, data: ${data}`)
    } catch (error) {
        console.error(`Error occured while publishing data into queue. error: ${error}`)
        throw Error("Error occured while publishing data into queue")
    }
}

export const sendVideoUploadSuccessToQueue = async (data: any) => {
    try {
        const connection = await amqp.connect(config.RABBITMQ_URL)
        const channel = await connection.createChannel()
        await channel.assertQueue(config.NOTIFY_QUEUE_NAME, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: config.DLQ_NOTIFY_NAME
        })
        channel.sendToQueue(config.NOTIFY_QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
        log(`Successfully sent data to queue: ${config.NOTIFY_QUEUE_NAME}, data: ${JSON.stringify(data)}`)
        
        // Close the connection after sending
        await channel.close()
        await connection.close()
    } catch (error) {
        console.error(`Error occured while publishing data into queue. error: ${error}`)
        throw Error("Error occured while publishing data into queue")
    }
}
