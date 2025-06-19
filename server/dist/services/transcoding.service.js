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
exports.TranscodingService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TranscodingService {
    transcodeVideo(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const outputDir = path_1.default.dirname(outputPath);
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir, { recursive: true });
                }
                (0, fluent_ffmpeg_1.default)()
                    .input(inputPath)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .outputOptions([
                    '-vf scale=1280:720',
                    '-preset veryfast',
                    '-b:v 2000k',
                    '-x264opts keyint=48:min-keyint=48:no-scenecut',
                    '-use_template 1',
                    '-use_timeline 1',
                    '-init_seg_name init-$RepresentationID$.m4s',
                    '-media_seg_name chunk-$RepresentationID$-$Number$.m4s',
                ])
                    .format('dash')
                    .output(outputPath)
                    .on('start', commandLine => {
                    console.log('Spawned FFmpeg with command:', commandLine);
                })
                    .on('error', (err) => {
                    console.error('Error during FFmpeg execution:', err.message);
                    reject(err);
                })
                    .on('end', () => {
                    console.log('Transcoding finished successfully');
                    resolve();
                })
                    .run();
            });
        });
    }
}
exports.TranscodingService = TranscodingService;
//# sourceMappingURL=transcoding.service.js.map