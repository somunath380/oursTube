"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVideoUploadSuccessToQueue = exports.produceDataToQueue = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const env_1 = require("../config/env");
const console_1 = require("console");
const produceDataToQueue = (queueName, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield amqplib_1.default.connect(env_1.config.RABBITMQ_URL);
        const channel = yield connection.createChannel();
        yield channel.assertQueue(queueName, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: env_1.config.DLQ_NAME
        });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
        (0, console_1.log)(`data sent to queue, data: ${data}`);
    }
    catch (error) {
        console.error(`Error occured while publishing data into queue. error: ${error}`);
        throw Error("Error occured while publishing data into queue");
    }
});
exports.produceDataToQueue = produceDataToQueue;
const sendVideoUploadSuccessToQueue = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield amqplib_1.default.connect(env_1.config.RABBITMQ_URL);
        const channel = yield connection.createChannel();
        yield channel.assertQueue(env_1.config.NOTIFY_QUEUE_NAME, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: env_1.config.DLQ_NOTIFY_NAME
        });
        channel.sendToQueue(env_1.config.NOTIFY_QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
        (0, console_1.log)(`Successfully sent data to queue: ${env_1.config.NOTIFY_QUEUE_NAME}, data: ${JSON.stringify(data)}`);
        yield channel.close();
        yield connection.close();
    }
    catch (error) {
        console.error(`Error occured while publishing data into queue. error: ${error}`);
        throw Error("Error occured while publishing data into queue");
    }
});
exports.sendVideoUploadSuccessToQueue = sendVideoUploadSuccessToQueue;
//# sourceMappingURL=producer.js.map