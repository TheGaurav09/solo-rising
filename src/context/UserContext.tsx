import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type CharacterType = 'goku' | 'saitama' | 'jin-woo' | null;

interface UserContextType {
  character: CharacterType;
  userName: string;
  country: string;
  points: number;
  coins: number;
  streak: number;
  lastWorkoutDate: string | null;
  hasSelectedCharacter: boolean;
  setCharacter: (character: CharacterType) => void;
  setUserName: (name: string) => void;
  setCountry: (country: string) => void;
  addPoints: (points: number) => void;
  useCoins: (amount: number) => Promise<boolean>;
  checkForAchievements: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<CharacterType>(null);
  const [userName, setUserName] = useState('');
  const [country, setCountry] = useState('Global');
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage first for faster UI display
    const storedCharacter = localStorage.getItem('character');
    const storedUserName = localStorage.getItem('userName');
    const storedCountry = localStorage.getItem('country');
    const storedPoints = localStorage.getItem('points');
    const storedCoins = localStorage.getItem('coins');
    const storedStreak = localStorage.getItem('streak');
    const storedLastWorkoutDate = localStorage.getItem('lastWorkoutDate');
    
    if (storedCharacter) setCharacter(storedCharacter as CharacterType);
    if (storedUserName) setUserName(storedUserName);
    if (storedCountry) setCountry(storedCountry);
    if (storedPoints) setPoints(parseInt(storedPoints));
    if (storedCoins) setCoins(parseInt(storedCoins));
    if (storedStreak) setStreak(parseInt(storedStreak));
    if (storedLastWorkoutDate) setLastWorkoutDate(storedLastWorkoutDate);
    
    // Then check Supabase for the latest data
    const fetchUserData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
            
          if (error) throw error;
          
          if (userData) {
            setCharacter(userData.character_type as CharacterType);
            setUserName(userData.warrior_name);
            if (userData.country) setCountry(userData.country);
            setPoints(userData.points || 0);
            setCoins(userData.coins || 0);
            setStreak(userData.streak || 0);
            setLastWorkoutDate(userData.last_workout_date);
            
            // Update localStorage for faster loading next time
            localStorage.setItem('character', userData.character_type);
            localStorage.setItem('userName', userData.warrior_name);
            localStorage.setItem('country', userData.country || 'Global');
            localStorage.setItem('points', String(userData.points || 0));
            localStorage.setItem('coins', String(userData.coins || 0));
            localStorage.setItem('streak', String(userData.streak || 0));
            if (userData.last_workout_date) {
              localStorage.setItem('lastWorkoutDate', userData.last_workout_date);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const addPoints = async (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    
    try {
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
          setPoints(points);
          return;
        }
        
        // Update localStorage
        localStorage.setItem('points', String(newPoints));
        
        // Add some coins for gaining points (1 coin per 10 points)
        if (amount > 0) {
          const coinsToAdd = Math.floor(amount / 10);
          if (coinsToAdd > 0) {
            // Update coins
            const newCoins = coins + coinsToAdd;
            setCoins(newCoins);
            
            const { error: coinsError } = await supabase
              .from('users')
              .update({ coins: newCoins })
              .eq('id', authData.user.id);
              
            if (!coinsError) {
              localStorage.setItem('coins', String(newCoins));
              toast({
                title: "Coins Earned",
                description: `You earned ${coinsToAdd} coins for your workout!`,
                duration: 3000,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in addPoints:", error);
    }
  };

  const useCoins = async (amount: number): Promise<boolean> => {
    try {
      if (coins < amount) return false;
      
      const newCoins = coins - amount;
      setCoins(newCoins);
      
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
          setCoins(coins);
          return false;
        }

        // Log the transaction for debugging
        console.log(`Successfully used ${amount} coins. New balance: ${newCoins}`);
        
        // Check for achievement unlocks based on spending coins
        checkForAchievements();
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

  const checkForAchievements = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      
      // Get all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
        
      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
        return;
      }
      
      // Check if user meets requirements for any achievements
      for (const achievement of achievements) {
        if (points >= achievement.points_required) {
          // Check if achievement already unlocked
          const { data: existingAchievement, error: checkError } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('achievement_id', achievement.id)
            .maybeSingle();
            
          if (checkError) {
            console.error("Error checking existing achievement:", checkError);
            continue;
          }
          
          // If not already unlocked, add it
          if (!existingAchievement) {
            const { error: unlockError } = await supabase
              .from('user_achievements')
              .insert({
                user_id: authData.user.id,
                achievement_id: achievement.id
              });
              
            if (unlockError) {
              console.error("Error unlocking achievement:", unlockError);
              continue;
            }
            
            // Notify user
            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.name}: ${achievement.description}`,
              duration: 5000,
            });
            
            // Log for debugging
            console.log(`Achievement unlocked: ${achievement.name}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in checkForAchievements:", error);
    }
  };

  const updateUserProfile = async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid name",
          variant: "destructive",
        });
        return false;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return false;

      const { error } = await supabase
        .from('users')
        .update({ warrior_name: name.trim() })
        .eq('id', authData.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setUserName(name.trim());
      localStorage.setItem('userName', name.trim());
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating profile",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <UserContext.Provider 
      value={{
        character,
        userName,
        country,
        points,
        coins,
        streak,
        lastWorkoutDate,
        hasSelectedCharacter: !!character,
        setCharacter,
        setUserName,
        setCountry,
        addPoints,
        useCoins,
        checkForAchievements,
        updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
