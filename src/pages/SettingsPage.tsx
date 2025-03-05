
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { User, Music, Volume2, VolumeX, Repeat, Pause, Play, Save, UserCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import CollapsibleSection from '@/components/ui/CollapsibleSection';

interface MusicPreferences {
  playMusic: boolean;
  loop: boolean;
  volume: number;
}

const SettingsPage = () => {
  const { userName, character, updateUserName } = useUser();
  const [newUserName, setNewUserName] = useState(userName || '');
  const [isSaving, setSaving] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicPrefs, setMusicPrefs] = useState<MusicPreferences>({
    playMusic: false,
    loop: true,
    volume: 50
  });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('musicPreferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setMusicPrefs(prefs);
      } catch (err) {
        console.error("Error loading music preferences", err);
      }
    }
  }, []);

  // Initialize audio
  useEffect(() => {
    const audioElement = new Audio('/background-music.mp3');
    setAudio(audioElement);
    
    return () => {
      audioElement.pause();
      audioElement.src = '';
    };
  }, []);

  // Apply preferences to audio
  useEffect(() => {
    if (audio) {
      audio.loop = musicPrefs.loop;
      audio.volume = musicPrefs.volume / 100;
      
      if (musicPrefs.playMusic && !isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Error playing audio:", err);
        });
      } else if (!musicPrefs.playMusic && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    }
    
    // Save preferences to localStorage
    localStorage.setItem('musicPreferences', JSON.stringify(musicPrefs));
  }, [audio, musicPrefs, isPlaying]);

  const handleSaveProfile = async () => {
    if (!newUserName.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('users')
        .update({ warrior_name: newUserName })
        .eq('id', userData.user.id);

      if (error) throw error;

      // Update context
      updateUserName(newUserName);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePlayMusic = () => {
    setMusicPrefs({
      ...musicPrefs,
      playMusic: !musicPrefs.playMusic
    });
  };

  const toggleLoopMusic = () => {
    setMusicPrefs({
      ...musicPrefs,
      loop: !musicPrefs.loop
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    setMusicPrefs({
      ...musicPrefs,
      volume
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CollapsibleSection title="Profile Settings" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/30` : 'bg-primary/30'}`}>
                  <UserCircle className={character ? `text-${character}-primary` : 'text-primary'} size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{userName}</h2>
                  <p className="text-white/70">Edit your profile details below</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Warrior Name</Label>
                <div className="flex gap-2">
                  <input
                    id="userName"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your warrior name"
                  />
                </div>
              </div>

              <AnimatedButton
                onClick={handleSaveProfile}
                disabled={isSaving || !newUserName.trim() || newUserName === userName}
                character={character || undefined}
                className="mt-4"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </AnimatedButton>
            </div>
          </CollapsibleSection>
        </div>

        <div>
          <CollapsibleSection title="Music Settings" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={20} />
                  <span>Background Music</span>
                </div>
                <AnimatedButton
                  variant="outline"
                  onClick={togglePlayMusic}
                  character={character || undefined}
                  size="sm"
                >
                  {musicPrefs.playMusic ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </AnimatedButton>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume">Volume</Label>
                  <div className="flex items-center gap-2">
                    {musicPrefs.volume > 0 ? (
                      <Volume2 size={18} className="text-white/70" />
                    ) : (
                      <VolumeX size={18} className="text-white/70" />
                    )}
                    <span className="text-sm text-white/70">{musicPrefs.volume}%</span>
                  </div>
                </div>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={musicPrefs.volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat size={20} />
                  <span>Loop Music</span>
                </div>
                <div 
                  onClick={toggleLoopMusic}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                    musicPrefs.loop 
                      ? character ? `bg-${character}-primary` : 'bg-primary'
                      : 'bg-white/10'
                  }`}
                >
                  <div 
                    className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      musicPrefs.loop ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="text-sm text-white/70 mt-4">
                <p>Music settings are automatically saved and will be applied when you visit the site again.</p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
