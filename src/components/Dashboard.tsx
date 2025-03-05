
import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// Fix: Use named imports instead of default import
import { Sidebar } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Dumbbell, Award, User, ShoppingBag, LogOut, MessageCircle } from 'lucide-react';
import { getIconComponent } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';
// Add framer-motion import
import { AnimatePresence } from 'framer-motion';
import ShareModal from './modals/ShareModal';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, hasSelectedCharacter } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        
        if (!data.user) {
          // Not authenticated, redirect to homepage
          navigate('/', { replace: true });
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has selected a character
        if (!hasSelectedCharacter) {
          toast({
            title: "Select Your Character",
            description: "Please select a character to continue",
            duration: 5000,
          });
          navigate('/', { replace: true });
          return;
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, hasSelectedCharacter]);
  
  const getBackgroundClass = () => {
    switch(character) {
      case 'goku': return 'bg-goku';
      case 'saitama': return 'bg-saitama';
      case 'jin-woo': return 'bg-jin-woo';
      default: return 'bg-black';
    }
  };
  
  // Set title based on current route
  useEffect(() => {
    let title = 'Solo Prove';
    
    switch (location.pathname.split('/')[1]) {
      case 'workout':
        title = 'Solo Prove | Workout';
        break;
      case 'profile':
        title = 'Solo Prove | Profile';
        break;
      case 'achievements':
        title = 'Solo Prove | Achievements';
        break;
      case 'store':
        title = 'Solo Prove | Store';
        break;
      case 'ai-chat':
        title = 'Solo Prove | AI Chat';
        break;
      default:
        title = 'Solo Prove';
    }
    
    document.title = title;
  }, [location]);
  
  // Handle sharing
  const handleShareClick = () => {
    setShowShareModal(true);
  };
  
  // Define navigation items
  const navigationItems = [
    {
      href: '/workout',
      icon: <Dumbbell size={20} />,
      label: 'Workout'
    },
    {
      href: '/profile/me',
      icon: <User size={20} />,
      label: 'Profile'
    },
    {
      href: '/achievements',
      icon: <Award size={20} />,
      label: 'Achievements'
    },
    {
      href: '/store',
      icon: <ShoppingBag size={20} />,
      label: 'Store'
    },
    {
      href: '/ai-chat',
      icon: <MessageCircle size={20} />,
      label: 'AI Chat'
    }
  ];
  
  // Primary actions (shown at the bottom of the sidebar)
  const primaryActions = [
    {
      icon: <LogOut size={20} />,
      label: 'Logout',
      onClick: async () => {
        try {
          await supabase.auth.signOut();
          toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out',
          });
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Logout error:', error);
          toast({
            title: 'Error',
            description: 'Failed to log out. Please try again.',
            variant: 'destructive',
          });
        }
      }
    }
  ];
  
  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${getBackgroundClass()}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !hasSelectedCharacter) {
    return null; // Redirect handled in useEffect
  }
  
  // Character-specific styling
  const getSidebarAccentColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary text-white';
      case 'saitama': return 'bg-saitama-primary text-white';
      case 'jin-woo': return 'bg-jin-woo-primary text-white';
      default: return 'bg-white text-black';
    }
  };
  
  const getBrandIconStyle = () => {
    switch(character) {
      case 'goku': return 'text-goku-primary/80';
      case 'saitama': return 'text-saitama-primary/80';
      case 'jin-woo': return 'text-jin-woo-primary/80';
      default: return 'text-white/80';
    }
  };
  
  const getMobileBarColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary/10 border-goku-primary/20';
      case 'saitama': return 'bg-saitama-primary/10 border-saitama-primary/20';
      case 'jin-woo': return 'bg-jin-woo-primary/10 border-jin-woo-primary/20';
      default: return 'bg-white/10 border-white/20';
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()} animated-grid`}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navigationItems={navigationItems}
          primaryActions={primaryActions}
          accentClass={getSidebarAccentColor()}
          brandIcon={getIconComponent('dumbbell', 24)}
          brandIconStyle={getBrandIconStyle()}
          handleShareClick={handleShareClick}
        />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile navigation */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 ${getMobileBarColor()} border-t p-2 flex justify-around items-center z-50`}>
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/profile/me' && location.pathname.startsWith('/profile'));
            
            return (
              <button
                key={index}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? character === 'goku' 
                      ? 'text-goku-primary bg-goku-primary/20' 
                      : character === 'saitama' 
                      ? 'text-saitama-primary bg-saitama-primary/20'
                      : character === 'jin-woo'
                      ? 'text-jin-woo-primary bg-jin-woo-primary/20'
                      : 'text-white bg-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal 
            onClose={() => setShowShareModal(false)}
            character={character}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
