// components/DashPlayer.tsx
import { useEffect, useRef } from 'react';
import * as dashjs from 'dashjs';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = true,
  controls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, src, autoPlay);
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      className="w-full max-w-3xl rounded-lg shadow"
    />
  );
};

export default VideoPlayer;
