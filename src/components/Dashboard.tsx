
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import { 
  Dumbbell, Trophy, User, LogOut, Award, 
  ShoppingBag, ChevronLeft, ChevronRight, Flame, Info 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import Footer from './ui/Footer';
import { format } from 'date-fns';

const Dashboard = () => {
  const { character, userName, setCharacter, setUserName, streak, lastWorkoutDate, updateLastWorkoutDate } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Calculate time until streak reset
    const calculateTimeUntilReset = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${diffHrs}h ${diffMins}m`);
    };
    
    // Calculate initially and then update every minute
    calculateTimeUntilReset();
    const intervalId = setInterval(calculateTimeUntilReset, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Check if we have locally stored data
        const storedCharacter = localStorage.getItem('character');
        const storedUserName = localStorage.getItem('userName');
        
        if (storedCharacter && storedUserName) {
          // Allow access with locally stored data
          setCharacter(storedCharacter as 'goku' | 'saitama' | 'jin-woo');
          setUserName(storedUserName);
          setLoading(false);
          return;
        }
        
        // No local data either, redirect to home
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

      // Set user data in context and localStorage for faster loading
      setCharacter(userData.character_type as 'goku' | 'saitama' | 'jin-woo');
      setUserName(userData.warrior_name);
      localStorage.setItem('character', userData.character_type);
      localStorage.setItem('userName', userData.warrior_name);
      localStorage.setItem('points', userData.points.toString());
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

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
    // Store preference in localStorage
    localStorage.setItem('navCollapsed', (!isNavCollapsed).toString());
  };

  useEffect(() => {
    // Load nav collapse preference
    const savedCollapsed = localStorage.getItem('navCollapsed');
    if (savedCollapsed !== null) {
      setIsNavCollapsed(savedCollapsed === 'true');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()} animated-grid`}>
      <header className="container mx-auto pt-8 pb-6 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold text-gradient ${getTitleGradient()}`}>
              WORKOUT WARS
            </h1>
            <p className="text-white/70 mt-1">Welcome back, {userName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className={`px-4 py-2 flex items-center gap-2 rounded-lg ${
                  character ? `bg-${character}-primary/20 border-${character}-primary/40 border` 
                  : 'bg-primary/20 border-primary/40 border'
                }`}
              >
                <Flame size={20} className={`${character ? `text-${character}-primary` : 'text-primary'} animate-pulse`} />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{streak} day streak</span>
                    <button 
                      onClick={() => setShowStreakInfo(!showStreakInfo)}
                      className="text-white/60 hover:text-white"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-white/60">
                    Resets in: {timeUntilReset}
                  </div>
                </div>
              </div>
              
              {showStreakInfo && (
                <div className="absolute right-0 mt-2 w-64 p-3 rounded-lg bg-black/80 border border-white/10 shadow-lg z-50 backdrop-blur-sm">
                  <h4 className="font-medium mb-2">Streak System</h4>
                  <p className="text-sm text-white/70 mb-2">
                    Your streak increases each day when you log a workout. If you miss a day, your streak will reset to zero.
                  </p>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    {lastWorkoutDate ? (
                      <p>Last workout: {format(new Date(lastWorkoutDate), 'MMM d, yyyy')}</p>
                    ) : (
                      <p>No workouts recorded yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 flex flex-col md:flex-row gap-6 flex-grow">
        {/* Sidebar Navigation */}
        <div className={`transition-all duration-300 ease-in-out ${isNavCollapsed ? 'md:w-16' : 'md:w-64'} flex-shrink-0`}>
          <AnimatedCard className="p-2 relative">
            <button 
              onClick={toggleNav}
              className="absolute top-2 right-2 md:flex items-center justify-center hidden w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isNavCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            
            <nav className="space-y-1 mt-8 md:mt-0">
              <div 
                className={getNavItemClass('/workout')}
                onClick={() => navigate('/workout')}
              >
                <Dumbbell size={20} />
                {!isNavCollapsed && <span>Workouts</span>}
              </div>
              <div 
                className={getNavItemClass('/profile/me')}
                onClick={() => navigate('/profile/me')}
              >
                <User size={20} />
                {!isNavCollapsed && <span>Profile & Leaderboard</span>}
              </div>
              <div 
                className={getNavItemClass('/achievements')}
                onClick={() => navigate('/achievements')}
              >
                <Award size={20} />
                {!isNavCollapsed && <span>Achievements</span>}
              </div>
              <div 
                className={getNavItemClass('/store')}
                onClick={() => navigate('/store')}
              >
                <ShoppingBag size={20} />
                {!isNavCollapsed && <span>Store</span>}
              </div>
            </nav>
          </AnimatedCard>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-lg hover:scale-110 transform duration-150"
          aria-label="Scroll to top"
        >
          <ChevronRight size={20} className="text-white rotate-270 transform -rotate-90" />
        </button>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={async () => {
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
            setShowLogoutConfirm(false);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
          character={character || undefined}
        />
      )}
    </div>
  );
};

export default Dashboard;
