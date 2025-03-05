
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import AnimatedCard from './ui/AnimatedCard';
import WorkoutLogger from './WorkoutLogger';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import { Dumbbell, Trophy, User, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { character, userName } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleWorkoutLogged = (points: number) => {
    toast({
      title: "Workout Logged!",
      description: `You earned ${points} points for this workout.`,
      duration: 3000,
    });
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

  const getNavItemClass = (tab: string) => {
    return `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      activeTab === tab 
        ? character 
          ? `bg-${character}-primary/20 text-${character}-primary` 
          : 'bg-primary/20 text-primary' 
        : 'hover:bg-white/5'
    }`;
  };

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
                className={getNavItemClass('dashboard')}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </div>
              <div 
                className={getNavItemClass('workout')}
                onClick={() => setActiveTab('workout')}
              >
                <Dumbbell size={20} />
                <span>Log Workout</span>
              </div>
              <div 
                className={getNavItemClass('leaderboard')}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={20} />
                <span>Leaderboard</span>
              </div>
              <div 
                className={getNavItemClass('profile')}
                onClick={() => setActiveTab('profile')}
              >
                <User size={20} />
                <span>Profile</span>
              </div>
              <div 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-white/60 hover:bg-white/5 mt-4 border-t border-white/10 pt-4"
                onClick={() => {
                  // This would normally log out the user
                  toast({
                    title: "Logout",
                    description: "This would log you out in a real app.",
                    duration: 3000,
                  });
                }}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </div>
            </nav>
          </AnimatedCard>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <WorkoutLogger onWorkoutLogged={handleWorkoutLogged} />
                </div>
                <div>
                  <Leaderboard />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'workout' && (
            <div className="max-w-md mx-auto">
              <WorkoutLogger onWorkoutLogged={handleWorkoutLogged} />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}
          
          {activeTab === 'profile' && (
            <Profile />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
