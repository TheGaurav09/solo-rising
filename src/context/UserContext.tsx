
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Load user data from Supabase on initial render
  useEffect(() => {
    const fetchUserData = async () => {
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
          setHasSelectedCharacter(true);
        }
      } else {
        // Fallback to localStorage if not authenticated
        const storedCharacter = localStorage.getItem('character');
        const storedUserName = localStorage.getItem('userName');
        const storedPoints = localStorage.getItem('points');
        const storedCoins = localStorage.getItem('coins');
        const storedStreak = localStorage.getItem('streak');
        const storedLastWorkoutDate = localStorage.getItem('lastWorkoutDate');
        
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
      if (lastWorkoutDate) {
        localStorage.setItem('lastWorkoutDate', lastWorkoutDate);
      }

      // If authenticated, update Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        await supabase
          .from('users')
          .update({ 
            character_type: character,
            warrior_name: userName,
            points,
            coins,
            streak,
            last_workout_date: lastWorkoutDate
          })
          .eq('id', authData.user.id);
      }
    };

    updateUserData();
  }, [character, userName, points, coins, streak, lastWorkoutDate]);

  const addPoints = async (amount: number) => {
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
      await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', authData.user.id);
    }
  };

  const addCoins = async (amount: number) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    
    // Update coins in Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', authData.user.id);
    }
  };

  const useCoins = async (amount: number): Promise<boolean> => {
    if (coins < amount) return false;
    
    const newCoins = coins - amount;
    setCoins(newCoins);
    
    // Update coins in Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', authData.user.id);
    }
    
    return true;
  };

  const incrementStreak = async () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    // Update streak in Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await supabase
        .from('users')
        .update({ streak: newStreak })
        .eq('id', authData.user.id);
    }
  };

  const resetStreak = async () => {
    setStreak(0);
    
    // Update streak in Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await supabase
        .from('users')
        .update({ streak: 0 })
        .eq('id', authData.user.id);
    }
  };

  const updateLastWorkoutDate = async () => {
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
      await supabase
        .from('users')
        .update({ last_workout_date: today })
        .eq('id', authData.user.id);
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
        updateLastWorkoutDate
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
