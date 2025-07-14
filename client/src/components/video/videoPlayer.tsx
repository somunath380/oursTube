import { useEffect, useRef } from 'react';
import * as dashjs from 'dashjs';
import type { VideoPlayerProps } from '../../interfaces/video';

const VideoPlayer: React.FC<VideoPlayerProps & { style?: React.CSSProperties }> = ({
  src,
  autoPlay = true,
  controls = true,
  style = {},
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
      style={style}
      className="w-full max-w-3xl rounded-lg shadow"
    />
  );
};

export default VideoPlayer;