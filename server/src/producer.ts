import amqp from "amqplib"
import {config} from "./config/env"
import { log } from "console"
import { producerDataInterface } from "./interfaces/producerDataInterface"

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