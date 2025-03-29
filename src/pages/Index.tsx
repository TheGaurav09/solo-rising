
import React, { useEffect, useState } from 'react';
import { useUser, CharacterType } from '@/context/UserContext';
import CharacterSelection from '@/components/CharacterSelection';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const { hasSelectedCharacter, setUserData } = useUser();
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
        const cachedUserData = localStorage.getItem('user-data');
        
        if (cachedAuth && cachedUserData) {
          console.log("Index: Found cached auth data");
          try {
            // Parse the cached user data
            const userData = JSON.parse(cachedUserData);
            if (userData && userData.id) {
              console.log("Index: Using cached auth data");
              setCurrentUserId(userData.id);
              
              // If we have character info too, set user data
              if (userData.warrior_name && userData.character_type) {
                // Ensure character_type is a valid CharacterType
                const characterType = userData.character_type as CharacterType;
                if (characterType === 'goku' || characterType === 'saitama' || characterType === 'jin-woo') {
                  setUserData(
                    userData.warrior_name,
                    characterType,
                    userData.points || 0,
                    userData.streak || 0,
                    userData.coins || 0,
                    userData.country || 'Global',
                    userData.xp || 0,
                    userData.level || 1
                  );
                  
                  // Immediately redirect to dashboard page using cached data
                  navigate('/dashboard', { replace: true });
                  return; // Early return to prevent further execution
                }
              }
            }
          } catch (err) {
            console.error("Error parsing cached auth data:", err);
            localStorage.removeItem('user-data');
          }
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
            .select('*')
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
            
            // Store user data in localStorage for faster loading on refresh
            localStorage.setItem('user-data', JSON.stringify(userData));
            localStorage.setItem('sb-auth-token', 'true');
            
            // Set user data in context
            if (userData.warrior_name && userData.character_type) {
              // Ensure character_type is a valid CharacterType
              const characterType = userData.character_type as CharacterType;
              if (characterType === 'goku' || characterType === 'saitama' || characterType === 'jin-woo') {
                setUserData(
                  userData.warrior_name,
                  characterType,
                  userData.points || 0,
                  userData.streak || 0,
                  userData.coins || 0,
                  userData.country || 'Global',
                  userData.xp || 0,
                  userData.level || 1
                );
              }
              
              navigate('/dashboard', { replace: true });
              return;
            }
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
    }, 6000); // 6 seconds timeout
    
    checkAuth();

    // Add listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Index: Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // Store auth token in localStorage
        localStorage.setItem('sb-auth-token', 'true');
        
        setCurrentUserId(session.user.id);
        
        // Check if the user has a character selected
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("Index: User data check error:", userError);
            return;
          }
          
          // If user exists in DB and has selected a character, redirect to dashboard page
          if (userData && userData.character_type) {
            console.log("Index: User has character after sign in, redirecting");
            
            // Store user data in localStorage for faster loading on refresh
            localStorage.setItem('user-data', JSON.stringify(userData));
            
            // Set user data in context
            if (userData.warrior_name && userData.character_type) {
              // Ensure character_type is a valid CharacterType
              const characterType = userData.character_type as CharacterType;
              if (characterType === 'goku' || characterType === 'saitama' || characterType === 'jin-woo') {
                setUserData(
                  userData.warrior_name,
                  characterType,
                  userData.points || 0,
                  userData.streak || 0,
                  userData.coins || 0,
                  userData.country || 'Global',
                  userData.xp || 0,
                  userData.level || 1
                );
              }
              
              navigate('/dashboard', { replace: true });
            }
          }
        } catch (error) {
          console.error("Index: Error checking user character:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("Index: User signed out");
        localStorage.removeItem('sb-auth-token'); // Remove auth token from localStorage
        localStorage.removeItem('user-data'); // Remove user data from localStorage
        setCurrentUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [hasSelectedCharacter, navigate, loading, setUserData]);

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
