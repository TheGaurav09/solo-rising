
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import { 
  Dumbbell, Trophy, User, Award, 
  ShoppingBag, ChevronLeft, ChevronRight, Flame, Info, 
  ArrowUp, Menu, X, Share2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import ShareModal from './modals/ShareModal';
import Footer from './ui/Footer';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { character, userName, setCharacter, setUserName, streak, lastWorkoutDate } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const streakModalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  // Close streak modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (streakModalRef.current && !streakModalRef.current.contains(event.target as Node)) {
        setShowStreakInfo(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      
      // Fix for auto-login issue: Check auth each time and clear local storage if there's no user
      if (!data.user) {
        // Clear locally stored data if we're not logged in
        localStorage.removeItem('character');
        localStorage.removeItem('userName');
        localStorage.removeItem('points');
        setCharacter(null);
        navigate('/');
        setLoading(false);
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
      // Clear local storage on error
      localStorage.removeItem('character');
      localStorage.removeItem('userName');
      localStorage.removeItem('points');
      navigate('/');
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
    const newState = !isNavCollapsed;
    setIsNavCollapsed(newState);
    // Store preference in localStorage
    localStorage.setItem('navCollapsed', newState.toString());
  };

  const toggleMobileNav = () => {
    const newState = !isMobileNavOpen;
    setIsMobileNavOpen(newState);
    // Store preference in localStorage
    localStorage.setItem('mobileNavOpen', newState.toString());
  };

  useEffect(() => {
    // Load nav collapse preference
    const savedCollapsed = localStorage.getItem('navCollapsed');
    if (savedCollapsed !== null) {
      setIsNavCollapsed(savedCollapsed === 'true');
    }
    
    // Load mobile nav preference
    const savedMobileNavOpen = localStorage.getItem('mobileNavOpen');
    if (savedMobileNavOpen !== null) {
      setIsMobileNavOpen(savedMobileNavOpen === 'true');
    }
  }, []);

  // Close mobile nav when changing routes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${
      character === 'goku' ? 'bg-goku' : 
      character === 'saitama' ? 'bg-saitama' : 
      character === 'jin-woo' ? 'bg-jin-woo' : 
      'bg-background'
    } animated-grid`}>
      <header className="container mx-auto pt-8 pb-6 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold text-gradient ${
              character === 'goku' ? 'goku-gradient' : 
              character === 'saitama' ? 'saitama-gradient' : 
              character === 'jin-woo' ? 'jin-woo-gradient' : 
              ''
            }`}>
              WORKOUT WARS
            </h1>
            <p className="text-white/70 mt-1">Welcome back, {userName}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Nav Toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20" 
              onClick={toggleMobileNav}
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Streak Button */}
            <div className="relative">
              <button 
                className={`p-2 flex items-center justify-center rounded-lg ${
                  character ? `bg-${character}-primary/20 border-${character}-primary/40 border` 
                  : 'bg-primary/20 border-primary/40 border'
                }`}
                onClick={() => setShowStreakInfo(!showStreakInfo)}
                aria-label="Streak information"
              >
                <Flame size={20} className={`${character ? `text-${character}-primary` : 'text-primary'} animate-pulse`} />
              </button>
              
              {showStreakInfo && (
                <div 
                  ref={streakModalRef}
                  className="absolute right-0 mt-2 w-64 p-3 rounded-lg bg-black/80 border border-white/10 shadow-lg z-50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Flame size={18} className={`${character ? `text-${character}-primary` : 'text-primary'}`} />
                    <h4 className="font-medium">{streak} day streak</h4>
                  </div>
                  <p className="text-sm text-white/70 mb-2">
                    Your streak increases each day when you log a workout. If you miss a day, your streak will reset to zero.
                  </p>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    <p>Resets in: {timeUntilReset}</p>
                    {lastWorkoutDate ? (
                      <p className="mt-1">Last workout: {format(new Date(lastWorkoutDate), 'MMM d, yyyy')}</p>
                    ) : (
                      <p className="mt-1">No workouts recorded yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 flex flex-col md:flex-row gap-6 flex-grow">
        {/* Mobile Sidebar Navigation - Overlay */}
        {isMobile && isMobileNavOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={toggleMobileNav}>
            <div className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-background p-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={toggleMobileNav} className="p-2 rounded-lg hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="space-y-2 mt-4">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    location.pathname === '/workout' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'hover:bg-white/5'
                  }`}
                  onClick={() => navigate('/workout')}
                >
                  <Dumbbell size={20} />
                  <span>Workouts</span>
                </div>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    location.pathname === '/profile/me' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'hover:bg-white/5'
                  }`}
                  onClick={() => navigate('/profile/me')}
                >
                  <User size={20} />
                  <span>Profile & Leaderboard</span>
                </div>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    location.pathname === '/achievements' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'hover:bg-white/5'
                  }`}
                  onClick={() => navigate('/achievements')}
                >
                  <Award size={20} />
                  <span>Achievements</span>
                </div>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    location.pathname === '/store' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'hover:bg-white/5'
                  }`}
                  onClick={() => navigate('/store')}
                >
                  <ShoppingBag size={20} />
                  <span>Store</span>
                </div>
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 size={20} />
                  <span>Share App</span>
                </div>
              </nav>
            </div>
          </div>
        )}
      
        {/* Desktop Sidebar Navigation */}
        <div className={`hidden md:block transition-all duration-300 ease-in-out ${isNavCollapsed ? 'md:w-16' : 'md:w-64'} flex-shrink-0`}>
          <AnimatedCard className="p-2 relative">
            <button 
              onClick={toggleNav}
              className="absolute top-2 right-2 md:flex items-center justify-center hidden w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isNavCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            
            <nav className="space-y-1 mt-8 md:mt-0">
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === '/workout' 
                  ? character 
                    ? `bg-${character}-primary/20 text-${character}-primary` 
                    : 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/5'
                }`}
                onClick={() => navigate('/workout')}
              >
                <Dumbbell size={20} />
                {!isNavCollapsed && <span>Workouts</span>}
              </div>
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === '/profile/me' 
                  ? character 
                    ? `bg-${character}-primary/20 text-${character}-primary` 
                    : 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/5'
                }`}
                onClick={() => navigate('/profile/me')}
              >
                <User size={20} />
                {!isNavCollapsed && <span>Profile & Leaderboard</span>}
              </div>
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === '/achievements' 
                  ? character 
                    ? `bg-${character}-primary/20 text-${character}-primary` 
                    : 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/5'
                }`}
                onClick={() => navigate('/achievements')}
              >
                <Award size={20} />
                {!isNavCollapsed && <span>Achievements</span>}
              </div>
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === '/store' 
                  ? character 
                    ? `bg-${character}-primary/20 text-${character}-primary` 
                    : 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/5'
                }`}
                onClick={() => navigate('/store')}
              >
                <ShoppingBag size={20} />
                {!isNavCollapsed && <span>Store</span>}
              </div>
              <div 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 size={20} />
                {!isNavCollapsed && <span>Share App</span>}
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
          <ArrowUp size={20} className="text-white" />
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)}
          character={character || undefined}
        />
      )}
    </div>
  );
};

export default Dashboard;
