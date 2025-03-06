
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

type AudioContextType = {
  isPlaying: boolean;
  volume: number;
  isLooping: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3); // Default to a lower volume
  const [isLooping, setIsLooping] = useState(false);
  const { character } = useUser();

  // Set the audio source based on character
  useEffect(() => {
    if (character) {
      switch (character) {
        case 'goku':
          audio.src = '/goku-bgm.mp3';
          break;
        case 'saitama':
          audio.src = '/saitama.mp3';
          break;
        case 'jin-woo':
          audio.src = '/jinwoo.mp3';
          break;
        default:
          audio.src = '/background-music.mp3';
          break;
      }
      
      if (isPlaying) {
        audio.play().catch(e => console.error("Audio playback error:", e));
      }
    } else {
      audio.src = '/background-music.mp3';
    }
  }, [character, audio, isPlaying]);

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

  const playAudio = () => {
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    setIsPlaying(false);
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
        playAudio,
        pauseAudio,
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
