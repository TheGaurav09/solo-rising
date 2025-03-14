
import React, { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import StreakRules from '@/components/StreakRules';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userId, character } = useUser();
  const [showStreak, setShowStreak] = useState(false);
  
  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/');
      }
    };
    
    checkAuth();
    
    // Get the streak rules display state from local storage
    const hasSeenStreakRules = localStorage.getItem('seen_streak_rules');
    if (!hasSeenStreakRules) {
      setShowStreak(true);
      localStorage.setItem('seen_streak_rules', 'true');
    }
  }, [navigate]);
  
  const handleDismissStreak = () => {
    setShowStreak(false);
  };
  
  return (
    <div>
      <Dashboard />
      
      {showStreak && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <StreakRules />
            <div className="mt-4 text-center">
              <button 
                onClick={handleDismissStreak}
                className={`px-4 py-2 rounded font-medium ${
                  character 
                    ? `bg-${character}-primary/80 hover:bg-${character}-primary`
                    : 'bg-white/10 hover:bg-white/20'
                } transition-colors`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
