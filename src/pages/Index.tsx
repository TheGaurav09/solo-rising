
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import CharacterSelection from '@/components/CharacterSelection';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';

const Index = () => {
  const { hasSelectedCharacter } = useUser();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

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

    // Add listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' && session && hasSelectedCharacter) {
        navigate('/workout');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [hasSelectedCharacter, navigate]);

  const handleLoginClick = () => {
    setAuthView('login');
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthView('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="animated-grid min-h-screen bg-gradient-to-b from-black to-gray-900">
      <CharacterSelection 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)} 
          initialView={authView}
        />
      )}
    </div>
  );
};

export default Index;
