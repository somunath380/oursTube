import ffmpeg from 'fluent-ffmpeg';
import { videoMetadataInterface } from '../interfaces/videoMetadataInterface';

export function extractVideoMetadata(
        filepath: string,
        title: string,
        description: string
    ): Promise<videoMetadataInterface> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filepath, (err, metadata) => {
        if (err) return reject(err);

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
    });
}