
import React, { useEffect, useState, useRef } from 'react';

interface VideoBackgroundProps {
  enabled: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ enabled }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Check if video is in local storage
    const cachedVideo = localStorage.getItem('background-video-cached');
    
    if (!enabled) return;
    
    if (!cachedVideo) {
      // If not cached, we'll load the video and save a flag when it's available
      const video = videoRef.current;
      if (video) {
        const handleCanPlay = () => {
          setVideoLoaded(true);
          localStorage.setItem('background-video-cached', 'true');
        };
        
        video.addEventListener('canplaythrough', handleCanPlay);
        
        return () => {
          video.removeEventListener('canplaythrough', handleCanPlay);
        };
      }
    } else {
      // If already cached before, we can assume it will load quickly
      setVideoLoaded(true);
    }
  }, [enabled]);
  
  if (!enabled) return null;
  
  return (
    <>
      <video
        ref={videoRef}
        className={`video-background ${videoLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      {!videoLoaded && (
        <div className="fixed inset-0 bg-black z-[-1]"></div>
      )}
    </>
  );
};

export default VideoBackground;
