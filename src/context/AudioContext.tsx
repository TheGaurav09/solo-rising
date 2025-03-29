
import React, { createContext, useContext, useState, useEffect } from 'react';

type AudioContextType = {
  isPlaying: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  currentTrack: string | null;
  setTrack: (track: string) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.5);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for audio preferences
    const savedVolume = localStorage.getItem('audio-volume');
    const savedPlaying = localStorage.getItem('audio-playing');
    const savedTrack = localStorage.getItem('audio-track');
    
    if (savedVolume !== null) {
      setVolumeState(parseFloat(savedVolume));
    }
    
    if (savedTrack) {
      setCurrentTrack(savedTrack);
    }
    
    // Create audio element
    const audio = new Audio();
    audio.loop = true;
    audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
    
    if (savedTrack) {
      audio.src = savedTrack;
    } else {
      audio.src = '/background-music.mp3';
    }
    
    setAudioElement(audio);
    
    // Start playing if it was playing before
    if (savedPlaying === 'true') {
      audio.play().catch(e => {
        console.error("Error auto-playing audio:", e);
        // Don't update isPlaying state here as browsers may block autoplay
      });
      setIsPlaying(true);
    }
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const togglePlay = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      localStorage.setItem('audio-playing', 'false');
    } else {
      audioElement.play().catch(e => {
        console.error("Error playing audio:", e);
        // Some browsers require user interaction before playing audio
        toast("Click again to play music");
      });
      setIsPlaying(true);
      localStorage.setItem('audio-playing', 'true');
    }
  };

  const setVolume = (newVolume: number) => {
    if (!audioElement) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioElement.volume = clampedVolume;
    setVolumeState(clampedVolume);
    localStorage.setItem('audio-volume', clampedVolume.toString());
  };

  const setTrack = (track: string) => {
    if (!audioElement) return;
    
    const wasPlaying = isPlaying;
    
    // Save the current time if we're just changing tracks
    const currentTime = audioElement.currentTime;
    
    // Pause before changing source
    audioElement.pause();
    
    audioElement.src = track;
    setCurrentTrack(track);
    localStorage.setItem('audio-track', track);
    
    // Resume playback if it was playing before
    if (wasPlaying) {
      audioElement.play().catch(e => console.error("Error playing new track:", e));
    }
  };

  const toast = (message: string) => {
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-md z-50';
    toastElement.textContent = message;
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 500);
    }, 3000);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay, setVolume, currentTrack, setTrack }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
