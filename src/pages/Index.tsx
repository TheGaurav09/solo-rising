
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import CharacterSelection from '@/components/CharacterSelection';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const { hasSelectedCharacter } = useUser();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
          setLoading(false);
          return;
        }
        
        if (data.user) {
          setCurrentUserId(data.user.id);
          
          // Check if this user has a record in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('character_type')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("User data check error:", userError);
            setLoading(false);
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to workout page
          if (userData && userData.character_type) {
            navigate('/profile-workout', { replace: true });
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error checking authentication:", err);
        setLoading(false);
      }
    };
    
    checkAuth();

    // Add listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentUserId(session.user.id);
        
        // Check if the user has a character selected
        const checkUserCharacter = async () => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('character_type')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("User data check error:", userError);
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to workout page
          if (userData && userData.character_type) {
            navigate('/profile-workout', { replace: true });
          }
        };
        
        checkUserCharacter();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="animated-grid min-h-screen bg-gradient-to-b from-black to-gray-900">
      <CharacterSelection 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        userId={currentUserId}
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
