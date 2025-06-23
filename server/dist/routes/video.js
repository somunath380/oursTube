"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("../controllers/video.controller");
const videoRouter = express_1.default.Router();
videoRouter.post("/upload", video_controller_1.uploadVideoHandler);
videoRouter.get("/search", video_controller_1.searchVideo);
videoRouter.get("/all", video_controller_1.getAllVideos);
videoRouter.get("/segment/:filepath/:filename", video_controller_1.fetchSegment);
exports.default = videoRouter;
//# sourceMappingURL=video.js.map