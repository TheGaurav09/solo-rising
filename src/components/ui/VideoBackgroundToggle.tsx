
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface VideoBackgroundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const VideoBackgroundToggle: React.FC<VideoBackgroundToggleProps> = ({ 
  enabled, 
  onChange 
}) => {
  return (
    <div className="flex items-center justify-between space-y-2">
      <Label htmlFor="video-background" className="text-white">Video Background</Label>
      <Switch
        id="video-background"
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default VideoBackgroundToggle;
