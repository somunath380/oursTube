import multer, {FileFilterCallback} from "multer"
import { Request, Response } from "express"
import path from "path"
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const videoUploadPath: string = path.resolve(__dirname, "../../uploads/raw")
if (!fs.existsSync(videoUploadPath)){
    fs.mkdirSync(videoUploadPath, {recursive: true})
}
const videoHlsPath: string = path.resolve(__dirname, "../../uploads/hls")
if (!fs.existsSync(videoHlsPath)){
    fs.mkdirSync(videoHlsPath, {recursive: true})
}

const storage = multer.diskStorage({
    destination: videoUploadPath,
    filename: function (req: Request, file: Express.Multer.File, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /mp4|mov|avi|mkv|webm/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        throw new Error("Error: Videos Only!")
    }
}

const uploadVideo = multer({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: function(req: Request, file: Express.Multer.File, cb: FileFilterCallback){
        checkFileType(file, cb);
    }
}).single('video')

async function transcodeVideo(inputPath: string, outputPath: string, resolution: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, {recursive: true})
        }

        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(err);
            ffmpeg(inputPath)
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
                    '-hls_segment_filename', path.join(outputPath, 'segment_%03d.ts')
                ])
                .videoCodec('libx264')
                .size(resolution)
                .output(path.join(outputPath, 'playlist.m3u8'))
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
}

export const uploadVideoHandler = async (req: Request, res: Response) => {
    uploadVideo(req, res, async (error) => {
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

        // Input path: where multer saved the file
        const inputPath = req.file.path;
        const baseFilename = path.parse(req.file.filename).name;
        const resolutions = [
            { path: path.resolve(__dirname, "../../uploads/hls", `720p-${baseFilename}`), resolution: '1280x720' },
            { path: path.resolve(__dirname, "../../uploads/hls", `480p-${baseFilename}`), resolution: '854x480' },
            { path: path.resolve(__dirname, "../../uploads/hls", `360p-${baseFilename}`), resolution: '640x360' }
        ];

        try {
            for (const r of resolutions) {
                await transcodeVideo(inputPath, r.path, r.resolution);
            }
            res.status(200).json({
                success: true,
                message: 'File uploaded and transcoded to HLS',
                hlsOutputs: resolutions.map(r => ({
                    resolution: r.resolution,
                    playlistUrl: `/videos/hls/${path.basename(r.path)}/playlist.m3u8`
                }))
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Transcoding failed",
                error: err instanceof Error ? err.message : err
            });
        }
    });
};
