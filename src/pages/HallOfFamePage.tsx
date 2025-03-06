import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { Coffee, Trophy, Medal, Award, Crown, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const HallOfFamePage = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [topWarriors, setTopWarriors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopWarriors = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, warrior_name, character_type, points, country')
          .order('points', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching top warriors:", error);
          setError(error.message);
        } else {
          setTopWarriors(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching top warriors:", err);
        setError("Failed to load the Hall of Fame. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopWarriors();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading Hall of Fame...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">HALL OF FAME</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            The legendary warriors who have achieved greatness
          </p>
        </div>

        {/* Existing Hall of Fame content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topWarriors.map((warrior, index) => (
            <div key={warrior.id} className="bg-black/40 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {index === 0 && <Crown size={32} className="text-yellow-500 mr-2" />}
                  {index === 1 && <Award size={32} className="text-gray-400 mr-2" />}
                  {index === 2 && <Trophy size={32} className="text-orange-400 mr-2" />}
                  {index > 2 && <Medal size={24} className="text-white/50 mr-2" />}
                  <h3 className="text-xl font-bold">{warrior.warrior_name}</h3>
                </div>
                <div className="text-white/60">#{index + 1}</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 flex items-center gap-1">
                  <Star size={16} className="inline-block mr-1 text-yellow-400" />
                  Points:
                </span>
                <span className="font-medium">{warrior.points}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flag inline-block mr-1"><path d="M4 15s1-1 4-1 5 2 8 2v-3c0-8-5-8-8-11.82C5.84 2.32 4 7 4 7v8z"/><path d="M20 17v-6c0-1.1-.9-2-2-2H7"/></svg>
                  Country:
                </span>
                <span className="font-medium">{warrior.country || 'Global'}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Buy Me a Coffee section */}
        <div className="mt-16 text-center">
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Support Solo Rising</h2>
            <p className="text-white/70 mb-6">
              If you're enjoying Solo Rising and want to support its development, consider buying me a coffee!
            </p>
            <a 
              href="https://www.buymeacoffee.com/SoloRising" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFDD00] text-black font-medium px-6 py-3 rounded-md hover:bg-[#E5C700] transition-colors"
            >
              <Coffee size={24} />
              <span>Buy me a coffee</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFamePage;
