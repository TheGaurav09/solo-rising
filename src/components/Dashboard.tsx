
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import { Dumbbell, Trophy, User, LayoutDashboard, LogOut, Award, ShoppingBag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { character, userName, setCharacter, setUserName } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // User is not logged in, clear local storage and redirect
        localStorage.removeItem('character');
        localStorage.removeItem('userName');
        localStorage.removeItem('points');
        setCharacter(null);
        navigate('/');
        return;
      }

      // Get user data from our database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (error) throw error;

      // Set user data in context
      setCharacter(userData.character_type as 'goku' | 'saitama' | 'jin-woo');
      setUserName(userData.warrior_name);
    } catch (error) {
      console.error('Error checking auth:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClass = () => {
    switch (character) {
      case 'goku': return 'bg-goku';
      case 'saitama': return 'bg-saitama';
      case 'jin-woo': return 'bg-jin-woo';
      default: return 'bg-background';
    }
  };

  const getTitleGradient = () => {
    switch (character) {
      case 'goku': return 'goku-gradient';
      case 'saitama': return 'saitama-gradient';
      case 'jin-woo': return 'jin-woo-gradient';
      default: return '';
    }
  };

  const getNavItemClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      isActive 
        ? character 
          ? `bg-${character}-primary/20 text-${character}-primary` 
          : 'bg-primary/20 text-primary' 
        : 'hover:bg-white/5'
    }`;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage
      localStorage.removeItem('character');
      localStorage.removeItem('userName');
      localStorage.removeItem('points');
      setCharacter(null);
      navigate('/');
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} animated-grid pb-20`}>
      <header className="container mx-auto pt-8 pb-6 px-4">
        <h1 className={`text-3xl font-bold text-gradient ${getTitleGradient()}`}>
          WORKOUT WARS
        </h1>
        <p className="text-white/70 mt-1">Welcome back, {userName}</p>
      </header>
      
      <main className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <AnimatedCard className="p-2">
            <nav className="space-y-1">
              <div 
                className={getNavItemClass('/workout')}
                onClick={() => navigate('/workout')}
              >
                <Dumbbell size={20} />
                <span>Workouts</span>
              </div>
              <div 
                className={getNavItemClass('/profile/me')}
                onClick={() => navigate('/profile/me')}
              >
                <User size={20} />
                <span>Profile & Leaderboard</span>
              </div>
              <div 
                className={getNavItemClass('/achievements')}
                onClick={() => navigate('/achievements')}
              >
                <Award size={20} />
                <span>Achievements & Store</span>
              </div>
              <div 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-white/60 hover:bg-white/5 mt-4 border-t border-white/10 pt-4"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </div>
            </nav>
          </AnimatedCard>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
