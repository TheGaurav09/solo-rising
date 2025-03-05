
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<CharacterType>(null);
  const [userName, setUserName] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState<boolean>(false);

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
          setHasSelectedCharacter(true);
        }
      } else {
        // Fallback to localStorage if not authenticated
        const storedCharacter = localStorage.getItem('character');
        const storedUserName = localStorage.getItem('userName');
        const storedPoints = localStorage.getItem('points');
        
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
          setHasSelectedCharacter(true);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear user data when signed out
        setCharacter(null);
        setUserName('');
        setPoints(0);
        setHasSelectedCharacter(false);
      }
    });

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

      // If authenticated, update Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        await supabase
          .from('users')
          .update({ 
            character_type: character,
            warrior_name: userName,
            points
          })
          .eq('id', authData.user.id);
      }
    };

    updateUserData();
  }, [character, userName, points]);

  const addPoints = async (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    
    // Update points in Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await supabase
        .from('users')
        .update({ points: newPoints })
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
        addPoints 
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
