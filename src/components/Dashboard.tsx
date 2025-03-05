
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Trophy, Users, ShoppingBag, MessageSquare, Award, UserCircle, LogOut, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { character, userName, points } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Instead of using removeUser which doesn't exist, we'll navigate to home
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
        <nav className="w-full lg:w-64 lg:min-h-screen bg-black/50 backdrop-blur-md lg:fixed">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/20` : 'bg-primary/20'}`}>
                <UserCircle className={character ? `text-${character}-primary` : 'text-primary'} size={20} />
              </div>
              <div>
                <div className="font-bold">{userName}</div>
                <div className="text-xs text-white/70">{points} points</div>
              </div>
            </div>
            
            <div className="space-y-1">
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
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-white/80 hover:bg-white/10"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="min-h-screen">
            <Outlet />
          </div>
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
