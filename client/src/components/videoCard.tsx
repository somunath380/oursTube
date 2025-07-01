import type { Video } from '../interfaces';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface VideoCardProps extends Video {
    onClick: () => void;
}

// In VideoCard.tsx
const VideoCard = ({thumbnail, title, tags, description, duration, onClick}: VideoCardProps) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchThumbnail = async () => {
            try {
                const res = await axios.get(thumbnail);
                setThumbnailUrl(res.data.data);
            } catch (err) {
                setThumbnailUrl(null);
            }
        };
        fetchThumbnail();
    }, [thumbnail]);
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
                src={thumbnailUrl || ''}
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
                <h6 className="mb-1 text-white" style={{ fontSize: 17, fontWeight: 600, textAlign: 'left', wordBreak: 'break-word' }}>{title}</h6>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 14 }}>{description}</p>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 13 }}>{tags.join(', ')}</p>
                <p className="mb-0 text-secondary" style={{ textAlign: 'left', fontSize: 13 }}>{duration}</p>
            </div>
        </div>
    );
};

export default VideoCard; 