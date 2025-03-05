import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { useUser, CharacterType } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import CharacterSelection from './CharacterSelection';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCharacter, setLoadingCharacter] = useState(false);
  const { setUserData, session } = useUser();
  const [characterSelected, setCharacterSelected] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !userName) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: userName,
              points: 0,
              coins: 0,
            }
          }
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (data?.user) {
          setUserData({
            userName: data.user.user_metadata.user_name,
            points: data.user.user_metadata.points,
            coins: data.user.user_metadata.coins,
          });
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email to verify your account.",
          });
          onClose();
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Fetch user data from the 'users' table
          const { data: userDetails, error: userDetailsError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userDetailsError) {
            console.error("Error fetching user details:", userDetailsError);
            toast({
              title: "Error",
              description: "Failed to fetch user details.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          setUserData({
            userName: userDetails?.warrior_name || data.user.email,
            points: userDetails?.points || 0,
            character: userDetails?.character_type || null,
            coins: userDetails?.coins || 0,
          });
          
          if (!userDetails?.character_type) {
            navigate('/character-selection');
          }
          
          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
          onClose();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ensure CharacterType is properly used for character selection
  const handleCharacterSelect = async (character: string) => {
    try {
      setLoadingCharacter(true);
      
      // Update character count in the database
      const { error: countError } = await supabase
        .from('character_counts')
        .insert({ character_type: character });
        
      if (countError) {
        console.error("Error updating character count:", countError);
      }
      
      // Update user data with the selected character
      const { error: updateError } = await supabase
        .from('users')
        .update({ character_type: character })
        .eq('id', session?.user.id);
        
      if (updateError) {
        console.error("Error updating user character:", updateError);
        toast({
          title: "Error",
          description: "Could not update character selection",
          variant: "destructive",
        });
        return;
      }
      
      // Update user context with the new character
      setUserData({ 
        character: character as CharacterType, 
        points: userData.points,
        userName: userData.userName,
        coins: userData.coins
      });
      
      setCharacterSelected(true);
      onClose();
    } catch (error) {
      console.error("Error in handleCharacterSelect:", error);
    } finally {
      setLoadingCharacter(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Create account' : 'Login'}</DialogTitle>
          <DialogDescription>
            {isSignUp ? 'Create a new account' : 'Login to your account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">User name</Label>
                <Input
                  type="text"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Create account' : 'Login')}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(true)}
              >
                Create one
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
