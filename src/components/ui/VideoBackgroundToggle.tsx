
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface VideoBackgroundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const VideoBackgroundToggle: React.FC<VideoBackgroundToggleProps> = ({
  enabled,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
      <div>
        <h3 className="font-medium">Video Background</h3>
        <p className="text-sm text-white/60">
          Enable animated background effects
        </p>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={onChange} 
      />
    </div>
  );
};

export default VideoBackgroundToggle;
