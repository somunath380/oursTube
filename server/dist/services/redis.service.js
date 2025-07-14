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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const index_1 = require("../db/index");
class RedisService {
    constructor() {
        this.client = index_1.RedisClient;
        this.client.on('connect', () => console.log('connected to redis'));
    }
    set(key, value, expirySeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (expirySeconds) {
                yield this.client.setex(key, expirySeconds, value);
            }
            else {
                yield this.client.set(key, value);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.get(key);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.del(key);
        });
    }
    publish(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.publish(channel, message);
        });
    }
    subscribe(channel, onMessage) {
        const subscriber = this.client.duplicate();
        subscriber.subscribe(channel, () => {
            console.log(`📡 Subscribed to Redis channel: ${channel}`);
        });
        subscriber.on('message', (_, message) => {
            onMessage(message);
        });
    }
    quit() {
        this.client.quit();
    }
}
exports.RedisService = RedisService;
//# sourceMappingURL=redis.service.js.map