import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type CharacterType = 'goku' | 'saitama' | 'jin-woo' | null;

interface UserContextType {
  character: CharacterType;
  userName: string;
  country: string;
  points: number;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastWorkoutDate: string | null;
  lastWorkoutTime: string | null;
  hasSelectedCharacter: boolean;
  canAddWorkout: boolean;
  setCharacter: (character: CharacterType) => void;
  setUserName: (name: string) => void;
  setCountry: (country: string) => void;
  addPoints: (points: number) => void;
  useCoins: (amount: number) => Promise<boolean>;
  checkForAchievements: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<boolean>;
  updateCharacter: (character: CharacterType) => Promise<boolean>;
  checkWorkoutCooldown: () => Promise<boolean>;
  setLastWorkoutTime: (time: string) => Promise<void>;
  setUserData: (name: string, charType: CharacterType, pts: number, strk: number, cns: number, ctry: string) => void;
  addCoins: (amount: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<CharacterType>(null);
  const [userName, setUserName] = useState('');
  const [country, setCountry] = useState('Global');
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [lastWorkoutTime, setLastWorkoutTime] = useState<string | null>(null);
  const [canAddWorkout, setCanAddWorkout] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedCharacter = localStorage.getItem('character');
    const storedUserName = localStorage.getItem('userName');
    const storedCountry = localStorage.getItem('country');
    const storedPoints = localStorage.getItem('points');
    const storedCoins = localStorage.getItem('coins');
    const storedStreak = localStorage.getItem('streak');
    const storedLastWorkoutDate = localStorage.getItem('lastWorkoutDate');
    const storedLastWorkoutTime = localStorage.getItem('lastWorkoutTime');
    
    if (storedCharacter) setCharacter(storedCharacter as CharacterType);
    if (storedUserName) setUserName(storedUserName);
    if (storedCountry) setCountry(storedCountry);
    if (storedPoints) setPoints(parseInt(storedPoints));
    if (storedCoins) setCoins(parseInt(storedCoins));
    if (storedStreak) setStreak(parseInt(storedStreak));
    if (storedLastWorkoutDate) setLastWorkoutDate(storedLastWorkoutDate);
    if (storedLastWorkoutTime) setLastWorkoutTime(storedLastWorkoutTime);
    
    if (storedLastWorkoutTime) {
      checkWorkoutCooldown();
    }
    
    const fetchUserData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData || !authData.user) {
          console.log("No authenticated user found");
          if (storedCharacter || storedUserName) {
            localStorage.clear();
            setCharacter(null);
            setUserName('');
            setCountry('Global');
            setPoints(0);
            setCoins(0);
            setStreak(0);
            setLastWorkoutDate(null);
            setLastWorkoutTime(null);
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
          
          const lastWorkoutTimeValue = (userData as any).last_workout_time || null;
          setLastWorkoutTime(lastWorkoutTimeValue);
          
          if (userData.character_type) {
            localStorage.setItem('character', userData.character_type);
          }
          localStorage.setItem('userName', userData.warrior_name);
          localStorage.setItem('country', userData.country || 'Global');
          localStorage.setItem('points', String(userData.points || 0));
          localStorage.setItem('coins', String(userData.coins || 0));
          localStorage.setItem('streak', String(userData.streak || 0));
          if (userData.last_workout_date) {
            localStorage.setItem('lastWorkoutDate', userData.last_workout_date);
          }
          
          if ((userData as any).last_workout_time) {
            localStorage.setItem('lastWorkoutTime', (userData as any).last_workout_time);
            checkWorkoutCooldown();
          }
          
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
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        localStorage.clear();
        setCharacter(null);
        setUserName('');
        setCountry('Global');
        setPoints(0);
        setCoins(0);
        setStreak(0);
        setLastWorkoutDate(null);
        setLastWorkoutTime(null);
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserData();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkWorkoutCooldown = async (): Promise<boolean> => {
    if (!lastWorkoutTime) {
      setCanAddWorkout(true);
      return true;
    }
    
    const lastTime = new Date(lastWorkoutTime).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    const hasPassedCooldown = currentTime - lastTime >= thirtyMinutesInMs;
    setCanAddWorkout(hasPassedCooldown);
    
    return hasPassedCooldown;
  };

  const updateLastWorkoutTime = async (time: string): Promise<void> => {
    setLastWorkoutTime(time);
    localStorage.setItem('lastWorkoutTime', time);
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { error } = await supabase
          .from('users')
          .update({ 
            last_workout_time: time 
          } as any)
          .eq('id', authData.user.id);
          
        if (error) {
          console.error("Error updating last workout time:", error);
        }
      }
    } catch (error) {
      console.error("Error in updateLastWorkoutTime:", error);
    }
    
    setCanAddWorkout(false);
    
    setTimeout(() => {
      checkWorkoutCooldown();
    }, 30 * 60 * 1000);
  };

