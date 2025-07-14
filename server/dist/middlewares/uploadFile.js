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
exports.deleteUploadedFile = exports.uploadVideo = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const promises_1 = require("fs/promises");
const console_1 = require("console");
const baseVideoUploadPath = path_1.default.resolve(__dirname, "../../uploads");
if (!fs_1.default.existsSync(baseVideoUploadPath)) {
    fs_1.default.mkdirSync(baseVideoUploadPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uniqueId = (0, uuid_1.v4)();
        const fileDetails = path_1.default.parse(file.originalname);
        const uniqueFolderName = path_1.default.join(baseVideoUploadPath, (fileDetails.name + uniqueId));
        if (!fs_1.default.existsSync(uniqueFolderName)) {
            fs_1.default.mkdirSync(uniqueFolderName, { recursive: true });
        }
        req.uniqueId = uniqueId;
        cb(null, uniqueFolderName);
    },
    filename: (req, file, cb) => {
        const uniqueId = req.uniqueId;
        const fileDetails = path_1.default.parse(file.originalname);
        const uniqueFilename = fileDetails.name + uniqueId + fileDetails.ext;
        cb(null, uniqueFilename);
    }
});
exports.uploadVideo = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
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
const deleteUploadedFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileType = yield fs_1.default.promises.lstat(filePath);
        if (fileType.isDirectory()) {
            yield fs_1.default.promises.rm(filePath, { recursive: true, force: true });
            (0, console_1.log)(`folder at path ${filePath} deleted successfully`);
        }
        else {
            yield (0, promises_1.unlink)(filePath);
            (0, console_1.log)(`file at path ${filePath} deleted successfully`);
        }
    }
    catch (error) {
        console.error("failed to delete file on path: ", filePath);
    }
});
exports.deleteUploadedFile = deleteUploadedFile;
//# sourceMappingURL=uploadFile.js.map