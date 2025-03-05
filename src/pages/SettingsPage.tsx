
import React, { useState } from 'react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { useAudio } from '@/context/AudioContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Music, VolumeX, Volume1, Volume2, Play, Pause } from 'lucide-react';
import Footer from '@/components/ui/Footer';

const SettingsPage = () => {
  const { warriorName, character, updateUserName } = useUser();
  const { isPlaying, volume, isLooping, togglePlay, setVolume, toggleLoop } = useAudio();
  
  const [newName, setNewName] = useState(warriorName);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateName = async () => {
    if (!newName.trim() || newName === warriorName) return;
    
    setIsUpdating(true);
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ warrior_name: newName })
          .eq('id', authData.user.id);
          
        if (error) {
          throw error;
        }
        
        updateUserName(newName);
        
        toast({
          title: "Profile Updated",
          description: "Your warrior name has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warriorName">Warrior Name</Label>
              <Input
                id="warriorName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <AnimatedButton
              onClick={handleUpdateName}
              disabled={isUpdating || !newName.trim() || newName === warriorName}
              character={character || undefined}
            >
              {isUpdating ? 'Updating...' : 'Update Name'}
            </AnimatedButton>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Music size={20} />
            Music Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Label>Background Music</Label>
              <AnimatedButton 
                onClick={togglePlay} 
                size="sm" 
                character={character || undefined}
                variant="outline"
                className="w-24"
              >
                {isPlaying ? (
                  <div className="flex items-center gap-2">
                    <Pause size={16} />
                    <span>Pause</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play size={16} />
                    <span>Play</span>
                  </div>
                )}
              </AnimatedButton>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <VolumeIcon />
                  Volume
                </Label>
                <span className="text-sm text-white/70">{Math.round(volume * 100)}%</span>
              </div>
              <Slider 
                value={[volume * 100]} 
                min={0} 
                max={100} 
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Loop Music</Label>
              <Switch 
                checked={isLooping}
                onCheckedChange={toggleLoop}
              />
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      <Footer />
    </div>
  );
};

export default SettingsPage;
