
import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Dumbbell, Award, User, ShoppingBag, LogOut, MessageCircle, Maximize, ArrowLeft } from 'lucide-react';
import { getIconComponent } from '@/lib/iconUtils';
import { AnimatePresence } from 'framer-motion';
import ShareModal from './modals/ShareModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, hasSelectedCharacter } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Check if the current route is AI Chat
  const isAIChat = location.pathname.includes('/ai-chat');

  // Auth checking logic
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        
        if (!data.user) {
          navigate('/', { replace: true });
          return;
        }
        
        setIsAuthenticated(true);
        
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
  
  // Background classes based on character
  const getBackgroundClass = () => {
    switch(character) {
      case 'goku': return 'bg-goku';
      case 'saitama': return 'bg-saitama';
      case 'jin-woo': return 'bg-jin-woo';
      default: return 'bg-black';
    }
  };
  
  // Update page title based on route
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
  
  // Sharing functionality
  const handleShareClick = () => {
    setShowShareModal(true);
  };
  
  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Request fullscreen for AI Chat
  useEffect(() => {
    if (isAIChat && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  }, [isAIChat]);
  
  // Navigate back from AI Chat
  const handleBackFromAIChat = () => {
    navigate('/workout');
  };
  
  // Navigation items
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
  
  // Primary actions for sidebar
  const primaryActions = [
    {
      icon: <Maximize size={20} />,
      label: 'Fullscreen',
      onClick: toggleFullscreen
    },
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
  
  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()} animated-grid`}>
      {/* AI Chat Back Button (only shown on AI Chat page) */}
      {isAIChat && (
        <div className="fixed top-4 left-20 z-50">
          <button 
            onClick={handleBackFromAIChat}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              character === 'goku' ? 'bg-goku-primary' : 
              character === 'saitama' ? 'bg-saitama-primary' : 
              character === 'jin-woo' ? 'bg-jin-woo-primary' : 
              'bg-white'
            } text-white`}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navigationItems={navigationItems}
          primaryActions={primaryActions}
          accentClass={getSidebarAccentColor()}
          brandIcon={getIconComponent('dumbbell', 24)}
          brandIconStyle={getBrandIconStyle()}
          handleShareClick={handleShareClick}
        />
        
        {/* Main content area with padding to account for sidebar */}
        <main className="flex-1 overflow-y-auto ml-0 md:ml-0 pb-0 md:pb-0 relative w-full">
          <div className={`min-h-screen ${isAIChat ? 'pt-16' : 'pt-4'} px-4`}>
            <Outlet />
          </div>
        </main>
      </div>

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
