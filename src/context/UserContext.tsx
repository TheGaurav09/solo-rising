
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
  const [isInitialized, setIsInitialized] = useState(false);

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
        if (!authData || !authData.user) {
          console.log("No authenticated user found");
          // Clear context if no user is found
          if (storedCharacter || storedUserName) {
            localStorage.clear(); // Clear all localStorage if there's stale data
            setCharacter(null);
            setUserName('');
            setCountry('Global');
            setPoints(0);
            setCoins(0);
            setStreak(0);
            setLastWorkoutDate(null);
          }
          setIsInitialized(true);
          return;
        }
        
        console.log("Fetching user data for:", authData.user.id);
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching user data:", error);
          setIsInitialized(true);
          throw error;
        }
        
        if (userData) {
          console.log("User data retrieved:", userData);
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
          
          // Check for achievements after fetching user data
          await checkForAchievements();
        } else {
          console.log("No user data found for ID:", authData.user.id);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setIsInitialized(true);
      }
    };
    
    fetchUserData();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        // Clear all user data on sign out
        localStorage.clear();
        setCharacter(null);
        setUserName('');
        setCountry('Global');
        setPoints(0);
        setCoins(0);
        setStreak(0);
        setLastWorkoutDate(null);
      } else if (event === 'SIGNED_IN' && session) {
        // Refetch user data on sign in
        fetchUserData();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleCharacterUpdate = async (newCharacter: CharacterType) => {
    setCharacter(newCharacter);
    localStorage.setItem('character', newCharacter as string);
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ character_type: newCharacter })
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating character:", error);
          toast({
            title: "Error",
            description: "Failed to update character. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Update character count in database
        if (newCharacter) {
          const { data, error: countError } = await supabase
            .from('character_counts')
            .select('*')
            .eq('character_type', newCharacter)
            .single();
            
          if (countError && countError.code !== 'PGRST116') {
            console.error("Error checking character count:", countError);
          }
          
          if (data) {
            // Update existing count
            const { error: updateError } = await supabase
              .from('character_counts')
              .update({ count: data.count + 1 })
              .eq('id', data.id);
              
            if (updateError) {
              console.error("Error updating character count:", updateError);
            }
          } else {
            // Insert new count
            const { error: insertError } = await supabase
              .from('character_counts')
              .insert({ character_type: newCharacter, count: 1 });
              
            if (insertError) {
              console.error("Error inserting character count:", insertError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in handleCharacterUpdate:", error);
    }
  };

  const addPoints = async (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    localStorage.setItem('points', String(newPoints));
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        // Use RPC function to atomically increment points
        const { error } = await supabase
          .rpc('increment_points', { 
            id_param: authData.user.id,
            amount_param: amount 
          });
          
        if (error) {
          console.error("Error updating points:", error);
          toast({
            title: "Error",
            description: "Failed to update points. Please try again.",
            variant: "destructive",
          });
          setPoints(points);
          localStorage.setItem('points', String(points));
          return;
        }
        
        // Add some coins for gaining points (1 coin per 10 points)
        if (amount > 0) {
          const coinsToAdd = Math.floor(amount / 10);
          if (coinsToAdd > 0) {
            // Update coins
            const newCoins = coins + coinsToAdd;
            setCoins(newCoins);
            localStorage.setItem('coins', String(newCoins));
            
            const { error: coinsError } = await supabase
              .rpc('increment_coins', {
                id_param: authData.user.id,
                amount_param: coinsToAdd
              });
              
            if (coinsError) {
              console.error("Error updating coins:", coinsError);
              setCoins(coins);
              localStorage.setItem('coins', String(coins));
            } else {
              toast({
                title: "Coins Earned",
                description: `You earned ${coinsToAdd} coins for your workout!`,
                duration: 3000,
              });
            }
          }
        }
        
        // Check for achievement unlocks
        await checkForAchievements();
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
      localStorage.setItem('coins', String(newCoins));
      
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .rpc('decrement_coins', {
            id_param: authData.user.id,
            amount_param: amount
          });
          
        if (error) {
          console.error("Error updating coins:", error);
          toast({
            title: "Error",
            description: "Failed to use coins. Please try again.",
            variant: "destructive",
          });
          setCoins(coins);
          localStorage.setItem('coins', String(coins));
          return false;
        }

        // Log the transaction for debugging
        console.log(`Successfully used ${amount} coins. New balance: ${newCoins}`);
        
        // Check for achievement unlocks based on spending coins
        await checkForAchievements();
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
        .select('*')
        .order('points_required', { ascending: true });
        
      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
        return;
      }
      
      // Get currently unlocked achievements
      const { data: existingAchievements, error: existingError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', authData.user.id);
      
      if (existingError) {
        console.error("Error fetching existing achievements:", existingError);
        return;
      }
      
      // Create a set of unlocked achievement IDs for faster lookup
      const unlockedAchievementIds = new Set(
        existingAchievements?.map(ua => ua.achievement_id) || []
      );
      
      // Check for new achievements to unlock
      const achievementsToUnlock = achievements?.filter(achievement => 
        !unlockedAchievementIds.has(achievement.id) && 
        points >= achievement.points_required
      ) || [];
      
      // Unlock any newly qualified achievements
      for (const achievement of achievementsToUnlock) {
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
      
      // Now check for badges
      // This is a simplified version - more complex criteria would be checked in a real app
      const { data: workoutsCount, error: workoutsError } = await supabase
        .from('workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authData.user.id);
      
      if (workoutsError) {
        console.error("Error fetching workouts count:", workoutsError);
      }
      
      // Get existing badges
      const { data: existingBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', authData.user.id);
      
      if (badgesError) {
        console.error("Error fetching existing badges:", badgesError);
      }
      
      const unlockedBadgeIds = new Set(
        existingBadges?.map(ub => ub.badge_id) || []
      );
      
      // Get all available badges
      const { data: badges, error: allBadgesError } = await supabase
        .from('badges')
        .select('*');
      
      if (allBadgesError) {
        console.error("Error fetching all badges:", allBadgesError);
        return;
      }
      
      // Check each badge's requirements
      for (const badge of badges || []) {
        if (unlockedBadgeIds.has(badge.id)) continue;
        
        let shouldUnlock = false;
        
        switch (badge.requirement_type) {
          case 'workouts':
            shouldUnlock = (workoutsCount?.count || 0) >= badge.requirement_value;
            break;
          case 'streak':
            shouldUnlock = streak >= badge.requirement_value;
            break;
          case 'points':
            shouldUnlock = points >= badge.requirement_value;
            break;
          case 'level':
            const currentLevel = Math.floor(points / 100) + 1;
            shouldUnlock = currentLevel >= badge.requirement_value;
            break;
        }
        
        if (shouldUnlock) {
          const { error: unlockBadgeError } = await supabase
            .from('user_badges')
            .insert({
              user_id: authData.user.id,
              badge_id: badge.id
            });
          
          if (unlockBadgeError) {
            console.error("Error unlocking badge:", unlockBadgeError);
            continue;
          }
          
          // Notify user
          toast({
            title: "Badge Earned!",
            description: `You've earned the ${badge.name} badge!`,
            duration: 5000,
          });
          
          // Give bonus points for earning a badge
          await addPoints(50);
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

  // We need to make sure we don't show things too quickly before authentication
  // is checked, which would cause flickering or inconsistent state
  if (!isInitialized) {
    return null;
  }

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
        setCharacter: handleCharacterUpdate,
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
