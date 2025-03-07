
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
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, check local storage for a faster initial check
        const cachedAuth = localStorage.getItem('sb-auth-token');
        
        if (cachedAuth) {
          // If we have a cached token, immediately redirect to dashboard page
          // We'll verify the token's validity in the background
          setLoading(false);
          navigate('/dashboard', { replace: true });
        }
        
        // In parallel, do the proper auth check with Supabase
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
          setLoading(false);
          setInitialCheckComplete(true);
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
            setInitialCheckComplete(true);
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to dashboard page
          if (userData && userData.character_type) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
        
        setLoading(false);
        setInitialCheckComplete(true);
      } catch (err) {
        console.error("Error checking authentication:", err);
        setLoading(false);
        setInitialCheckComplete(true);
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
          
          // If user exists in DB and has selected a character, redirect to dashboard page
          if (userData && userData.character_type) {
            navigate('/dashboard', { replace: true });
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

  if (!initialCheckComplete) {
    return null; // Don't render anything while we check if redirect is needed
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
