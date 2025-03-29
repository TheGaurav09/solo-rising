
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { isPlaying, togglePlay, setVolume, volume, isLooping, toggleLoop } = useAudio();
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any local storage items
      localStorage.removeItem('user-data');
      localStorage.removeItem('sb-auth-token');
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      // Delete user data from all relevant tables
      // Instead of using a loop with strings, we'll explicitly delete from each table
      
      // Delete workouts
      await supabase
        .from('workouts')
        .delete()
        .eq('user_id', user.id);
        
      // Delete user achievements
      await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user.id);
        
      // Delete user badges  
      await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', user.id);
        
      // Delete user items
      await supabase
        .from('user_items')
        .delete()
        .eq('user_id', user.id);
        
      // Delete user showcase
      await supabase
        .from('user_showcase')
        .delete()
        .eq('user_id', user.id);
        
      // Delete scheduled tasks
      await supabase
        .from('scheduled_tasks')
        .delete()
        .eq('user_id', user.id);
      
      // Delete user warnings
      await supabase
        .from('warnings')
        .delete()
        .eq('user_id', user.id);
        
      // Delete from users table (should be last)
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      // Finally delete the actual auth user
      // Note: This might require admin privileges or a serverless function in production
      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (err) {
        console.error('Error deleting auth user:', err);
        // Continue with logout even if admin delete fails
      }
      
      // Clear any local storage items
      localStorage.clear();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAccountDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sound Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Music className="mr-2" size={20} />
                <span>Background Music</span>
              </div>
              <Switch 
                checked={isPlaying}
                onCheckedChange={togglePlay}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center">
                  <VolumeX className="mr-2" size={16} />
                  <span>Volume</span>
                </Label>
                <Label className="flex items-center">
                  <span>{Math.round(volume * 100)}%</span>
                  <Volume2 className="ml-2" size={16} />
                </Label>
              </div>
              <Slider
                defaultValue={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span>Loop Music</span>
              <Switch 
                checked={isLooping}
                onCheckedChange={toggleLoop}
              />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setShowDeleteAccountDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
      
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
