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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
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
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to workout page
          if (userData && userData.character_type) {
            navigate('/workout');
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    };
    
    checkAuth();

    // Add listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
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
            navigate('/workout');
          }
        };
        
        checkUserCharacter();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
      } else if (event === 'USER_UPDATED' && event.toString() === 'SIGNED_UP') {
        toast({
          title: "Account created successfully!",
          description: "Please select a character to continue your journey.",
          duration: 5000,
        });
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
