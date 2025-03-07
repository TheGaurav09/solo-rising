
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
        console.log("Index: Starting auth check");
        
        // First, check local storage for a faster initial check
        const cachedAuth = localStorage.getItem('sb-auth-token');
        
        if (cachedAuth) {
          console.log("Index: Found cached auth token");
          // If we have a cached token, immediately redirect to dashboard page
          navigate('/dashboard', { replace: true });
          return; // Early return to prevent further execution
        }
        
        // In parallel, do the proper auth check with Supabase
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Index: Auth check error:", error);
          setLoading(false);
          setInitialCheckComplete(true);
          return;
        }
        
        if (data.user) {
          console.log("Index: User is authenticated:", data.user.id);
          setCurrentUserId(data.user.id);
          
          // Check if this user has a record in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('character_type')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("Index: User data check error:", userError);
            setLoading(false);
            setInitialCheckComplete(true);
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to dashboard page
          if (userData && userData.character_type) {
            console.log("Index: User has character, redirecting to dashboard");
            navigate('/dashboard', { replace: true });
            return;
          } else {
            console.log("Index: User has no character yet");
          }
        } else {
          console.log("Index: No authenticated user found");
        }
        
        setLoading(false);
        setInitialCheckComplete(true);
      } catch (err) {
        console.error("Index: Error checking authentication:", err);
        setLoading(false);
        setInitialCheckComplete(true);
      }
    };
    
    // Add a timeout to ensure we don't get stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Index: Loading timeout triggered, resetting loading state");
        setLoading(false);
        setInitialCheckComplete(true);
      }
    }, 5000); // 5 second timeout
    
    checkAuth();

    // Add listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Index: Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setCurrentUserId(session.user.id);
        
        // Check if the user has a character selected
        const checkUserCharacter = async () => {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('character_type')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (userError) {
              console.error("Index: User data check error:", userError);
              return;
            }
            
            // If user exists in DB and has selected a character, redirect to dashboard page
            if (userData && userData.character_type) {
              console.log("Index: User has character after sign in, redirecting");
              navigate('/dashboard', { replace: true });
            }
          } catch (error) {
            console.error("Index: Error checking user character:", error);
          }
        };
        
        checkUserCharacter();
      } else if (event === 'SIGNED_OUT') {
        console.log("Index: User signed out");
        setCurrentUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [hasSelectedCharacter, navigate, loading]);

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
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
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