  const handleCharacterUpdate = async (newCharacter: CharacterType) => {
    if (!newCharacter) return;
    
    setCharacter(newCharacter);
    localStorage.setItem('character', newCharacter);
    
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
        
        const { data, error: countError } = await supabase
          .from('character_counts')
          .select('*')
          .eq('character_type', newCharacter)
          .maybeSingle();
            
        if (countError && countError.code !== 'PGRST116') {
          console.error("Error checking character count:", countError);
        }
        
        if (data) {
          const { error: updateError } = await supabase
            .from('character_counts')
            .update({ count: data.count + 1 })
            .eq('id', data.id);
            
          if (updateError) {
            console.error("Error updating character count:", updateError);
          }
        } else {
          const { error: insertError } = await supabase
            .from('character_counts')
            .insert({ character_type: newCharacter, count: 1 });
            
          if (insertError) {
            console.error("Error inserting character count:", insertError);
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
          localStorage.setItem('points', String(points));
          return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        if (!lastWorkoutDate || lastWorkoutDate !== today) {
          let newStreak = streak;
          
          if (lastWorkoutDate) {
            const lastDate = new Date(lastWorkoutDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
              newStreak = streak + 1;
            } else if (lastDate.toISOString().split('T')[0] !== today) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
          
          setStreak(newStreak);
          setLastWorkoutDate(today);
          localStorage.setItem('streak', String(newStreak));
          localStorage.setItem('lastWorkoutDate', today);
          
          const { error: streakError } = await supabase
            .from('users')
            .update({ 
              streak: newStreak,
              last_workout_date: today
            })
            .eq('id', authData.user.id);
            
          if (streakError) {
            console.error("Error updating streak:", streakError);
          }
        }
        
        if (amount > 0) {
          const coinsToAdd = Math.floor(amount / 10);
          if (coinsToAdd > 0) {
            const newCoins = coins + coinsToAdd;
            setCoins(newCoins);
            localStorage.setItem('coins', String(newCoins));
            
            const { error: coinsError } = await supabase
              .from('users')
              .update({ coins: newCoins })
              .eq('id', authData.user.id);
              
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
          localStorage.setItem('coins', String(coins));
          return false;
        }

        console.log(`Successfully used ${amount} coins. New balance: ${newCoins}`);
        
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
      
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });
        
      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
        return;
      }
      
      const { data: existingAchievements, error: existingError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', authData.user.id);
      
      if (existingError) {
        console.error("Error fetching existing achievements:", existingError);
        return;
      }
      
      const unlockedAchievementIds = new Set(
        existingAchievements?.map(ua => ua.achievement_id) || []
      );
      
      const achievementsToUnlock = achievements?.filter(achievement => 
        !unlockedAchievementIds.has(achievement.id) && 
        points >= achievement.points_required
      ) || [];
      
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
        
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.name}: ${achievement.description}`,
          duration: 5000,
        });
        
        console.log(`Achievement unlocked: ${achievement.name}`);
      }
      
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', authData.user.id);
      
      if (workoutsError) {
        console.error("Error fetching workouts count:", workoutsError);
        return;
      }
      
      const workoutsCount = workoutsData ? workoutsData.length : 0;
      
      const { data: existingBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', authData.user.id);
      
      if (badgesError) {
        console.error("Error fetching existing badges:", badgesError);
        return;
      }
      
      const unlockedBadgeIds = new Set(
        existingBadges?.map(ub => ub.badge_id) || []
      );
      
      const { data: badges, error: allBadgesError } = await supabase
        .from('badges')
        .select('*');
      
      if (allBadgesError) {
        console.error("Error fetching all badges:", allBadgesError);
        return;
      }
      
      for (const badge of badges || []) {
        if (unlockedBadgeIds.has(badge.id)) continue;
        
        let shouldUnlock = false;
        
        switch (badge.requirement_type) {
          case 'workouts':
            shouldUnlock = workoutsCount >= badge.requirement_value;
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
          
          toast({
            title: "Badge Earned!",
            description: `You've earned the ${badge.name} badge!`,
            duration: 5000,
          });
          
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

  const addCoins = async (amount: number): Promise<void> => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    localStorage.setItem('coins', String(newCoins));
    
    try {
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
          setCoins(coins);
          localStorage.setItem('coins', String(coins));
          return;
        }
      }
    } catch (error) {
      console.error("Error in addCoins:", error);
    }
  };

  const setUserData = (name: string, charType: CharacterType, pts: number, strk: number, cns: number, ctry: string) => {
    setUserName(name);
    setCharacter(charType);
    setPoints(pts);
    setStreak(strk);
    setCoins(cns);
    setCountry(ctry);
  };

  const updateCharacter = async (newCharacter: CharacterType): Promise<boolean> => {
    if (!newCharacter) return false;
    
    try {
      const success = await handleCharacterUpdate(newCharacter);
      return success !== undefined;
    } catch (error) {
      console.error("Error in updateCharacter:", error);
      return false;
    }
  };

  if (!isInitialized) {
    return null;
  }

  const calculatedXp = points;
  const calculatedLevel = Math.floor(points / 100) + 1;

  return (
    <UserContext.Provider 
      value={{
        character,
        userName,
        country,
        points,
        xp: calculatedXp,
        level: calculatedLevel,
        coins,
        streak,
        lastWorkoutDate,
        lastWorkoutTime,
        hasSelectedCharacter: !!character,
        canAddWorkout,
        setCharacter: handleCharacterUpdate,
        setUserName,
        setCountry,
        addPoints,
        useCoins,
        checkForAchievements,
        updateUserProfile,
        updateCharacter,
        checkWorkoutCooldown,
        setLastWorkoutTime: updateLastWorkoutTime,
        setUserData,
        addCoins
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
