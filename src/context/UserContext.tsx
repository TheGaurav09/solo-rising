
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Load user data from localStorage on initial render
  useEffect(() => {
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
  }, []);

  // Save user data to localStorage when state changes
  useEffect(() => {
    if (character) {
      localStorage.setItem('character', character);
      setHasSelectedCharacter(true);
    }
    
    if (userName) {
      localStorage.setItem('userName', userName);
    }
    
    localStorage.setItem('points', points.toString());
  }, [character, userName, points]);

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
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
