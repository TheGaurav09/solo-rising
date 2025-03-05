
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  User, 
  Award, 
  Trophy, 
  LogOut, 
  Settings,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import AnimatedButton from './ui/AnimatedButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { character, userName } = useUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    navigate('/');
    setIsLogoutModalOpen(false);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: <Home size={20} /> },
    { path: '/workout', label: 'Workout', icon: <Dumbbell size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: '/store', label: 'Store', icon: <ShoppingBag size={20} /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <MessageCircle size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  // Check if user is authenticated
  const isAuthenticated = character !== null;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-white/10 py-3 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold text-white flex items-center">
          <span className={`mr-2 text-${character}-primary`}>Warrior</span>Fit
        </Link>
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border border-white/10 text-white w-56">
              {navItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path}
                  className={`flex items-center gap-2 ${location.pathname === item.path ? 'bg-white/10' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings size={20} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-400"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <LogOut size={20} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <AnimatedButton
                key={item.path}
                variant={location.pathname === item.path ? "primary" : "outline"}
                character={character}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1"
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </AnimatedButton>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 flex items-center gap-1">
                  {userName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black border border-white/10 text-white">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2" size={16} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="text-red-400" 
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="bg-black border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
