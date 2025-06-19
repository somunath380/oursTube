import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from "path"

export const transcodeVideo = async (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        ffmpeg()
            .input(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            // .size('1280x720')    // for resolution
            .outputOptions([
                '-vf scale=1280:720',        // Scale to 720p
                '-preset veryfast',          // Optional: speeds up encoding
                '-b:v 2000k',                // Bitrate for video
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
}