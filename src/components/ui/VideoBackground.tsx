
import React, { useEffect, useState } from 'react';

interface VideoBackgroundProps {
  enabled: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ enabled }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (enabled) {
      // Add a small delay to allow for smooth transitions
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div 
      className={`fixed top-0 left-0 w-full h-full z-[-1] transition-opacity duration-700 ${
        isVisible ? 'opacity-30' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900 z-10"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/80 z-20"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute min-w-full min-h-full object-cover"
        >
          <source src="/background-animation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoBackground;
