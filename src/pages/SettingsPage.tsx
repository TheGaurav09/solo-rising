import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { toast } from '@/components/ui/use-toast';
import { Music, Volume2, VolumeX, Palette, UserIcon, MessageSquare, Bell, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  warrior_name: z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name must be 30 characters or less'),
});

const SettingsPage = () => {
  const { character, userName, updateUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [loopMusic, setLoopMusic] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSaveWorkouts, setAutoSaveWorkouts] = useState(true);
  const [aiAssistToggle, setAiAssistToggle] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      warrior_name: userName || '',
    },
  });

  useEffect(() => {
    reset({ warrior_name: userName || '' });
  }, [userName, reset]);

  useEffect(() => {
    // Create audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/background-music.mp3');
      audioRef.current.volume = musicVolume / 100;
      audioRef.current.loop = loopMusic;
    }

    // Load settings from localStorage
    const loadSettings = () => {
      const settings = localStorage.getItem('settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setMusicVolume(parsedSettings.musicVolume || 50);
        setLoopMusic(parsedSettings.loopMusic !== undefined ? parsedSettings.loopMusic : true);
        setEnableNotifications(parsedSettings.enableNotifications !== undefined ? parsedSettings.enableNotifications : true);
        setDarkMode(parsedSettings.darkMode !== undefined ? parsedSettings.darkMode : true);
        setAutoSaveWorkouts(parsedSettings.autoSaveWorkouts !== undefined ? parsedSettings.autoSaveWorkouts : true);
        setAiAssistToggle(parsedSettings.aiAssistToggle !== undefined ? parsedSettings.aiAssistToggle : true);
        setIsMusicPlaying(parsedSettings.isMusicPlaying || false);
      }
    };

    loadSettings();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
      audioRef.current.loop = loopMusic;
      
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
    
    // Save settings to localStorage
    const settings = {
      musicVolume,
      loopMusic,
      enableNotifications,
      darkMode,
      autoSaveWorkouts,
      aiAssistToggle,
      isMusicPlaying,
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [musicVolume, loopMusic, isMusicPlaying, enableNotifications, darkMode, autoSaveWorkouts, aiAssistToggle]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const success = await updateUserProfile(data.warrior_name);
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getAccentColor = () => {
    switch (character) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: return 'text-primary';
    }
  };

  const getButtonColor = () => {
    switch (character) {
      case 'goku': return 'bg-goku-primary hover:bg-goku-primary/90 text-black';
      case 'saitama': return 'bg-saitama-primary hover:bg-saitama-primary/90 text-black';
      case 'jin-woo': return 'bg-jin-woo-primary hover:bg-jin-woo-primary/90';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 md:grid-cols-none">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon size={16} />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music size={16} />
            <span className="hidden md:inline">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette size={16} />
            <span className="hidden md:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserIcon size={20} />
              <span>Profile Settings</span>
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="warrior_name">Warrior Name</Label>
                <Input
                  id="warrior_name"
                  {...register('warrior_name')}
                  className="bg-white/5"
                />
                {errors.warrior_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.warrior_name.message as string}</p>
                )}
              </div>
              
              <div className="pt-4">
                <AnimatedButton
                  type="submit"
                  className={getButtonColor()}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Save Profile'}
                </AnimatedButton>
              </div>
            </form>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Actions</h3>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </AnimatedCard>
        </TabsContent>
        
        <TabsContent value="audio">
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music size={20} />
              <span>Audio Settings</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Background Music</Label>
                  <button
                    onClick={toggleMusic}
                    className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm ${
                      isMusicPlaying 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isMusicPlaying ? 'Playing' : 'Paused'}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleMusic}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  
                  <span className="text-sm text-white/70">{musicVolume}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Loop Music</Label>
                  <p className="text-sm text-white/60">Repeat background music when it ends</p>
                </div>
                <Switch 
                  checked={loopMusic} 
                  onCheckedChange={setLoopMusic}
                />
              </div>
            </div>
          </AnimatedCard>
        </TabsContent>
        
        <TabsContent value="preferences">
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Palette size={20} />
              <span>App Preferences</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications</Label>
                  <p className="text-sm text-white/60">Enable push notifications</p>
                </div>
                <Switch 
                  checked={enableNotifications} 
                  onCheckedChange={setEnableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-white/60">Use dark theme for the app</p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Save Workouts</Label>
                  <p className="text-sm text-white/60">Automatically save workout progress</p>
                </div>
                <Switch 
                  checked={autoSaveWorkouts} 
                  onCheckedChange={setAutoSaveWorkouts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>AI Assistant</Label>
                  <p className="text-sm text-white/60">Enable AI workout suggestions</p>
                </div>
                <Switch 
                  checked={aiAssistToggle} 
                  onCheckedChange={setAiAssistToggle}
                />
              </div>
            </div>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
      
      {showLogoutModal && (
        <LogoutConfirmModal 
          onConfirm={handleLogout} 
          onCancel={() => setShowLogoutModal(false)}
          character={character}
        />
      )}
    </div>
  );
};

export default SettingsPage;
