
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MusicPlayerProps {
  isPlaying: boolean;
  isLooping: boolean;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onVolumeChange: (value: number) => void;
  onToggleLoop: () => void;
}

const MusicPlayer = ({ 
  isPlaying, 
  isLooping,
  volume, 
  onPlay, 
  onPause, 
  onVolumeChange,
  onToggleLoop
}: MusicPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(volume);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  return (
    <div className="p-4 glass-card flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Background Music</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleLoop}
          className={isLooping ? "bg-white/20" : ""}
        >
          <Repeat size={16} className={isLooping ? "text-primary" : "text-white/70"} />
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <SkipBack size={16} />
        </Button>
        
        <Button 
          onClick={isPlaying ? onPause : onPlay} 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 flex items-center justify-center"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <SkipForward size={16} />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="h-6 w-6">
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
        <Slider 
          value={[volume]} 
          max={100} 
          step={1}
          onValueChange={(values) => onVolumeChange(values[0])} 
          className="flex-1" 
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
