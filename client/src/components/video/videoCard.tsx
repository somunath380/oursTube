import type { VideoCardProps } from '../../interfaces/video';

// In VideoCard.tsx
const VideoCard = ({thumbnail, title, tags, description, duration, onClick}: VideoCardProps) => {
    const formatVideoDuration = (durationSeconds: number) => {
        if (!durationSeconds) return '0:00:00';
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    const formatTexts = (text: string) => {
        if (!text) return ""
        return text
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase()+word.slice(1))
            .join(" ")
    }
    
    return (
        <div
            className="video-card cursor-pointer"
            onClick={onClick}
            style={{
                border: '1px solid #333',
                borderRadius: 12,
                padding: 0,
                width: '100%',           // Fills the column
                background: '#181818',
                marginBottom: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <img
                src={thumbnail}
                alt={title}
                style={{
                    width: '100%',
                    height: 180, // 16:9 aspect ratio
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    display: 'block'
                }}
            />
            <div style={{ padding: '12px 16px' }}>
                <h6 className="mb-1 text-white" style={{ fontSize: 17, fontWeight: 600, textAlign: 'left', wordBreak: 'break-word' }}>{formatTexts(title)}</h6>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 14 }}>{formatTexts(description)}</p>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 13 }}>{tags.join(', ')}</p>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 13 }}>{formatVideoDuration(duration)}</p>
            </div>
        </div>
    );
};

export default VideoCard; 