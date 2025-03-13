import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { User, ShoppingBag, MessageCircle, Maximize, Trophy, HeartHandshake, Settings, ChevronLeft, ChevronRight, Menu, X, Share2 } from 'lucide-react';
import { getIconComponent } from '@/lib/iconUtils';
import { AnimatePresence, motion } from 'framer-motion';
import ShareModal from './modals/ShareModal';
import CoinDisplay from './ui/CoinDisplay';
import { useAudio } from '@/context/AudioContext';
import { LayoutDashboard } from 'lucide-react';
import WarningNotification from './WarningNotification';
import DailySupportPopup from './modals/DailySupportPopup';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, hasSelectedCharacter, userId } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const { togglePlay, isPlaying, setVolume } = useAudio();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isAIChat = location.pathname.includes('/ai-chat');

  useEffect(() => {
    const savedSidebarHiddenState = localStorage.getItem('sidebar-hidden');
    if (savedSidebarHiddenState) {
      setSidebarHidden(savedSidebarHiddenState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-hidden', sidebarHidden.toString());
  }, [sidebarHidden]);

  useEffect(() => {
    const audio = document.querySelector('audio');
    if (audio && character) {
      let musicPath = '';
      
      switch (character) {
        case 'goku':
          musicPath = '/goku-bgm.mp3';
          break;
        case 'saitama':
          musicPath = '/saitama.mp3';
          break;
        case 'jin-woo':
          musicPath = '/jinwoo.mp3';
          break;
        default:
          musicPath = '/background-music.mp3';
          break;
      }
      
      audio.src = musicPath;
      
      if (isPlaying) {
        audio.play().catch(e => console.error("Audio playback error:", e));
      }
    }
  }, [character, isPlaying]);

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
  
  useEffect(() => {
    const checkSupportPopup = () => {
      if (!userId) return;
      
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem('support_popup_last_shown');
      
      if (lastShown !== today) {
        setTimeout(() => {
          setShowSupportPopup(true);
          localStorage.setItem('support_popup_last_shown', today);
        }, 10000);
      }
    };
    
    checkSupportPopup();
  }, [userId]);
  
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
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard'
    },
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
  
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    closed: { 
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };
  
  return (
    <div 
      className={`min-h-screen flex flex-col ${getBackgroundClass()} animated-grid`}
      onClick={handleClickOutside}
    >
      <div className="flex flex-1 overflow-hidden">
        <motion.div 
          className="sidebar fixed h-full z-10 w-64 bg-black/60 backdrop-blur-md border-r border-white/10"
          initial={sidebarHidden ? "closed" : "open"}
          animate={sidebarHidden ? "closed" : "open"}
          variants={sidebarVariants}
        >
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
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    location.pathname.split('/')[1] === item.href.split('/')[1]
                      ? getSidebarAccentColor()
                      : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-6 px-3 space-y-1">
              <button
                onClick={handleShareClick}
                className="w-full flex items-center px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
              >
                <Share2 size={20} />
                <span className="ml-2">Share SoloRising</span>
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
        </motion.div>
        
        {sidebarHidden && (
          <motion.button 
            onClick={toggleSidebar}
            className="sidebar-toggle fixed z-20 top-4 left-4 bg-black/30 hover:bg-black/50 transition-all p-2 rounded-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} className="text-white/80" />
          </motion.button>
        )}
        
        <main 
          ref={contentRef} 
          className="flex-1 overflow-y-auto pb-0 relative w-full transition-all"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
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
        
        {showSupportPopup && (
          <DailySupportPopup
            isOpen={showSupportPopup}
            onClose={() => setShowSupportPopup(false)}
          />
        )}
      </AnimatePresence>
      
      {userId && <WarningNotification userId={userId} />}
    </div>
  );
};

export default Dashboard;
