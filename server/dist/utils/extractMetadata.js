"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractVideoMetadata = extractVideoMetadata;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
function extractVideoMetadata(filepath, title, description) {
    return new Promise((resolve, reject) => {
        try {
            fluent_ffmpeg_1.default.ffprobe(filepath, (err, metadata) => {
                if (err)
                    return reject(err);
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                const duration = metadata.format.duration || 0;
                const resolution = videoStream
                    ? `${videoStream.width}x${videoStream.height}`
                    : 'unknown';
                resolve({
                    title,
                    description,
                    filepath,
                    duration,
                    resolution,
                });
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
//# sourceMappingURL=extractMetadata.js.map