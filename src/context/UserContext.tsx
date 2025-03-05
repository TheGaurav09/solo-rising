
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type CharacterType = 'goku' | 'saitama' | 'jin-woo' | null;

interface UserContextType {
  character: CharacterType;
  setCharacter: (character: CharacterType) => void;
  userName: string;
  setUserName: (name: string) => void;
  hasSelectedCharacter: boolean;
  points: number;
  addPoints: (amount: number) => void;
  coins: number;
  addCoins: (amount: number) => void;
  useCoins: (amount: number) => Promise<boolean>;
  streak: number;
  incrementStreak: () => void;
  resetStreak: () => void;
  lastWorkoutDate: string | null;
  updateLastWorkoutDate: () => void;
  country: string;
  setCountry: (country: string) => void;
  updateUserProfile: (name: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<CharacterType>(null);
  const [userName, setUserName] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [country, setCountry] = useState<string>('Global');

  // Load user data from Supabase on initial render
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (data && !error) {
            setCharacter(data.character_type as CharacterType);
            setUserName(data.warrior_name);
            setPoints(data.points || 0);
            setCoins(data.coins || 0);
            setStreak(data.streak || 0);
            setLastWorkoutDate(data.last_workout_date || null);
            setCountry(data.country || 'Global');
            setHasSelectedCharacter(true);
          } else if (error) {
            console.error("Error fetching user data:", error);
            toast({
              title: "Error",
              description: "Failed to load user data. Please try refreshing the page.",
              variant: "destructive",
            });
          }
        } else {
          // Fallback to localStorage if not authenticated
          const storedCharacter = localStorage.getItem('character');
          const storedUserName = localStorage.getItem('userName');
          const storedPoints = localStorage.getItem('points');
          const storedCoins = localStorage.getItem('coins');
          const storedStreak = localStorage.getItem('streak');
          const storedLastWorkoutDate = localStorage.getItem('lastWorkoutDate');
          const storedCountry = localStorage.getItem('country');
          
          if (storedCharacter) {
            setCharacter(storedCharacter as CharacterType);
            setHasSelectedCharacter(true);
          }
          
          if (storedUserName) {
            setUserName(storedUserName);
          }
          
          if (storedPoints) {
            setPoints(parseInt(storedPoints, 10));
          }

          if (storedCoins) {
            setCoins(parseInt(storedCoins, 10));
          }

          if (storedStreak) {
            setStreak(parseInt(storedStreak, 10));
          }

          if (storedLastWorkoutDate) {
            setLastWorkoutDate(storedLastWorkoutDate);
          }
          
          if (storedCountry) {
            setCountry(storedCountry);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user data when signed in
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data && !error) {
          setCharacter(data.character_type as CharacterType);
          setUserName(data.warrior_name);
          setPoints(data.points || 0);
          setCoins(data.coins || 0); 
          setStreak(data.streak || 0);
          setLastWorkoutDate(data.last_workout_date || null);
          setCountry(data.country || 'Global');
          setHasSelectedCharacter(true);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear user data when signed out
        setCharacter(null);
        setUserName('');
        setPoints(0);
        setCoins(0);
        setStreak(0);
        setLastWorkoutDate(null);
        setCountry('Global');
        setHasSelectedCharacter(false);
      }
    });

    // Streak check
    const checkStreak = () => {
      if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last workout was more than a day ago (not yesterday or today), reset streak
        if (lastDate.toDateString() !== today.toDateString() && 
            lastDate.toDateString() !== yesterday.toDateString()) {
          resetStreak();
        }
      }
    };
    
    checkStreak();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Save user data to localStorage and Supabase when state changes
  useEffect(() => {
    const updateUserData = async () => {
      if (!character || !userName) return;

      // Save to localStorage
      localStorage.setItem('character', character);
      localStorage.setItem('userName', userName);
      localStorage.setItem('points', points.toString());
      localStorage.setItem('coins', coins.toString());
      localStorage.setItem('streak', streak.toString());
      localStorage.setItem('country', country);
      if (lastWorkoutDate) {
        localStorage.setItem('lastWorkoutDate', lastWorkoutDate);
      }

      // If authenticated, update Supabase
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { error } = await supabase
            .from('users')
            .update({ 
              character_type: character,
              warrior_name: userName,
              points,
              coins,
              streak,
              last_workout_date: lastWorkoutDate,
              country
            })
            .eq('id', authData.user.id);
            
          if (error) {
            console.error("Error updating user data:", error);
            toast({
              title: "Error",
              description: "Failed to save your progress. Please try again.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error in updateUserData:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while saving your data.",
          variant: "destructive",
        });
      }
    };

    updateUserData();
  }, [character, userName, points, coins, streak, lastWorkoutDate, country]);

  const addPoints = async (amount: number) => {
    try {
      const newPoints = points + amount;
      setPoints(newPoints);
      
      // Also add coins (10% of points earned)
      const coinsToAdd = Math.floor(amount * 0.1);
      if (coinsToAdd > 0) {
        addCoins(coinsToAdd);
      }
      
      // Update points in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating points:", error);
          toast({
            title: "Error",
            description: "Failed to update points. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in addPoints:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding points.",
        variant: "destructive",
      });
    }
  };

  const addCoins = async (amount: number) => {
    try {
      const newCoins = coins + amount;
      setCoins(newCoins);
      
      // Update coins in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ coins: newCoins })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating coins:", error);
          toast({
            title: "Error",
            description: "Failed to update coins. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in addCoins:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding coins.",
        variant: "destructive",
      });
    }
  };

  const useCoins = async (amount: number): Promise<boolean> => {
    try {
      if (coins < amount) return false;
      
      const newCoins = coins - amount;
      setCoins(newCoins);
      
      // Update coins in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ coins: newCoins })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating coins:", error);
          toast({
            title: "Error",
            description: "Failed to use coins. Please try again.",
            variant: "destructive",
          });
          setCoins(coins); // Revert if update fails
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in useCoins:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while using coins.",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementStreak = async () => {
    try {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Update streak in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ streak: newStreak })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating streak:", error);
          toast({
            title: "Error",
            description: "Failed to update streak. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in incrementStreak:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating streak.",
        variant: "destructive",
      });
    }
  };

  const resetStreak = async () => {
    try {
      setStreak(0);
      
      // Update streak in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ streak: 0 })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error resetting streak:", error);
          toast({
            title: "Error",
            description: "Failed to reset streak. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in resetStreak:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while resetting streak.",
        variant: "destructive",
      });
    }
  };

  const updateLastWorkoutDate = async () => {
    try {
      const today = new Date().toISOString();
      setLastWorkoutDate(today);
      
      // If last workout was not today, increment streak
      if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        const currentDate = new Date();
        
        if (lastDate.toDateString() !== currentDate.toDateString()) {
          incrementStreak();
        }
      } else {
        // First workout, start streak
        incrementStreak();
      }
      
      // Update last_workout_date in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ last_workout_date: today })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating last workout date:", error);
          toast({
            title: "Error",
            description: "Failed to update workout date. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in updateLastWorkoutDate:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating workout date.",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (newName: string): Promise<boolean> => {
    try {
      if (!newName.trim()) {
        toast({
          title: "Error",
          description: "Name cannot be empty",
          variant: "destructive",
        });
        return false;
      }
      
      setUserName(newName);
      
      // Update name in Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ warrior_name: newName })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating name:", error);
          toast({
            title: "Error",
            description: "Failed to update name. Please try again.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your profile.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        character, 
        setCharacter, 
        userName, 
        setUserName, 
        hasSelectedCharacter, 
        points, 
        addPoints,
        coins,
        addCoins,
        useCoins,
        streak,
        incrementStreak,
        resetStreak,
        lastWorkoutDate,
        updateLastWorkoutDate,
        country,
        setCountry,
        updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
