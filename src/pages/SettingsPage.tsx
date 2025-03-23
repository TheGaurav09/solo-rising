
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume, VolumeX, Trash2, LogOut, HelpCircle } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAudio } from '@/context/AudioContext';
import VideoBackgroundToggle from '@/components/ui/VideoBackgroundToggle';
import Footer from '@/components/ui/Footer';

interface SettingsPageProps {
  videoBackgroundEnabled: boolean;
  setVideoBackgroundEnabled: (enabled: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  videoBackgroundEnabled, 
  setVideoBackgroundEnabled 
}) => {
  const { volume, setVolume, toggleMute, isMuted } = useAudio();
  const navigate = useNavigate();
  const { userId } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('sb-auth-data');
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmValue !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE in all caps to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      if (!userId) {
        throw new Error("Not logged in");
      }

      // Call the admin edge function to delete the user
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'delete_user',
          userId: userId,
          password: 'admin-delete-pwd', // This would be replaced with actual secure verification
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Log out and redirect to home
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete your account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmValue('');
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 max-w-2xl">
        {/* Audio Settings */}
        <div className="bg-black/50 rounded-lg border border-white/10 p-4">
          <h2 className="text-lg font-medium mb-4">Audio Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX /> : <Volume />}
                <span>Music Volume</span>
              </div>
              <Switch checked={!isMuted} onCheckedChange={(checked) => toggleMute(!checked)} />
            </div>
            
            <div className={`${isMuted ? 'opacity-50 pointer-events-none' : ''}`}>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
        
        {/* Visual Settings */}
        <div className="bg-black/50 rounded-lg border border-white/10 p-4">
          <h2 className="text-lg font-medium mb-4">Visual Settings</h2>
          
          <div className="space-y-4">
            <VideoBackgroundToggle 
              enabled={videoBackgroundEnabled}
              onChange={setVideoBackgroundEnabled}
            />
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="bg-black/50 rounded-lg border border-white/10 p-4">
          <h2 className="text-lg font-medium mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div>
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center border-white/10 bg-transparent hover:bg-white/5"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span>Logout</span>
                <LogOut size={16} />
              </Button>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-red-500 font-medium mb-2">Danger Zone</h3>
              <p className="text-sm text-white/60 mb-4">
                Deleting your account is permanent. All data will be removed.
              </p>
              
              {!isDeleting ? (
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsDeleting(true)}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400">
                    Type <span className="font-bold">DELETE</span> to confirm account deletion:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmValue}
                    onChange={(e) => setDeleteConfirmValue(e.target.value)}
                    className="w-full p-2 bg-black/50 border border-red-500/50 rounded-md text-white"
                    placeholder="DELETE"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setIsDeleting(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmValue !== 'DELETE'}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Confirm Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SettingsPage;
