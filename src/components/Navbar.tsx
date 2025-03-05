
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { 
  Menu, 
  User, 
  Users, 
  Award, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3,
  Settings,
  LogOut,
  Home,
  Share2
} from 'lucide-react';
import CoinDisplay from './ui/CoinDisplay';
import { Sidebar } from './ui/sidebar';
import AnimatedButton from './ui/AnimatedButton';
import { toast } from './ui/use-toast';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import ShareModal from './modals/ShareModal';

export default function Navbar() {
  const { character, hasSelectedCharacter, streak } = useUser();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const navigationItems = [
    {
      href: '/profile-workout',
      icon: <Home size={20} />,
      label: 'Home',
    },
    {
      href: '/profile/me',
      icon: <User size={20} />,
      label: 'Profile',
    },
    {
      href: '/leaderboard',
      icon: <BarChart3 size={20} />,
      label: 'Leaderboard',
    },
    {
      href: '/store-achievements',
      icon: <Award size={20} />,
      label: 'Achievements & Store',
    },
    {
      href: '/ai-chat',
      icon: <MessageSquare size={20} />,
      label: 'AI Coach',
    },
    {
      href: '/hall-of-fame',
      icon: <Trophy size={20} />,
      label: 'Hall of Fame',
    },
    {
      href: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings',
    },
  ];

  const primaryActions = [
    {
      label: 'Share Progress',
      icon: <Share2 size={20} />,
      onClick: handleShareClick,
    },
  ];

  if (!hasSelectedCharacter) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-40 px-4 md:px-6 py-3 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSidebar(true)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <Menu size={24} />
            </button>
            <Link to="/profile-workout" className="font-bold text-xl tracking-tight">
              Solo Rising
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                <span className="text-yellow-500">🔥</span>
                <span>{streak} day streak</span>
              </div>
            )}
            
            <CoinDisplay />
          </div>
        </div>
      </div>
      
      <Sidebar 
        navigationItems={navigationItems}
        primaryActions={primaryActions}
        accentClass={character ? `bg-${character}-primary text-black` : 'bg-primary text-primary-foreground'}
        brandIcon={<LogoIcon character={character} />}
        handleShareClick={handleShareClick}
      />
      
      {showLogoutModal && (
        <LogoutConfirmModal 
          onConfirm={handleLogout} 
          onCancel={() => setShowLogoutModal(false)}
          character={character}
        />
      )}
      
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}

const LogoIcon = ({ character }: { character?: 'goku' | 'saitama' | 'jin-woo' | null }) => {
  let bg = 'bg-primary';
  
  if (character) {
    switch (character) {
      case 'goku': bg = 'bg-goku-primary'; break;
      case 'saitama': bg = 'bg-saitama-primary'; break;
      case 'jin-woo': bg = 'bg-jin-woo-primary'; break;
    }
  }
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} text-black font-bold`}>
      S
    </div>
  );
};

const Trophy = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);
