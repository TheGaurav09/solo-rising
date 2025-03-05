
import React, { useEffect, useRef, useState } from 'react';
import MusicPlayer from './MusicPlayer';

// Music file import
const backgroundMusic = '/background-music.mp3';

interface MusicPreferences {
  isPlaying: boolean;
  isLooping: boolean;
  volume: number;
}

const AudioManager = () => {
  // State to manage music preferences
  const [musicPreferences, setMusicPreferences] = useState<MusicPreferences>(() => {
    const savedPrefs = localStorage.getItem('musicPreferences');
    return savedPrefs 
      ? JSON.parse(savedPrefs) 
      : { isPlaying: false, isLooping: false, volume: 50 };
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(backgroundMusic);
    
    // Apply saved preferences
    if (audioRef.current) {
      audioRef.current.volume = musicPreferences.volume / 100;
      audioRef.current.loop = musicPreferences.isLooping;
      
      if (musicPreferences.isPlaying) {
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      }
    }
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('musicPreferences', JSON.stringify(musicPreferences));
    
    // Apply changes to the audio element
    if (audioRef.current) {
      audioRef.current.volume = musicPreferences.volume / 100;
      audioRef.current.loop = musicPreferences.isLooping;
    }
  }, [musicPreferences]);
  
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setMusicPreferences(prev => ({ ...prev, isPlaying: true }));
        })
        .catch(err => {
          console.error("Error playing audio:", err);
        });
    }
  };
  
  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setMusicPreferences(prev => ({ ...prev, isPlaying: false }));
    }
  };
  
  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
      setMusicPreferences(prev => ({ ...prev, volume: value }));
    }
  };
  
  const handleToggleLoop = () => {
    if (audioRef.current) {
      const newLoopState = !musicPreferences.isLooping;
      audioRef.current.loop = newLoopState;
      setMusicPreferences(prev => ({ ...prev, isLooping: newLoopState }));
    }
  };
  
  return (
    <MusicPlayer 
      isPlaying={musicPreferences.isPlaying}
      isLooping={musicPreferences.isLooping}
      volume={musicPreferences.volume}
      onPlay={handlePlay}
      onPause={handlePause}
      onVolumeChange={handleVolumeChange}
      onToggleLoop={handleToggleLoop}
    />
  );
};

export default AudioManager;
