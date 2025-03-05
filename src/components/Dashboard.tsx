
import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { User, ShoppingBag, MessageCircle, Maximize, Trophy, HeartHandshake, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { getIconComponent } from '@/lib/iconUtils';
import { AnimatePresence } from 'framer-motion';
import ShareModal from './modals/ShareModal';
import CoinDisplay from './ui/CoinDisplay';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, hasSelectedCharacter } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  
  const isAIChat = location.pathname.includes('/ai-chat');

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedSidebarHiddenState = localStorage.getItem('sidebar-hidden');
    if (savedSidebarHiddenState) {
      setSidebarHidden(savedSidebarHiddenState === 'true');
    }
  }, []);

  useEffect(() => {
    // Save sidebar states to localStorage
    localStorage.setItem('sidebar-hidden', sidebarHidden.toString());
  }, [sidebarHidden]);

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
  
  const getBackgroundClass = () => {
    switch(character) {
      case 'goku': return 'bg-goku';
      case 'saitama': return 'bg-saitama';
      case 'jin-woo': return 'bg-jin-woo';
      default: return 'bg-black';
    }
  };
  
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
      case 'settings':
        title = 'Solo Prove | Settings';
        break;
      default:
        title = 'Solo Prove';
    }
    
    document.title = title;
  }, [location]);
  
  const handleShareClick = () => {
    setShowShareModal(true);
  };
  
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
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  useEffect(() => {
    if (isAIChat && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  }, [isAIChat]);

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };
  
  const navigationItems = [
    {
      href: '/profile-workout',
      icon: <User size={20} />,
      label: 'Profile & Workout'
    },
    {
      href: '/leaderboard',
      icon: <Trophy size={20} />,
      label: 'Leaderboard'
    },
    {
      href: '/store-achievements',
      icon: <ShoppingBag size={20} />,
      label: 'Store & Achievements'
    },
    {
      href: '/ai-chat',
      icon: <MessageCircle size={20} />,
      label: 'AI Chat'
    },
    {
      href: '/hall-of-fame',
      icon: <HeartHandshake size={20} />,
      label: 'Hall of Fame'
    },
    {
      href: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings'
    }
  ];
  
  const primaryActions = [
    {
      icon: <Maximize size={20} />,
      label: 'Fullscreen',
      onClick: toggleFullscreen
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
    return null;
  }
  
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
  
  // Close sidebar when clicking outside of it
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !sidebarHidden && 
      e.target instanceof HTMLElement && 
      !e.target.closest('.sidebar') && 
      !e.target.closest('.sidebar-toggle')
    ) {
      setSidebarHidden(true);
    }
  };
  
  return (
    <div 
      className={`min-h-screen flex flex-col ${getBackgroundClass()} animated-grid`}
      onClick={handleClickOutside}
    >
      <div className="flex flex-1 overflow-hidden">
        {!sidebarHidden && (
          <div className="sidebar fixed h-full z-10 w-64 bg-black/60 backdrop-blur-md border-r border-white/10 transition-all duration-300">
            <div className="h-full flex flex-col py-6">
              <div className="px-5 flex items-center justify-between">
                <div className={`${getBrandIconStyle()} mb-6 text-2xl font-bold flex items-center gap-2`}>
                  {getIconComponent('dumbbell', 24)}
                  <span>Solo Rising</span>
                </div>
                <button 
                  onClick={toggleSidebar}
                  className="text-white/80 hover:text-white mb-6"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 px-3">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                      location.pathname.split('/')[1] === item.href.split('/')[1]
                        ? getSidebarAccentColor()
                        : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </a>
                ))}
              </nav>

              <div className="pt-6 px-3 space-y-1">
                <button
                  onClick={handleShareClick}
                  className="w-full flex items-center px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Menu size={20} />
                  <span className="ml-2">Share Profile</span>
                </button>
                
                {primaryActions?.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="sidebar-toggle fixed z-20 top-4 left-4 bg-black/30 hover:bg-black/50 transition-all p-2 rounded-md"
        >
          {sidebarHidden ? (
            <Menu size={20} className="text-white/80" />
          ) : (
            <X size={20} className="text-white/80" />
          )}
        </button>
        
        <main className="flex-1 overflow-y-auto pb-0 relative w-full transition-all">
          <div className="min-h-screen pt-4 px-4">
            <Outlet />
          </div>
        </main>
      </div>

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
