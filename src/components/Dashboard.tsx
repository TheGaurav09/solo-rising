import React, { useState, useEffect } from 'react';
import {
  Home,
  User,
  LayoutDashboard,
  ListChecks,
  Trophy,
  Settings,
  MessageSquare,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Gem,
  Brain,
} from 'lucide-react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { useAudio } from '@/context/AudioContext';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, route }) => {
  const location = useLocation();
  const isActive = location.pathname === route;
  
  return (
    <li className="mb-1">
      <Link
        to={route}
        className={`flex items-center p-2 rounded-md text-sm font-medium hover:bg-white/5 transition-colors ${
          isActive ? 'bg-white/5' : 'text-white/60'
        }`}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </li>
  );
};

interface DashboardProps {
  videoBackgroundEnabled: boolean;
  setVideoBackgroundEnabled: (enabled: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ videoBackgroundEnabled, setVideoBackgroundEnabled }) => {
  const { warriorName, character, logout, country } = useUser();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { toggleMute, isMuted } = useAudio();
  
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const renderLogoutModal = () => {
    if (!showLogoutModal) return null;
    
    return (
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        character={character}
      />
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-black border-r border-white/10 flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <Link to="/dashboard" className="text-lg font-bold">
                SOLO RISING
              </Link>
              <button onClick={toggleSidebar} className="md:hidden text-white/60 hover:text-white">
                <ChevronsLeft className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 p-4">
              <ul>
                <NavItem icon={LayoutDashboard} label="Dashboard" route="/dashboard" />
                <NavItem icon={User} label="Profile & Workout" route="/profile-workout" />
                <NavItem icon={ListChecks} label="Leaderboard" route="/leaderboard" />
                <NavItem icon={Gem} label="Store & Achievements" route="/store-achievements" />
                <NavItem icon={Brain} label="AI Training Assistant" route="/ai-chat" />
                <NavItem icon={Trophy} label="Hall of Fame" route="/hall-of-fame" />
                <NavItem icon={Settings} label="Settings" route="/settings" />
              </ul>
            </nav>

            <div className="p-4 border-t border-white/10">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center justify-between rounded-md text-sm font-medium hover:bg-white/5 transition-colors">
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={`/${character}.jpeg`} alt={warriorName} />
                      <AvatarFallback>{warriorName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{warriorName}</span>
                  </div>
                  <MoreVerticalIcon className="h-4 w-4 text-white/60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border border-white/10">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-white/5">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="hover:bg-white/5 text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-white/10">
            {/* Hamburger menu for mobile */}
            <button onClick={toggleSidebar} className="md:hidden text-white/60 hover:text-white">
              <ChevronsRight className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleMute()}
                className="p-2 rounded-md hover:bg-white/5 transition-colors"
              >
                {isMuted ? <SpeakerOffIcon className="h-5 w-5" /> : <SpeakerOnIcon className="h-5 w-5" />}
              </button>
              
              <span className="text-sm text-white/60">{country}</span>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4">
            <Outlet />
          </div>
        </main>
        
        {renderLogoutModal()}
      </div>
    </div>
  );
};

export default Dashboard;

// Icons
const MoreVerticalIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical" width={size} height={size}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);

const SpeakerOnIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-speaker" width={size} height={size}><rect width="14" height="8" x="5" y="9" rx="2"/><path d="M12 2v2M12 20v2"/></svg>
);

const SpeakerOffIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-speaker-off" width={size} height={size}><rect width="14" height="8" x="5" y="9" rx="2"/><path d="M2 2l20 20M12 2v2M12 20v2"/></svg>
);
