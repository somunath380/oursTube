import React, { useState } from 'react';
import VideoPlayer from './videoPlayer';
import type { VideoCardProps } from '../interfaces';

const VideoCard: React.FC<VideoCardProps> = ({ thumbnail, title, channel, views, time }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="video-card cursor-pointer" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="position-relative rounded overflow-hidden">
                {isHovered ? (
                    <VideoPlayer 
                       src={thumbnail}
                        autoPlay={true}
                        controls={true}
                    />
                ) : (
                    <div className="video-thumbnail position-relative">
                        <VideoPlayer 
                            src={thumbnail}
                            autoPlay={false}
                            controls={true}
                        />
                    </div>
                )}
            </div>
            <div className="d-flex mt-3">
                <div className="flex-shrink-0">
                    <div className="rounded-circle bg-secondary" style={{ width: '36px', height: '36px' }}></div>
                </div>
                <div className="flex-grow-1 ms-3 text-start">
                    <h6 className="mb-1 text-white" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {title}
                    </h6>
                    <p className="mb-1 text-secondary" style={{ fontSize: '0.8rem' }}>
                        {channel}
                    </p>
                    <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>
                        {views} • {time}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard; 