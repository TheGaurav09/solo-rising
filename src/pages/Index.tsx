
import React from 'react';
import { useUser } from '@/context/UserContext';
import CharacterSelection from '@/components/CharacterSelection';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { hasSelectedCharacter } = useUser();

  return (
    <div>
      {hasSelectedCharacter ? (
        <Dashboard />
      ) : (
        <CharacterSelection />
      )}
    </div>
  );
};

export default Index;
