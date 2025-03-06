import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { useUser } from '@/context/UserContext';
import { useAudio } from '@/context/AudioContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Music, VolumeX, Volume1, Volume2, Moon, Sun, LogOut, Pause, Play } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { userName, character, updateUserProfile } = useUser();
  const { isPlaying, volume, isLooping, togglePlay, setVolume, toggleLoop } = useAudio();
  const { theme, toggleTheme } = useTheme();
  
  const [newName, setNewName] = useState(userName);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateName = async () => {
    if (!newName.trim() || newName === userName) return;
    
    setIsUpdating(true);
    
    try {
      const success = await updateUserProfile(newName);
      if (success) {
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
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
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
        <AnimatedCard className="p-6 h-auto">
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
            
            <Button
              onClick={handleUpdateName}
              disabled={isUpdating || !newName.trim() || newName === userName}
              variant="outline"
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Name'}
            </Button>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="p-6 h-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Music size={20} />
            Music Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Label>Background Music</Label>
              <Button 
                onClick={togglePlay} 
                size="sm" 
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
              </Button>
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
        
        <AnimatedCard className="p-6 h-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            Theme Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Dark Mode</Label>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="p-6 h-auto col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
            <LogOut size={20} />
            Account Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-white/70">Manage your account settings and session.</p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to login again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default SettingsPage;
