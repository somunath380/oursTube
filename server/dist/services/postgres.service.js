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
exports.dbService = void 0;
const db_1 = require("../db");
const console_1 = require("console");
class dbService {
    constructor() {
        this.dbClient = db_1.prisma;
    }
    storeVideo(data) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const video = yield this.dbClient.video.create({ data: inputData });
                return video;
            }
            catch (error) {
                (0, console_1.log)("Error saving video entry. error: ", error);
                throw new Error("Error saving video entry");
            }
        });
    }
    readVideo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videoData = yield this.dbClient.video.findUniqueOrThrow({
                    where: { id: id }
                });
                return videoData;
            }
            catch (error) {
                (0, console_1.log)("Error getting video entry. error: ", error);
                throw new Error("Error getting video entry");
            }
        });
    }
    updateVideoStatus(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, status = "uploaded") {
            try {
                const videoData = yield this.dbClient.video.update({
                    where: { id: id },
                    data: { status: status }
                });
                return videoData;
            }
            catch (error) {
                (0, console_1.log)("Error updating video status. error: ", error);
                throw new Error("Error updating video status");
            }
        });
    }
    getAllVideos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videos = yield this.dbClient.video.findMany({
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                return videos;
            }
            catch (error) {
                (0, console_1.log)("Error getting all videos. error: ", error);
                throw new Error("Error getting all videos");
            }
        });
    }
}
exports.dbService = dbService;
//# sourceMappingURL=postgres.service.js.map