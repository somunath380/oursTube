"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("../controllers/video.controller");
const auth_1 = require("../middlewares/auth");
const videoRouter = express_1.default.Router();
videoRouter.post("/upload", auth_1.authenticate, video_controller_1.uploadVideoHandler);
videoRouter.get("/search", auth_1.authenticate, video_controller_1.searchVideo);
videoRouter.get("/all", auth_1.authenticate, video_controller_1.getAllVideos);
videoRouter.get("/manifest/:filepath", video_controller_1.fetchManifest);
videoRouter.get("/segment/:filepath/:filename", video_controller_1.fetchSegment);
videoRouter.get("/sse/:videoId", video_controller_1.openSSEConnection);
videoRouter.get("/thumbnail/:encodedUrl", video_controller_1.getThumbnail);
exports.default = videoRouter;
//# sourceMappingURL=video.js.map