
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Trophy, Medal, User, ArrowUp, ArrowDown, Minus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { countries } from './Countries';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';

interface LeaderboardUser {
  id: string;
  warrior_name: string;
  character_type: string;
  points: number;
  country: string;
  streak?: number;
  rank?: number;
  rankChange?: number;
}

const Leaderboard = () => {
  const { character, userName, country } = useUser();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState(country || 'Global');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [regionFilter, timeFilter]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('id, warrior_name, character_type, points, country, streak')
        .order('points', { ascending: false });
      
      if (regionFilter !== 'Global') {
        query = query.eq('country', regionFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Add rank to each user
      const rankedUsers = data.map((user, index) => ({
        ...user,
        rank: index + 1,
        // Simulate rank change (in a real app, you'd store historical data)
        rankChange: Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      }));
      
      setUsers(rankedUsers);
      
      // Find current user's rank
      const currentUserRank = rankedUsers.findIndex(user => user.warrior_name === userName) + 1;
      setUserRank(currentUserRank > 0 ? currentUserRank : null);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setRegionFilter(region);
  };

  const handleTimeChange = (time: string) => {
    setTimeFilter(time);
  };

  const openUserProfile = (user: LeaderboardUser) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp size={16} className="text-green-500" />;
    if (change < 0) return <ArrowDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-white/40" />;
  };

  const getCharacterClass = (characterType: string) => {
    switch (characterType) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-white/40';
    }
  };

  const getCharacterTitle = (characterType: string) => {
    switch(characterType) {
      case 'goku': return 'Saiyan Warrior';
      case 'saitama': return 'Caped Baldy';
      case 'jin-woo': return 'Shadow Monarch';
      default: return 'Warrior';
    }
  };

  const renderUserProfile = () => {
    if (!selectedUser) return null;
    
    return (
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="bg-gray-900 border-l border-white/10 text-white overflow-y-auto p-0">
          <SheetHeader className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-xl text-white">Warrior Profile</SheetTitle>
              <SheetClose className="rounded-full p-1 hover:bg-white/10">
                <X className="h-5 w-5" />
              </SheetClose>
            </div>
          </SheetHeader>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getCharacterClass(selectedUser.character_type)}`}>
                <User size={28} />
              </div>
              
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${selectedUser.character_type ? `text-${selectedUser.character_type}-primary` : 'text-white'}`}>
                  {selectedUser.warrior_name}
                </h2>
                <p className="text-white/70">{getCharacterTitle(selectedUser.character_type)}</p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold">{selectedUser.points}</div>
                <div className="text-sm text-white/70">total points</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {Math.floor((selectedUser.points || 0) / 100) + 1}</span>
                <span>{selectedUser.points} points</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedUser.character_type ? `bg-${selectedUser.character_type}-primary` : 'bg-primary'}`}
                  style={{ width: `${((selectedUser.points % 100) / 100) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Rank</span>
                <span className="font-medium">{selectedUser.rank}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Character</span>
                <span className="font-medium">{getCharacterTitle(selectedUser.character_type)}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Level</span>
                <span className="font-medium">{Math.floor((selectedUser.points || 0) / 100) + 1}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Country</span>
                <span className="font-medium">{selectedUser.country || 'Global'}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Streak</span>
                <span className="font-medium">{selectedUser.streak || 0} days</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <AnimatedCard className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={regionFilter} 
            onChange={(e) => handleRegionChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
          >
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          
          <select 
            value={timeFilter} 
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
          >
            <option value="all-time">All Time</option>
            <option value="this-month">This Month</option>
            <option value="this-week">This Week</option>
          </select>
        </div>
      </div>
      
      {userRank && (
        <CollapsibleSection title="Your Ranking" defaultOpen={true} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="font-bold">{userRank}</span>
              </div>
              
              <div className={`w-10 h-10 rounded-full ${getCharacterClass(character || '')} flex items-center justify-center`}>
                <User size={20} />
              </div>
              
              <div>
                <div className="font-medium">{userName}</div>
                <div className="text-sm text-white/60">{country}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold">{users.find(u => u.warrior_name === userName)?.points || 0} pts</div>
            </div>
          </div>
        </CollapsibleSection>
      )}
      
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/10 text-white/60 text-sm">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-7 md:col-span-5">Warrior</div>
          <div className="hidden md:block md:col-span-2">Region</div>
          <div className="col-span-3 md:col-span-3 text-right">Points</div>
          <div className="col-span-1 text-center">Trend</div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            <p className="mt-2 text-white/60">Loading leaderboard...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            No warriors found for this region
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 gap-2 p-4 ${user.warrior_name === userName ? 'bg-white/10' : 'hover:bg-white/5'} cursor-pointer`}
                onClick={() => openUserProfile(user)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {user.rank <= 3 ? (
                    <Medal size={20} className={getMedalColor(user.rank)} />
                  ) : (
                    <span className="text-white/60">{user.rank}</span>
                  )}
                </div>
                
                <div className="col-span-7 md:col-span-5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getCharacterClass(user.character_type)} flex items-center justify-center`}>
                    <User size={16} />
                  </div>
                  <span className={user.warrior_name === userName ? 'font-bold' : ''}>{user.warrior_name}</span>
                </div>
                
                <div className="hidden md:flex md:col-span-2 items-center text-white/60">
                  {user.country}
                </div>
                
                <div className="col-span-3 md:col-span-3 flex items-center justify-end font-medium">
                  {user.points.toLocaleString()} pts
                </div>
                
                <div className="col-span-1 flex items-center justify-center">
                  {getRankChangeIcon(user.rankChange || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {renderUserProfile()}
    </AnimatedCard>
  );
};

export default Leaderboard;
