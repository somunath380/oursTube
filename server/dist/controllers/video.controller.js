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
exports.openSSEConnection = exports.getAllVideos = exports.fetchSegment = exports.fetchManifest = exports.uploadVideoHandler = exports.searchVideo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const postgres_service_1 = require("../services/postgres.service");
const minio_service_1 = require("../services/minio.service");
const elasticsearch_service_1 = require("../services/elasticsearch.service");
const extractMetadata_1 = require("../utils/extractMetadata");
const uploadFile_1 = require("../middlewares/uploadFile");
const producer_1 = require("../utils/producer");
const env_1 = require("../config/env");
const globalState_1 = require("../shared/globalState");
const videoUploadPath = path_1.default.resolve(__dirname, "../../uploads");
if (!fs_1.default.existsSync(videoUploadPath)) {
    fs_1.default.mkdirSync(videoUploadPath, { recursive: true });
}
const searchVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.search;
        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Query parameter `q` is required",
            });
        }
        const esService = new elasticsearch_service_1.EsService(env_1.config.ELASTICSEARCH_INDEX);
        yield esService.createIndexIfNotExists();
        const searchResults = yield esService.search(query);
        const db = new postgres_service_1.dbService();
        const videosWithDetails = yield Promise.all(searchResults.map((result) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const videoDetails = yield db.readVideo(result.id);
                if (videoDetails instanceof Error) {
                    return null;
                }
                return Object.assign(Object.assign({}, videoDetails), { score: result.score });
            }
            catch (error) {
                console.error(`Error fetching video details for ID ${result.id}:`, error);
                return null;
            }
        })));
        const validVideos = videosWithDetails
            .filter(video => video !== null)
            .filter((video, index, self) => index === self.findIndex(v => v.id === video.id));
        res.status(200).json({
            success: true,
            data: {
                query,
                total: validVideos.length,
                videos: validVideos
            }
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.searchVideo = searchVideo;
const uploadVideoHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const uploadVideoFunc = () => new Promise((resolve, reject) => {
        const upload = uploadFile_1.uploadVideo.single('video');
        upload(req, res, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
    try {
        yield uploadVideoFunc();
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        if (!req.body.title || !req.body.description || !req.body.tags) {
            yield (0, uploadFile_1.deleteUploadedFile)(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Title, Description and Tags needs to be provided"
            });
        }
        let tags = [];
        if (!Array.isArray(req.body.tags && typeof req.body.tags === "string")) {
            tags = req.body.tags.split(/\s+/);
        }
        const minio = new minio_service_1.MinioService();
        const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        const fileNameWithoutExt = path_1.default.parse(filePath).name;
        const objectName = `${fileNameWithoutExt}/${path_1.default.basename(filePath)}`;
        const isUploadedinMinio = yield minio.uploadFile(filePath, objectName);
        if (isUploadedinMinio) {
            const videoMetadata = yield (0, extractMetadata_1.extractVideoMetadata)(req.file.path, (_b = req.body) === null || _b === void 0 ? void 0 : _b.title, (_c = req.body) === null || _c === void 0 ? void 0 : _c.description);
            const db = new postgres_service_1.dbService();
            const inputDbData = {
                title: videoMetadata.title,
                description: videoMetadata.description,
                tags: tags,
                filepath: fileNameWithoutExt,
                status: "in-progress",
                duration: videoMetadata.duration,
                resolution: videoMetadata.resolution
            };
            const createdVideoInstance = yield db.storeVideo(inputDbData);
            yield (0, uploadFile_1.deleteUploadedFile)(path_1.default.dirname(filePath));
            if (!(createdVideoInstance instanceof Error)) {
                const esService = new elasticsearch_service_1.EsService(env_1.config.ELASTICSEARCH_INDEX);
                yield esService.indexDocument({
                    id: createdVideoInstance.id.toString(),
                    title: videoMetadata.title,
                    description: videoMetadata.title,
                    tags: tags,
                    upload_date: new Date().toISOString()
                });
                const data = {
                    id: createdVideoInstance.id,
                    folderName: fileNameWithoutExt,
                    filename: req.file.filename,
                    status: createdVideoInstance.status
                };
                yield (0, producer_1.produceDataToQueue)(env_1.config.QUEUE_NAME, data);
                res.status(200).json({
                    success: true,
                    videoId: createdVideoInstance.id
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Failed to save video instance in db"
                });
            }
        }
    }
    catch (error) {
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            yield (0, uploadFile_1.deleteUploadedFile)(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: "File Uploading failed",
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.uploadVideoHandler = uploadVideoHandler;
const fetchManifest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filepath } = req.params;
        if (!filepath) {
            return res.status(400).json({
                success: false,
                message: "filepath is required",
            });
        }
        const folder = path_1.default.parse(filepath).name;
        const objectPath = `${folder}/${folder}.mpd`;
        const minio = new minio_service_1.MinioService();
        const presignedUrl = yield minio.getPresignedUrl(objectPath, 60);
        if (presignedUrl instanceof Error) {
            throw new Error("Failed to get presigned URL");
        }
        const response = yield axios_1.default.get(presignedUrl);
        let mpdContent = response.data;
        const baseUrl = `<BaseURL>/api/v1/video/segment/${filepath}/</BaseURL>`;
        if (!mpdContent.includes('<BaseURL>')) {
            mpdContent = mpdContent.replace(/(<Period[^>]*>)/, `$1\n${baseUrl}`);
        }
        res.setHeader("Content-Type", "application/dash+xml");
        res.send(mpdContent);
    }
    catch (error) {
        console.error("Error serving manifest:", error);
        res.status(500).json({ error: "Failed to fetch manifest." });
    }
});
exports.fetchManifest = fetchManifest;
const fetchSegment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filepath, filename } = req.params;
        if (!filepath || !filename) {
            return res.status(400).json({
                success: false,
                message: "videoid and filename is required",
            });
        }
        const folder = path_1.default.parse(filepath).name;
        const objectPath = `${folder}/${filename}`;
        const minio = new minio_service_1.MinioService();
        const presignedUrl = yield minio.getPresignedUrl(objectPath, 60);
        if ((presignedUrl instanceof Error)) {
            throw Error("failed to create presigned url");
        }
        const fileStream = yield axios_1.default.get(presignedUrl, { responseType: 'stream' });
        res.set(fileStream.headers);
        fileStream.data.pipe(res);
    }
    catch (error) {
        console.error('Error serving segment:', error);
        res.status(500).json({ error: 'Could not stream video segment.' });
    }
});
exports.fetchSegment = fetchSegment;
const getAllVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = new postgres_service_1.dbService();
        const videos = yield db.getAllVideos();
        const minio = new minio_service_1.MinioService();
        if (videos instanceof Error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch videos",
                error: videos.message
            });
        }
        const videosWithThumbnail = yield Promise.all(videos.map((video) => __awaiter(void 0, void 0, void 0, function* () {
            const thumbnail = yield minio.getPresignedUrl(video.filepath + "/" + video.filepath + ".jpg", 3600);
            yield db.updateVideoData(video.id, { thumbnail: thumbnail });
            return Object.assign(Object.assign({}, video), { thumbnail: thumbnail });
        })));
        res.status(200).json({
            success: true,
            data: {
                total: videos.length,
                videos: videosWithThumbnail
            }
        });
    }
    catch (error) {
        console.error('Get all videos error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch videos",
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.getAllVideos = getAllVideos;
const openSSEConnection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });
    res.setHeaders(headers);
    globalState_1.sseClients.set(videoId, res);
    req.on("close", () => {
        console.log(`SSE connection closed for video ${videoId}`);
        globalState_1.sseClients.delete(videoId);
    });
});
exports.openSSEConnection = openSSEConnection;
//# sourceMappingURL=video.controller.js.map