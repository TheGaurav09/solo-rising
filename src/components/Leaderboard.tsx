
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { Link } from 'react-router-dom';
import { Trophy, Users, Globe, MapPin, User, Flame, ExternalLink, ChevronDown, ChevronUp, Info, X, Award, Calendar, Star, Zap } from 'lucide-react';
import InfoTooltip from './ui/InfoTooltip';
import AnimatedCard from './ui/AnimatedCard';
import LeaderboardFooter from './ui/LeaderboardFooter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface ProfileUser {
  id: string;
  warrior_name: string;
  character_type: string;
  points: number;
  streak: number;
  country: string;
  level?: number;
  xp?: number;
  coins?: number;
  last_workout_date?: string;
}

const Leaderboard = () => {
  const { userId, character } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<ProfileUser[]>([]);
  const [filter, setFilter] = useState<'global' | 'character'>('global');
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [filter, period, character]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('id, warrior_name, character_type, points, streak, country, level, xp, coins, last_workout_date')
        .order('points', { ascending: false })
        .limit(50);
      
      if (filter === 'character' && character) {
        query = query.eq('character_type', character);
      }
      
      // For now, we're ignoring the period filter as we don't have time-based filtering
      // This would require additional database structure
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }
      
      if (data) {
        setLeaderboardData(data);
        
        // Find user's rank
        if (userId) {
          const userRankIndex = data.findIndex(user => user.id === userId);
          setUserRank(userRankIndex !== -1 ? userRankIndex + 1 : null);
        }
      }
    } catch (error) {
      console.error("Error in fetchLeaderboardData:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterColor = (characterType: string) => {
    switch(characterType) {
      case 'goku': return 'text-orange-500';
      case 'saitama': return 'text-yellow-500';
      case 'jin-woo': return 'text-purple-500';
      default: return 'text-white';
    }
  };

  const toggleUserExpanded = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const openProfileModal = (user: ProfileUser) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  const getCharacterName = (characterType: string) => {
    switch(characterType) {
      case 'goku': return 'Saiyan';
      case 'saitama': return 'Hero';
      case 'jin-woo': return 'Hunter';
      default: return 'Warrior';
    }
  };

  return (
    <div>
      <style>
        {`
          .leaderboard-row:nth-child(1) {
            background: linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 100%);
            border-color: rgba(255,215,0,0.3);
          }
          .leaderboard-row:nth-child(2) {
            background: linear-gradient(90deg, rgba(192,192,192,0.2) 0%, rgba(192,192,192,0.05) 100%);
            border-color: rgba(192,192,192,0.3);
          }
          .leaderboard-row:nth-child(3) {
            background: linear-gradient(90deg, rgba(205,127,50,0.2) 0%, rgba(205,127,50,0.05) 100%);
            border-color: rgba(205,127,50,0.3);
          }
          .streak-badge {
            background: linear-gradient(90deg, #ff4d4d 0%, #f9cb28 100%);
          }
        `}
      </style>

      <div className="flex justify-between mb-6">
        <div className="space-x-2">
          <button
            onClick={() => setFilter('global')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'global' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Globe size={14} className="inline mr-1.5" /> Global
          </button>
          
          <button
            onClick={() => setFilter('character')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'character' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            disabled={!character}
          >
            <User size={14} className="inline mr-1.5" /> My Faction
          </button>
        </div>
        
        <div className="space-x-2">
          <button
            onClick={() => setPeriod('all-time')}
            className={`px-3 py-1.5 rounded-full text-sm ${period === 'all-time' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            All-time
          </button>
          
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-full text-sm ${period === 'monthly' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Monthly
          </button>
          
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-full text-sm ${period === 'weekly' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <div 
            key={user.id}
            className={`relative rounded-lg border border-white/10 leaderboard-row overflow-hidden transition-all duration-200 ${user.id === userId ? 'bg-white/10 border-white/30' : 'bg-black/20 hover:bg-black/30'}`}
          >
            <div 
              className="flex items-center p-3 cursor-pointer"
              onClick={() => toggleUserExpanded(user.id)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/20 mr-3">
                {index < 3 ? (
                  <Trophy size={16} className={index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-amber-700'} />
                ) : (
                  <span className="text-sm text-white/70">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <span className={`font-semibold ${user.id === userId ? 'text-white' : 'text-white/90'}`}>
                    {user.warrior_name}
                  </span>
                  
                  {user.streak >= 3 && (
                    <div className="ml-2 streak-badge px-1.5 rounded-full flex items-center">
                      <Flame size={12} className="text-white mr-0.5" />
                      <span className="text-xs text-white">{user.streak}</span>
                    </div>
                  )}
                  
                  {user.country && user.country !== 'Global' && (
                    <div className="ml-2 text-xs text-white/60 flex items-center">
                      <MapPin size={10} className="mr-0.5" />
                      <span>{user.country}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-white/60">
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    user.character_type === 'goku' ? 'bg-orange-500' : 
                    user.character_type === 'saitama' ? 'bg-yellow-500' : 
                    'bg-purple-500'
                  }`}></div>
                  <span className={getCharacterColor(user.character_type)}>
                    {getCharacterName(user.character_type)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-white">{user.points.toLocaleString()}</div>
                <div className="text-xs text-white/60">points</div>
              </div>
              
              <div className="ml-3">
                {expandedUser === user.id ? (
                  <ChevronUp size={16} className="text-white/60" />
                ) : (
                  <ChevronDown size={16} className="text-white/60" />
                )}
              </div>
            </div>
            
            {expandedUser === user.id && (
              <div className="p-3 border-t border-white/10 bg-black/30">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-white/70">
                      <Trophy size={14} className="mr-1.5 text-white/60" />
                      <span>Rank: #{index + 1}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-white/70">
                      <Flame size={14} className="mr-1.5 text-white/60" />
                      <span>Streak: {user.streak} days</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openProfileModal(user);
                    }} 
                    className="flex items-center text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <span>View Profile</span>
                    <ExternalLink size={12} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {leaderboardData.length === 0 && !loading && (
          <div className="text-center py-12 text-white/60">
            <Users className="mx-auto mb-3 w-10 h-10 opacity-50" />
            <p>No warriors found. Be the first!</p>
          </div>
        )}
      </div>
      
      {userRank !== null && (
        <LeaderboardFooter onShowAll={() => {}} userRank={userRank} />
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <Dialog open={showProfileModal} onOpenChange={closeProfileModal}>
          <DialogContent className="bg-black/90 border border-white/20 rounded-lg max-w-md w-full p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/20">
              <DialogTitle className="flex items-center justify-between">
                <span className="text-xl font-bold">{selectedUser.warrior_name}'s Profile</span>
                <button onClick={closeProfileModal} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
                  <X size={18} className="text-white/80" />
                </button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedUser.character_type === 'goku' ? 'bg-orange-500/20' : 
                    selectedUser.character_type === 'saitama' ? 'bg-yellow-500/20' : 
                    'bg-purple-500/20'
                  }`}>
                    <User size={32} className={
                      selectedUser.character_type === 'goku' ? 'text-orange-500' : 
                      selectedUser.character_type === 'saitama' ? 'text-yellow-500' : 
                      'text-purple-500'
                    } />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold">{selectedUser.warrior_name}</h3>
                  <div className="flex items-center justify-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-1.5 ${
                      selectedUser.character_type === 'goku' ? 'bg-orange-500' : 
                      selectedUser.character_type === 'saitama' ? 'bg-yellow-500' : 
                      'bg-purple-500'
                    }`}></div>
                    <span className={getCharacterColor(selectedUser.character_type)}>
                      {getCharacterName(selectedUser.character_type)}
                    </span>
                  </div>
                  {selectedUser.country && selectedUser.country !== 'Global' && (
                    <div className="text-sm text-white/60 flex items-center justify-center mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span>{selectedUser.country}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="text-xs text-white/60">Points</div>
                    <div className="text-lg font-bold">{selectedUser.points.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="text-xs text-white/60">Streak</div>
                    <div className="flex items-center">
                      <Flame size={16} className="text-red-400 mr-1" />
                      <span className="text-lg font-bold">{selectedUser.streak}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="text-xs text-white/60">Level</div>
                    <div className="text-lg font-bold">{selectedUser.level || 1}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="text-xs text-white/60">Coins</div>
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 mr-1" />
                      <span className="text-lg font-bold">{selectedUser.coins || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex items-center mb-1">
                    <Award size={16} className="text-white/60 mr-1.5" />
                    <span className="text-sm font-medium">Achievements</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Unlocked achievements will appear here
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex items-center mb-1">
                    <Calendar size={16} className="text-white/60 mr-1.5" />
                    <span className="text-sm font-medium">Last Workout</span>
                  </div>
                  <div className="text-sm text-white/60">
                    {selectedUser.last_workout_date 
                      ? new Date(selectedUser.last_workout_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'No recent workouts'
                    }
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Leaderboard;
