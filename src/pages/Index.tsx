
import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import CharacterSelection from '@/components/CharacterSelection';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { hasSelectedCharacter } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user && hasSelectedCharacter) {
        // If user is logged in and has selected a character, redirect to workout page
        navigate('/workout');
      }
    };
    
    checkAuth();
  }, [hasSelectedCharacter, navigate]);

  return (
    <div>
      <CharacterSelection />
    </div>
  );
};

export default Index;
