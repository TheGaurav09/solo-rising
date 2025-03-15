
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';
import Leaderboard from '@/components/Leaderboard';
import { Trophy, ChevronDown, X } from 'lucide-react';
import Profile from '@/components/Profile';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Import country list
import { countries } from '@/components/Countries';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

const ProfileModal = ({ userId, onClose }: ProfileModalProps) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        setUserData(data);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="relative w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <AnimatedCard className="border border-white/10 relative">
          <button 
            onClick={onClose}
            className="absolute right-2 top-2 p-2 rounded-full bg-black/30 text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
          
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Warrior Profile</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              userData ? (
                <Profile userData={userData} isViewingOtherUser={true} />
              ) : (
                <div className="text-center py-6 text-white/50">
                  <p>Could not load user profile</p>
                </div>
              )
            )}
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};

const LeaderboardPage = () => {
  const { character } = useUser();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("Global");
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const handleViewProfile = (userId: string) => {
    setViewingUser(userId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/10">
          <Trophy size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-white/60 text-sm">Compete with others and rise through the ranks</p>
        </div>
      </div>
      
      <div className="relative z-10 mb-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto flex justify-between items-center gap-2 border border-white/10 bg-black/20"
          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
        >
          <span>{selectedCountry}</span>
          <ChevronDown size={16} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
        </Button>
        
        <AnimatePresence>
          {showCountryDropdown && (
            <motion.div 
              className="absolute mt-1 w-full sm:w-64 max-h-60 overflow-y-auto rounded-md border border-white/10 bg-black/90 backdrop-blur-lg shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-1">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => handleCountrySelect("Global")}
                >
                  Global
                </button>
                {countries.map((country) => (
                  <button
                    key={country}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatedCard className="border border-white/10 backdrop-blur-md">
        <Leaderboard 
          countryFilter={selectedCountry === "Global" ? undefined : selectedCountry}
          onViewProfile={handleViewProfile}
        />
      </AnimatedCard>

      <AnimatePresence>
        {viewingUser && (
          <ProfileModal 
            userId={viewingUser} 
            onClose={() => setViewingUser(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Add margin between content and footer */}
      <div className="mt-16"></div>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
