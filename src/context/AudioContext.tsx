
import React, { createContext, useState, useContext, useEffect } from 'react';

type AudioContextType = {
  isPlaying: boolean;
  volume: number;
  isLooping: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audio] = useState(new Audio('/background-music.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isLooping, setIsLooping] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('audio-volume');
    const savedIsLooping = localStorage.getItem('audio-looping');
    const savedIsPlaying = localStorage.getItem('audio-playing');

    if (savedVolume) setVolumeState(parseFloat(savedVolume));
    if (savedIsLooping) setIsLooping(savedIsLooping === 'true');
    if (savedIsPlaying) {
      const shouldPlay = savedIsPlaying === 'true';
      setIsPlaying(shouldPlay);
      if (shouldPlay) audio.play().catch(e => console.error("Audio playback error:", e));
    }
  }, [audio]);

  // Update audio settings when state changes
  useEffect(() => {
    audio.volume = volume;
    audio.loop = isLooping;
    
    localStorage.setItem('audio-volume', volume.toString());
    localStorage.setItem('audio-looping', isLooping.toString());
    localStorage.setItem('audio-playing', isPlaying.toString());
    
    if (isPlaying) {
      audio.play().catch(e => console.error("Audio playback error:", e));
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [isPlaying, volume, isLooping, audio]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        isLooping,
        togglePlay,
        setVolume,
        toggleLoop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
