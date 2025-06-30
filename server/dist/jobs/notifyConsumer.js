"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectAndProcess = void 0;
const console_1 = require("console");
const env_1 = require("../config/env");
const amqp = __importStar(require("amqplib"));
const globalState_1 = require("../shared/globalState");
function sendSuccessNotification(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = yield connection.createChannel();
        yield channel.assertQueue(env_1.config.NOTIFY_QUEUE_NAME, {
            deadLetterExchange: '',
            durable: true,
            deadLetterRoutingKey: env_1.config.DLQ_NOTIFY_NAME
        });
        (0, console_1.log)("received data in queue", env_1.config.NOTIFY_QUEUE_NAME);
        channel.consume(env_1.config.NOTIFY_QUEUE_NAME, (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!message)
                    return;
                const data = JSON.parse(message.content.toString());
                (0, console_1.log)(`Processing notification message: ${JSON.stringify(data)}`);
                const videoId = data === null || data === void 0 ? void 0 : data.videoId;
                const client = globalState_1.sseClients.get(videoId);
                if (client) {
                    client.write(`data: ${JSON.stringify({ status: "uploaded", videoId })}\n\n`);
                    client.end();
                    globalState_1.sseClients.delete(videoId);
                    channel.ack(message);
                }
                else {
                    (0, console_1.log)(`No SSE client found for videoId: ${videoId}`);
                    channel.ack(message);
                }
            }
            catch (error) {
                (0, console_1.log)(`Error processing data. error: ${error} for data: ${JSON.stringify(message)}`);
                const retryCount = message.properties && message.properties.headers && typeof message.properties.headers["x-retry"] !== "undefined"
                    ? message.properties.headers["x-retry"]
                    : 0;
                if (retryCount < 3) {
                    channel.sendToQueue(env_1.config.DLQ_NOTIFY_NAME, Buffer.from(message.content.toString()), {
                        headers: { "x-retry": retryCount + 1 },
                        persistent: true
                    });
                    (0, console_1.log)(`retrying process, current retry count: ${retryCount + 1}`);
                }
                else {
                    (0, console_1.log)(`message failed after 3 retries, sending to ${env_1.config.DLQ_NOTIFY_NAME}`);
                    channel.sendToQueue(env_1.config.DLQ_NOTIFY_NAME, Buffer.from(message.content.toString()), { persistent: true });
                }
                channel.nack(message, false, false);
            }
        }));
        connection.on('close', () => {
            (0, console_1.log)('RabbitMQ connection closed. Attempting to reconnect...');
            setTimeout(() => (0, exports.connectAndProcess)(), 5000);
        });
        connection.on('error', (error) => {
            (0, console_1.log)('RabbitMQ connection error:', error);
        });
    });
}
const connectAndProcess = () => __awaiter(void 0, void 0, void 0, function* () {
    const maxRetries = 10;
    const retryDelay = 3000;
    (0, console_1.log)("Waiting for RabbitMQ to be ready...");
    yield new Promise(resolve => setTimeout(resolve, 15000));
    for (let i = 0; i < maxRetries; i++) {
        try {
            (0, console_1.log)(`Attempting to connect to RabbitMQ (attempt ${i + 1}/${maxRetries})...`);
            (0, console_1.log)(`Connecting to: ${env_1.config.RABBITMQ_URL}`);
            const connection = yield amqp.connect(env_1.config.RABBITMQ_URL);
            (0, console_1.log)("Successfully connected to RabbitMQ!");
            yield sendSuccessNotification(connection);
            return;
        }
        catch (error) {
            (0, console_1.log)(`Failed to connect to RabbitMQ (attempt ${i + 1}/${maxRetries}): ${error}`);
            if (i < maxRetries - 1) {
                (0, console_1.log)(`Retrying in ${retryDelay}ms...`);
                yield new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            else {
                (0, console_1.log)(`Failed to connect to RabbitMQ after ${maxRetries} attempts. Exiting...`);
            }
        }
    }
});
exports.connectAndProcess = connectAndProcess;
process.on('uncaughtException', (error) => {
    (0, console_1.log)(`Uncaught Exception: ${error}`);
    (0, console_1.log)('Attempting to restart worker in 10 seconds...');
    setTimeout(() => {
        (0, exports.connectAndProcess)().catch((err) => {
            (0, console_1.log)(`Fatal error in worker: ${err}`);
        });
    }, 10000);
});
process.on('unhandledRejection', (reason, promise) => {
    (0, console_1.log)(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    (0, console_1.log)('Attempting to restart worker in 10 seconds...');
    setTimeout(() => {
        (0, exports.connectAndProcess)().catch((err) => {
            (0, console_1.log)(`Fatal error in worker: ${err}`);
        });
    }, 10000);
});
//# sourceMappingURL=notifyConsumer.js.map