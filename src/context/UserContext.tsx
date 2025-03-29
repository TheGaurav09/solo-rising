import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type CharacterType = 'goku' | 'saitama' | 'jin-woo';

export type UserContextType = {
  userId: string | null;
  userName: string;
  character: CharacterType | null;
  hasSelectedCharacter: boolean;
  points: number;
  coins: number;
  streak: number;
  xp: number;
  level: number;
  country: string;
  lastWorkoutDate: string | null;
  canAddWorkout: boolean;
  setCharacter: (character: CharacterType) => void;
  updateUserProfile: (newName: string) => Promise<boolean>;
  updateCharacter: (newCharacter: CharacterType) => Promise<boolean>;
  addPoints: (newPoints: number) => void;
  usePoints: (pointsToUse: number) => void;
  addCoins: (newCoins: number) => void;
  useCoins: (coinsToUse: number) => void;
  addStreak: (newStreak: number) => void;
  resetStreak: () => void;
  setUserData: (name: string, char: CharacterType, pts: number, strk: number, cns: number, cntry: string, xpValue: number, lvl: number) => void;
  checkWorkoutCooldown: () => boolean;
  setLastWorkoutTime: (date: string) => Promise<boolean>;
  addXp: (amount: number) => void;
  levelUp: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [character, setCharacterType] = useState<CharacterType | null>(null);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [country, setCountry] = useState<string>('');
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [canAddWorkout, setCanAddWorkout] = useState<boolean>(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("UserContext: Fetching initial user data");
      setIsLoadingUserData(true);

      try {
        // Check local storage first for faster loading
        const cachedUserData = localStorage.getItem('user-data');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            console.log("UserContext: Found cached user data:", userData);
            if (userData && userData.id) {
              setUserId(userData.id);
              setUserName(userData.warrior_name || '');
              if (userData.character_type) {
                setCharacterType(userData.character_type as CharacterType);
                setHasSelectedCharacter(true);
              }
              setPoints(userData.points || 0);
              setCoins(userData.coins || 0);
              setStreak(userData.streak || 0);
              setXp(userData.xp || 0);
              setLevel(userData.level || 1);
              setCountry(userData.country || 'Global');
              setLastWorkoutDate(userData.last_workout_date || null);
              setCanAddWorkout(checkWorkoutCooldown());
            }
          } catch (error) {
            console.error("UserContext: Error parsing cached user data:", error);
            localStorage.removeItem('user-data');
          }
        }

        // Fetch from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("UserContext: Got user from supabase:", user.id);
          setUserId(user.id);

          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error("UserContext: Error fetching user profile:", error);
          } else if (profile) {
            console.log("UserContext: Got user profile from supabase:", profile);
            setUserName(profile.warrior_name || '');
            if (profile.character_type) {
              setCharacterType(profile.character_type as CharacterType);
            }
            setHasSelectedCharacter(!!profile.character_type);
            setPoints(profile.points || 0);
            setCoins(profile.coins || 0);
            setStreak(profile.streak || 0);
            setXp(profile.xp || 0);
            setLevel(profile.level || 1);
            setCountry(profile.country || '');
            setLastWorkoutDate(profile.last_workout_date || null);
            
            // Store user data in localStorage for faster loading
            localStorage.setItem('user-data', JSON.stringify(profile));
            
            // Check if user can add a workout
            if (profile.last_workout_date) {
              const canAdd = checkWorkoutCooldown();
              setCanAddWorkout(canAdd);
            }
            
            // Check if user missed a day and should reset streak
            checkAndResetStreak(profile.last_workout_date, profile.streak);
          }
        }
      } catch (error) {
        console.error("UserContext: Error in fetchInitialData:", error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchInitialData();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("UserContext: Auth state changed:", event);

      if (event === 'SIGNED_OUT') {
        console.log("UserContext: User signed out, clearing data");
        setUserId(null);
        setUserName('');
        setCharacterType(null);
        setHasSelectedCharacter(false);
        setPoints(0);
        setCoins(0);
        setStreak(0);
        setXp(0);
        setLevel(1);
        setCountry('');
        setLastWorkoutDate(null);
        setCanAddWorkout(true);
        localStorage.removeItem('user-data');
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log("UserContext: User signed in or token refreshed, fetching data");
        fetchInitialData();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const checkAndResetStreak = async (lastWorkoutDate: string | null, currentStreak: number) => {
    if (!lastWorkoutDate || currentStreak === 0) return;
    
    const lastWorkout = new Date(lastWorkoutDate);
    const today = new Date();
    
    // Reset to midnight for accurate day comparison
    lastWorkout.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const timeDiff = today.getTime() - lastWorkout.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // If more than 1 day has passed, reset streak
    if (daysDiff > 1) {
      console.log(`UserContext: ${daysDiff} days since last workout, resetting streak`);
      setStreak(0);
      
      // Update in database if we have userId
      if (userId) {
        try {
          const { error } = await supabase
            .from('users')
            .update({ streak: 0 })
            .eq('id', userId);
            
          if (error) {
            console.error("UserContext: Error resetting streak in database:", error);
          } else {
            console.log("UserContext: Streak reset in database");
            
            // Update local storage
            const cachedData = localStorage.getItem('user-data');
            if (cachedData) {
              try {
                const userData = JSON.parse(cachedData);
                userData.streak = 0;
                localStorage.setItem('user-data', JSON.stringify(userData));
              } catch (e) {
                console.error("UserContext: Error updating local storage:", e);
              }
            }
            
            // Show toast notification
            toast({
              title: "Streak Reset",
              description: "You missed a day of workout, your streak has been reset.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("UserContext: Exception in resetStreak:", error);
        }
      }
    }
  };

  const setUserData = (
    name: string, 
    char: CharacterType, 
    pts: number, 
    strk: number, 
    cns: number, 
    cntry: string,
    xpValue: number = 0,
    lvl: number = 1
  ) => {
    setUserName(name);
    setCharacterType(char);
    setHasSelectedCharacter(true);
    setPoints(pts);
    setStreak(strk);
    setCoins(cns);
    setCountry(cntry);
    setXp(xpValue);
    setLevel(lvl);

    // Update localStorage
    if (userId) {
      const userData = {
        id: userId,
        warrior_name: name,
        character_type: char,
        points: pts,
        streak: strk,
        coins: cns,
        country: cntry,
        xp: xpValue,
        level: lvl
      };
      localStorage.setItem('user-data', JSON.stringify(userData));
    }
  };

  const setCharacter = (character: CharacterType) => {
    setCharacterType(character);
    setHasSelectedCharacter(true);
  };

  const updateUserProfile = async (newName: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ warrior_name: newName })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user profile:", error);
        return false;
      } else {
        setUserName(newName);
        
        // Update localStorage
        const cachedData = localStorage.getItem('user-data');
        if (cachedData) {
          try {
            const userData = JSON.parse(cachedData);
            userData.warrior_name = newName;
            localStorage.setItem('user-data', JSON.stringify(userData));
          } catch (e) {
            console.error("Error updating local storage:", e);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error("Exception in updateUserProfile:", error);
      return false;
    }
  };

  const updateCharacter = async (newCharacter: CharacterType): Promise<boolean> => {
    if (!userId) return false;
  
    try {
      const { error } = await supabase
        .from('users')
        .update({ character_type: newCharacter })
        .eq('id', userId);
    
      if (error) {
        console.error("Error updating character:", error);
        return false;
      } else {
        setCharacterType(newCharacter);
        
        // Update localStorage
        const cachedData = localStorage.getItem('user-data');
        if (cachedData) {
          try {
            const userData = JSON.parse(cachedData);
            userData.character_type = newCharacter;
            localStorage.setItem('user-data', JSON.stringify(userData));
          } catch (e) {
            console.error("Error updating local storage:", e);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error("Exception in updateCharacter:", error);
      return false;
    }
  };

  const checkWorkoutCooldown = () => {
    if (!lastWorkoutDate) return true;
    
    const now = new Date();
    const lastWorkout = new Date(lastWorkoutDate);
    const hoursSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
    
    // Allow a new workout if more than 3 hours have passed
    return hoursSinceLastWorkout >= 3;
  };

  const setLastWorkoutTime = async (date: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_workout_date: date })
        .eq('id', userId);
        
      if (error) {
        console.error("Error updating last workout time:", error);
        return false;
      } else {
        setLastWorkoutDate(date);
        setCanAddWorkout(false);
        
        // Update localStorage
        const cachedData = localStorage.getItem('user-data');
        if (cachedData) {
          try {
            const userData = JSON.parse(cachedData);
            userData.last_workout_date = date;
            localStorage.setItem('user-data', JSON.stringify(userData));
          } catch (e) {
            console.error("Error updating local storage:", e);
          }
        }
        
        // Schedule the cooldown reset
        setTimeout(() => {
          setCanAddWorkout(true);
        }, 3 * 60 * 60 * 1000); // 3 hours
        
        return true;
      }
    } catch (error) {
      console.error("Exception in setLastWorkoutTime:", error);
      return false;
    }
  };

  const addXp = (amount: number) => {
    setXp(prevXp => {
      const newXp = prevXp + amount;
      // Check if user should level up (simple formula: 100 * current level)
      if (newXp >= level * 100) {
        levelUp();
      }
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.xp = newXp;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return newXp;
    });
  };

  const levelUp = () => {
    setLevel(prevLevel => {
      const newLevel = prevLevel + 1;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.level = newLevel;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return newLevel;
    });
    
    // Notify user of level up
    toast({
      title: "Level Up!",
      description: `You've reached level ${level + 1}!`,
      variant: "default",
    });
  };

  const addPoints = (newPoints: number) => {
    setPoints(prevPoints => {
      const updatedPoints = prevPoints + newPoints;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.points = updatedPoints;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return updatedPoints;
    });
  };

  const usePoints = (pointsToUse: number) => {
    setPoints(prevPoints => {
      const updatedPoints = prevPoints - pointsToUse;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.points = updatedPoints;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return updatedPoints;
    });
  };

  const addCoins = (newCoins: number) => {
    setCoins(prevCoins => {
      const updatedCoins = prevCoins + newCoins;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.coins = updatedCoins;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return updatedCoins;
    });
  };

  const useCoins = (coinsToUse: number) => {
    setCoins(prevCoins => {
      const updatedCoins = prevCoins - coinsToUse;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.coins = updatedCoins;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return updatedCoins;
    });
  };

  const addStreak = (newStreak: number) => {
    setStreak(prevStreak => {
      const updatedStreak = prevStreak + newStreak;
      
      // Update localStorage
      const cachedData = localStorage.getItem('user-data');
      if (cachedData && userId) {
        try {
          const userData = JSON.parse(cachedData);
          userData.streak = updatedStreak;
          localStorage.setItem('user-data', JSON.stringify(userData));
        } catch (e) {
          console.error("Error updating local storage:", e);
        }
      }
      
      return updatedStreak;
    });
  };

  const resetStreak = () => {
    setStreak(0);
    
    // Update localStorage
    const cachedData = localStorage.getItem('user-data');
    if (cachedData && userId) {
      try {
        const userData = JSON.parse(cachedData);
        userData.streak = 0;
        localStorage.setItem('user-data', JSON.stringify(userData));
      } catch (e) {
        console.error("Error updating local storage:", e);
      }
    }
    
    // Update in database if we have userId
    if (userId) {
      supabase
        .from('users')
        .update({ streak: 0 })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) {
            console.error("Error resetting streak in database:", error);
          } else {
            console.log("Streak reset in database");
          }
        });
    }
  };

  const value: UserContextType = {
    userId,
    userName,
    character,
    hasSelectedCharacter,
    points,
    coins,
    streak,
    xp,
    level,
    country,
    lastWorkoutDate,
    canAddWorkout,
    setCharacter,
    updateUserProfile,
    updateCharacter,
    addPoints,
    usePoints,
    addCoins,
    useCoins,
    addStreak,
    resetStreak,
    setUserData,
    checkWorkoutCooldown,
    setLastWorkoutTime,
    addXp,
    levelUp,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
