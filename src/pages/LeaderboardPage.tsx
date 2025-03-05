import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Users, Globe, MapPin, User, Medal, Trophy, ExternalLink, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import InfoTooltip from '@/components/ui/InfoTooltip';
import Footer from '@/components/ui/Footer';

const countries = [
  "Global", "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "China", "India", "Brazil", "Mexico", "South Africa", 
  "Russia", "Italy", "Spain", "South Korea", "Netherlands", "Sweden", "Norway"
];

const LeaderboardPage = () => {
  const { character, userName } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'regional' | 'character'>('global');
  const [selectedRegion, setSelectedRegion] = useState<string>('Global');

  useEffect(() => {
    fetchLeaderboardData();
  }, [leaderboardType, selectedRegion]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        setLoading(false);
        return;
      }

      // Build leaderboard query
      let query = supabase
        .from('users')
        .select('id, warrior_name, character_type, points, streak, country')
        .order('points', { ascending: false })
        .limit(100);
      
      if (leaderboardType === 'regional' && selectedRegion !== 'Global') {
        query = query.eq('country', selectedRegion);
      } else if (leaderboardType === 'character' && character) {
        query = query.eq('character_type', character);
      }
      
      const { data: leaderboard, error: leaderboardError } = await query;

      if (leaderboardError) {
        console.error("Leaderboard fetch error:", leaderboardError);
      } else {
        const rankedLeaderboard = leaderboard?.map((user, index) => ({
          ...user,
          rank: index + 1
        })) || [];
        
        setLeaderboardData(rankedLeaderboard);
        
        const userEntry = rankedLeaderboard.find(entry => entry.id === currentUser.user?.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const getCharacterColor = (char: string) => {
    switch(char) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: return 'text-white';
    }
  };

  const renderLeaderboardTypeSelector = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'global' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('global')}
        >
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Global</span>
          </div>
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'regional' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('regional')}
        >
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>Regional</span>
          </div>
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'character' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('character')}
        >
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>Character</span>
          </div>
        </button>
      </div>
    );
  };

  const renderRegionSelector = () => {
    if (leaderboardType !== 'regional') return null;
    
    return (
      <div className="mb-4">
        <select
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
        >
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    );
  };

  const visibleLeaderboard = showAllLeaderboard ? leaderboardData : leaderboardData.slice(0, 20);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            Rankings
            <InfoTooltip 
              content="See how you rank against other warriors based on total points earned."
              position="right"
            />
          </h2>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-white/60" />
            {leaderboardData.length > 20 && (
              <button 
                onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
              >
                {showAllLeaderboard ? (
                  <>Show Less <ChevronUp size={14} /></>
                ) : (
                  <>Show All <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </div>
        </div>
        
        {renderLeaderboardTypeSelector()}
        {renderRegionSelector()}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found in this leaderboard</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {visibleLeaderboard.map((entry, index) => (
              <div key={index}>
                <div 
                  className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer hover-border animated-border ${
                    entry.warrior_name === userName
                      ? `bg-${character}-primary/20 border border-${character}-primary/40` 
                      : 'bg-white/5 border border-white/10'
                  }`}
                  onClick={() => toggleUserExpand(entry.id)}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-full">
                    {entry.rank === 1 ? <Trophy className="w-5 h-5 text-yellow-500" /> :
                     entry.rank === 2 ? <Medal className="w-5 h-5 text-gray-300" /> :
                     entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" /> :
                     <span>{entry.rank}</span>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        entry.character_type === 'goku' ? 'text-goku-primary' :
                        entry.character_type === 'saitama' ? 'text-saitama-primary' :
                        entry.character_type === 'jin-woo' ? 'text-jin-woo-primary' :
                        'text-white'
                      }`}>
                        {entry.warrior_name}
                      </span>
                      {entry.warrior_name === userName && (
                        <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {entry.character_type === 'goku' ? 'Saiyan Warrior' :
                       entry.character_type === 'saitama' ? 'Caped Baldy' :
                       entry.character_type === 'jin-woo' ? 'Shadow Monarch' :
                       'Warrior'}
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">{entry.points || 0}</div>
                      <div className="text-xs text-white/60">points</div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
                      entry.character_type === 'goku' ? 'bg-goku-primary/20 text-goku-primary' :
                      entry.character_type === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary' :
                      entry.character_type === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary' :
                      'bg-primary/20 text-primary'
                    }`}>
                      <span>{entry.streak || 0}</span>
                    </div>
                    <Link to={`/profile/${entry.id}`} className="text-white/60 hover:text-white">
                      <ExternalLink size={16} />
                    </Link>
                    {expandedUser === entry.id ? (
                      <ChevronUp size={16} className="text-white/60" />
                    ) : (
                      <ChevronDown size={16} className="text-white/60" />
                    )}
                  </div>
                </div>
                
                {expandedUser === entry.id && (
                  <div className="bg-white/5 p-3 -mt-1 rounded-b-lg border-t-0 border border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Rank:</span>
                      <span className="font-medium">{entry.rank}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Character:</span>
                      <span className="font-medium">
                        {entry.character_type === 'goku' ? 'Saiyan Warrior' :
                         entry.character_type === 'saitama' ? 'Caped Baldy' :
                         entry.character_type === 'jin-woo' ? 'Shadow Monarch' :
                         'Warrior'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Level:</span>
                      <span className="font-medium">{Math.floor((entry.points || 0) / 100) + 1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Country:</span>
                      <span className="font-medium">{entry.country || 'Global'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Streak:</span>
                      <span className="font-medium">{entry.streak || 0} days</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                      <Link 
                        to={`/profile/${entry.id}`}
                        className={`text-xs px-2 py-1 rounded ${
                          entry.character_type === 'goku' ? 'bg-goku-primary/20 text-goku-primary' :
                          entry.character_type === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary' :
                          entry.character_type === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary' :
                          'bg-primary/20 text-primary'
                        }`}
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AnimatedCard>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
