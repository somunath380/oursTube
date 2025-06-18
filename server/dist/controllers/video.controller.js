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
exports.uploadVideoHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const videoUploadPath = path_1.default.resolve(__dirname, "../../uploads/raw");
if (!fs_1.default.existsSync(videoUploadPath)) {
    fs_1.default.mkdirSync(videoUploadPath, { recursive: true });
}
const videoHlsPath = path_1.default.resolve(__dirname, "../../uploads/hls");
if (!fs_1.default.existsSync(videoHlsPath)) {
    fs_1.default.mkdirSync(videoHlsPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: videoUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    }
});
function checkFileType(file, cb) {
    const filetypes = /mp4|mov|avi|mkv|webm/;
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        throw new Error("Error: Videos Only!");
    }
}
const uploadVideo = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('video');
function transcodeVideo(inputPath, outputPath, resolution) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(outputPath)) {
                fs_1.default.mkdirSync(outputPath, { recursive: true });
            }
            fluent_ffmpeg_1.default.ffprobe(inputPath, (err, metadata) => {
                if (err)
                    return reject(err);
                (0, fluent_ffmpeg_1.default)(inputPath)
                    .outputOptions([
                    '-preset', 'veryfast',
                    '-g', '48',
                    '-sc_threshold', '0',
                    '-c:v', 'libx264',
                    '-b:v', '1400k',
                    '-s', resolution,
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    '-f', 'hls',
                    '-hls_time', '10',
                    '-hls_playlist_type', 'vod',
                    '-hls_segment_filename', path_1.default.join(outputPath, 'segment_%03d.ts')
                ])
                    .videoCodec('libx264')
                    .size(resolution)
                    .output(path_1.default.join(outputPath, 'playlist.m3u8'))
                    .on('start', (cmd) => {
                    console.log('[FFMPEG] Starting command:', cmd);
                })
                    .on('end', () => {
                    console.log(`File has been transcoded to ${resolution}`);
                    resolve();
                })
                    .on('error', (err) => {
                    console.error('[FFMPEG] Error:', err);
                    reject(err);
                })
                    .run();
            });
        });
    });
}
const uploadVideoHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    uploadVideo(req, res, (error) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Upload failed"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        const inputPath = req.file.path;
        const baseFilename = path_1.default.parse(req.file.filename).name;
        const resolutions = [
            { path: path_1.default.resolve(__dirname, "../../uploads/hls", `720p-${baseFilename}`), resolution: '1280x720' },
            { path: path_1.default.resolve(__dirname, "../../uploads/hls", `480p-${baseFilename}`), resolution: '854x480' },
            { path: path_1.default.resolve(__dirname, "../../uploads/hls", `360p-${baseFilename}`), resolution: '640x360' }
        ];
        try {
            for (const r of resolutions) {
                yield transcodeVideo(inputPath, r.path, r.resolution);
            }
            res.status(200).json({
                success: true,
                message: 'File uploaded and transcoded to HLS',
                hlsOutputs: resolutions.map(r => ({
                    resolution: r.resolution,
                    playlistUrl: `/videos/hls/${path_1.default.basename(r.path)}/playlist.m3u8`
                }))
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: "Transcoding failed",
                error: err instanceof Error ? err.message : err
            });
        }
    }));
});
exports.uploadVideoHandler = uploadVideoHandler;
//# sourceMappingURL=video.controller.js.map