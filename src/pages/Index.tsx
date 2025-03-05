
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
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
          return;
        }
        
        if (data.user && hasSelectedCharacter) {
          // If user is logged in and has selected a character, redirect to workout page
          navigate('/workout');
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    };
    
    checkAuth();
  }, [hasSelectedCharacter, navigate]);

  return (
    <div className="animated-grid min-h-screen bg-gradient-to-b from-black to-gray-900">
      <CharacterSelection />
    </div>
  );
};

export default Index;
