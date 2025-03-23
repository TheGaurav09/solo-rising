
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Home,
  Dumbbell,
  Award,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  MessageSquare,
  Trophy,
  Volume2,
  VolumeX
} from 'lucide-react';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/context/AudioContext';

interface DashboardProps {
  videoBackgroundEnabled: boolean;
  setVideoBackgroundEnabled: (enabled: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  videoBackgroundEnabled, 
  setVideoBackgroundEnabled 
}) => {
  const { userId, character } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isPlaying, togglePlay } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  // Protect routes - redirect to home if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (isClient) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          navigate('/', { replace: true });
        }
      }
    };

    checkAuth();
  }, [isClient, navigate]);

  if (!isClient) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('sb-auth-data');
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getCharacterColor = () => {
    if (character === 'goku') return 'from-goku-primary/20 to-goku-primary/10';
    if (character === 'saitama') return 'from-saitama-primary/20 to-saitama-primary/10';
    if (character === 'jin-woo') return 'from-jin-woo-primary/20 to-jin-woo-primary/10';
    return 'from-blue-900/20 to-indigo-900/10';
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-gray-900 to-black border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-bold">Solo Rising</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <Home className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/profile-workout" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <Dumbbell className="mr-3 h-5 w-5" />
            <span>Profile & Workout</span>
          </NavLink>
          
          <NavLink 
            to="/leaderboard" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <Trophy className="mr-3 h-5 w-5" />
            <span>Leaderboard</span>
          </NavLink>
          
          <NavLink 
            to="/store-achievements" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <ShoppingCart className="mr-3 h-5 w-5" />
            <span>Store & Achievements</span>
          </NavLink>
          
          <NavLink 
            to="/ai-chat" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <MessageSquare className="mr-3 h-5 w-5" />
            <span>AI Chat</span>
          </NavLink>
          
          <NavLink 
            to="/hall-of-fame" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <Award className="mr-3 h-5 w-5" />
            <span>Hall of Fame</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg ${
                isActive 
                  ? `bg-gradient-to-r ${getCharacterColor()}` 
                  : 'hover:bg-white/5'
              }`
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex justify-between mb-3">
            <button 
              onClick={togglePlay}
              className="flex items-center p-2 rounded hover:bg-white/5"
            >
              {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => setVideoBackgroundEnabled(!videoBackgroundEnabled)}
              className={`p-2 rounded hover:bg-white/5 ${videoBackgroundEnabled ? 'text-blue-400' : 'text-white/60'}`}
            >
              <span className="text-xs">BG</span>
            </button>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center p-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="flex flex-col w-full">
        <header className="bg-gradient-to-r from-gray-900 to-black border-b border-white/10 px-4 py-3 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold">Solo Rising</h1>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-white/5 focus:outline-none"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        
        {/* Mobile sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 bg-black/80 md:hidden" onClick={() => setShowSidebar(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 to-black border-r border-white/10" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h1 className="text-xl font-bold">Solo Rising</h1>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg hover:bg-white/5 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <Home className="mr-3 h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
                
                <NavLink 
                  to="/profile-workout" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <Dumbbell className="mr-3 h-5 w-5" />
                  <span>Profile & Workout</span>
                </NavLink>
                
                <NavLink 
                  to="/leaderboard" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <Trophy className="mr-3 h-5 w-5" />
                  <span>Leaderboard</span>
                </NavLink>
                
                <NavLink 
                  to="/store-achievements" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  <span>Store & Achievements</span>
                </NavLink>
                
                <NavLink 
                  to="/ai-chat" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>AI Chat</span>
                </NavLink>
                
                <NavLink 
                  to="/hall-of-fame" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <Award className="mr-3 h-5 w-5" />
                  <span>Hall of Fame</span>
                </NavLink>
                
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg ${
                      isActive 
                        ? `bg-gradient-to-r ${getCharacterColor()}` 
                        : 'hover:bg-white/5'
                    }`
                  }
                >
                  <Settings className="mr-3 h-5 w-5" />
                  <span>Settings</span>
                </NavLink>
              </nav>
              
              <div className="p-4 border-t border-white/10">
                <div className="flex justify-between mb-3">
                  <button 
                    onClick={togglePlay}
                    className="flex items-center p-2 rounded hover:bg-white/5"
                  >
                    {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <button
                    onClick={() => setVideoBackgroundEnabled(!videoBackgroundEnabled)}
                    className={`p-2 rounded hover:bg-white/5 ${videoBackgroundEnabled ? 'text-blue-400' : 'text-white/60'}`}
                  >
                    <span className="text-xs">BG</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-center p-2 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Logout confirmation modal */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default Dashboard;
