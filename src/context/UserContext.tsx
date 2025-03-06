
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
  setUserData: (name: string, char: CharacterType, pts: number, strk: number, cns: number, cntry: string) => void;
  checkWorkoutCooldown: () => boolean;
  setLastWorkoutTime: (date: string) => Promise<boolean>;
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

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else if (profile) {
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
          
          // Check if user can add a workout
          if (profile.last_workout_date) {
            const canAdd = checkWorkoutCooldown();
            setCanAddWorkout(canAdd);
          }
        }
      }
    };

    fetchInitialData();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
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
      } else if (session?.user) {
        fetchInitialData();
      }
    });
  }, []);

  const setUserData = (name: string, char: CharacterType, pts: number, strk: number, cns: number, cntry: string) => {
    setUserName(name);
    setCharacterType(char);
    setHasSelectedCharacter(true);
    setPoints(pts);
    setStreak(strk);
    setCoins(cns);
    setCountry(cntry);
  };

  const setCharacter = (character: CharacterType) => {
    setCharacterType(character);
    setHasSelectedCharacter(true);
  };

  const updateUserProfile = async (newName: string): Promise<boolean> => {
    if (!userId) return false;

    const { error } = await supabase
      .from('users')
      .update({ warrior_name: newName })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user profile:", error);
      return false;
    } else {
      setUserName(newName);
      return true;
    }
  };

  const updateCharacter = async (newCharacter: CharacterType): Promise<boolean> => {
    if (!userId) return false;
  
    const { error } = await supabase
      .from('users')
      .update({ character_type: newCharacter })
      .eq('id', userId);
  
    if (error) {
      console.error("Error updating character:", error);
      return false;
    } else {
      setCharacterType(newCharacter);
      return true;
    }
  };

  const addPoints = (newPoints: number) => {
    setPoints((prevPoints) => prevPoints + newPoints);
  };

  const usePoints = (pointsToUse: number) => {
    setPoints((prevPoints) => prevPoints - pointsToUse);
  };

  const addCoins = (newCoins: number) => {
    setCoins((prevCoins) => prevCoins + newCoins);
  };

  const useCoins = (coinsToUse: number) => {
    setCoins((prevCoins) => prevCoins - coinsToUse);
  };

  const addStreak = (newStreak: number) => {
    setStreak((prevStreak) => prevStreak + newStreak);
  };

  const resetStreak = () => {
    setStreak(0);
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
      
      // Schedule the cooldown reset
      setTimeout(() => {
        setCanAddWorkout(true);
      }, 3 * 60 * 60 * 1000); // 3 hours
      
      return true;
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
