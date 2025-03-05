
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { 
  Trophy, Users, ShoppingBag, MessageSquare, Award, UserCircle, 
  LogOut, Settings, ChevronLeft, ChevronRight, Share2, Expand, Volume2, VolumeX 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import { supabase } from '@/integrations/supabase/client';
import Footer from './ui/Footer';

const Dashboard = () => {
  const { character, userName, points } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [fullscreen, setFullscreen] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Check if sidebar state is saved in localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === 'true');
    }
    
    // Initialize audio
    audioRef.current = new Audio('/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };
  
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Unable to play background music. Please try again.",
            variant: "destructive",
          });
        });
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // The auth state change listener in UserContext will clear the user data
      navigate('/');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };
  
  const isChatPage = location.pathname === '/ai-chat';
  
  const navItems = [
    {
      path: '/profile-workout',
      icon: <UserCircle size={20} />,
      label: 'Profile & Workout'
    },
    {
      path: '/leaderboard',
      icon: <Trophy size={20} />,
      label: 'Leaderboard'
    },
    {
      path: '/store-achievements',
      icon: <ShoppingBag size={20} />,
      label: 'Store & Achievements'
    },
    {
      path: '/ai-chat',
      icon: <MessageSquare size={20} />,
      label: 'AI Trainer Chat'
    },
    {
      path: '/hall-of-fame',
      icon: <Award size={20} />,
      label: 'Hall of Fame'
    },
    {
      path: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings'
    }
  ];

  return (
    <div className={`min-h-screen bg-black ${character ? `bg-${character}` : 'animated-grid'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <nav className={`${sidebarCollapsed ? 'w-16' : 'w-full lg:w-64'} transition-all duration-300 ease-in-out min-h-screen bg-black/50 backdrop-blur-md fixed z-10`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/20` : 'bg-primary/20'}`}>
                <UserCircle className={character ? `text-${character}-primary` : 'text-primary'} size={20} />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-bold">{userName}</div>
                  <div className="text-xs text-white/70">{points} points</div>
                </div>
              )}
              <button 
                onClick={toggleSidebar}
                className="ml-auto p-1 rounded-full hover:bg-white/10 transition-colors lg:flex hidden"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
            
            <div className="space-y-1 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? character 
                        ? `bg-${character}-primary/20 text-${character}-primary` 
                        : 'bg-primary/20 text-primary'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
            
            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                onClick={toggleMusic}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-white/80 hover:bg-white/10"
              >
                {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                {!sidebarCollapsed && <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>}
              </button>
              
              {!sidebarCollapsed && (
                <div className="px-3 py-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-white/80 hover:bg-white/10"
              >
                <Expand size={20} />
                {!sidebarCollapsed && <span>Fullscreen</span>}
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="fixed bottom-4 right-4 z-20 p-3 rounded-full bg-black/80 text-white shadow-lg lg:hidden"
        >
          {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        
        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="min-h-screen">
            <Outlet />
          </div>
          {!isChatPage && <Footer />}
        </main>
      </div>
      
      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
