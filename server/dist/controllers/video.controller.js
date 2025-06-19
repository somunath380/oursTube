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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const postgres_service_1 = require("../services/postgres.service");
const minio_service_1 = require("../services/minio.service");
const extractMetadata_1 = require("../utils/extractMetadata");
const uploadFile_1 = require("../middlewares/uploadFile");
const videoUploadPath = path_1.default.resolve(__dirname, "../../uploads");
if (!fs_1.default.existsSync(videoUploadPath)) {
    fs_1.default.mkdirSync(videoUploadPath, { recursive: true });
}
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
        if (!req.body.title || !req.body.description) {
            yield (0, uploadFile_1.deleteUploadedFile)(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Title and Description needs to be provided"
            });
        }
        const minio = new minio_service_1.MinioService();
        const isUploadedinMinio = yield minio.uploadFile(req.file.path, (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename);
        if (isUploadedinMinio) {
            const videoMetadata = yield (0, extractMetadata_1.extractVideoMetadata)(req.file.path, (_b = req.body) === null || _b === void 0 ? void 0 : _b.title, (_c = req.body) === null || _c === void 0 ? void 0 : _c.description);
            const db = new postgres_service_1.dbService();
            const uploadedVideoObjName = req.file.filename;
            const inputDbData = {
                title: videoMetadata.title,
                description: videoMetadata.description,
                filepath: uploadedVideoObjName,
                status: "in-progress",
                duration: videoMetadata.duration,
                resolution: videoMetadata.resolution
            };
            const createdVideoInstance = yield db.storeVideo(inputDbData);
            yield (0, uploadFile_1.deleteUploadedFile)(req.file.path);
            if (createdVideoInstance) {
                res.status(200).json({
                    success: true
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
//# sourceMappingURL=video.controller.js.map