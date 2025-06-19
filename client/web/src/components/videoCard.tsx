import VideoPlayer from './videoPlayer';
import type { Video } from '../interfaces';

const VideoCard = ({ thumbnail, title, channel, views, time }: Video) => {

    return (
        <div className="video-card cursor-pointer">
            <div className="video-thumbnail position-relative">
                <VideoPlayer
                    src={thumbnail}
                    autoPlay={false}
                    controls={true}
                />
            </div>
            <div className="d-flex">
                <div className="flex-shrink-0">
                    <div className="rounded-circle bg-secondary" style={{ width: '36px', height: '36px' }}></div>
                </div>
                <div className="flex-grow-1 ms-3 text-start">
                    <h6 className="mb-1 text-white">{title}</h6>
                    <p className="mb-0 text-secondary">{channel}</p>
                    <p className="mb-0 text-secondary"> {views} • {time}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard; 