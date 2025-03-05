
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, User, Music, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AudioManager from '@/components/audio/AudioManager';

const SettingsPage = () => {
  const { userName, updateUserProfile } = useUser();
  const [name, setName] = useState(userName);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!name.trim() || name === userName) return;
    
    setIsUpdating(true);
    try {
      const success = await updateUserProfile(name);
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile name has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Settings
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userName" className="block text-sm font-medium">
                Warrior Name
              </label>
              <Input
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isUpdating || !name.trim() || name === userName}
              className="w-full"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Music className="h-5 w-5" />
            Audio Settings
          </h2>
          
          <AudioManager />
        </AnimatedCard>
      </div>
    </div>
  );
};

export default SettingsPage;
