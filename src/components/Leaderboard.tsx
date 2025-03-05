
import React, { useState, useEffect } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import { useUser } from '@/context/UserContext';
import { Trophy, Medal, BadgeCheck } from 'lucide-react';

// Fake leaderboard data generator
const generateLeaderboardData = (userName: string, userPoints: number) => {
  const fakeUsers = [
    { name: 'ShadowFist', character: 'jin-woo', points: 1250 },
    { name: 'SuperSaiyan', character: 'goku', points: 1100 },
    { name: 'OnePunchKing', character: 'saitama', points: 980 },
    { name: 'KamehameDude', character: 'goku', points: 920 },
    { name: 'HeroHunter', character: 'saitama', points: 850 },
    { name: 'MonarchRising', character: 'jin-woo', points: 800 },
    { name: 'KiBlaster', character: 'goku', points: 750 },
    { name: 'CapeBaldy', character: 'saitama', points: 710 },
    { name: 'LevelUpKing', character: 'jin-woo', points: 690 },
    { name: 'KnucklePower', character: 'saitama', points: 620 },
    { name: 'DragonFighter', character: 'goku', points: 600 },
    { name: 'SoulReaper', character: 'jin-woo', points: 580 },
  ];
  
  // Add the current user's data
  const userData = { name: userName, character: 'user', points: userPoints };
  
  // Combine and sort by points (descending)
  return [...fakeUsers, userData]
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({ ...user, rank: index + 1 }));
};

const Leaderboard = () => {
  const { userName, character, points } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  useEffect(() => {
    // Generate fake leaderboard data
    const data = generateLeaderboardData(userName, points);
    setLeaderboardData(data);
    
    // Find user's rank
    const userEntry = data.find(entry => entry.name === userName);
    if (userEntry) {
      setUserRank(userEntry.rank);
    }
  }, [userName, points]);

  const getCharacterColor = (char: string) => {
    switch(char) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: 
        if (character === 'goku') return 'text-goku-primary';
        if (character === 'saitama') return 'text-saitama-primary';
        if (character === 'jin-woo') return 'text-jin-woo-primary';
        return 'text-white';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center">{rank}</span>;
  };

  const isCurrentUser = (name: string) => name === userName;

  return (
    <AnimatedCard className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Global Leaderboard</h2>
        {userRank && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <BadgeCheck size={16} className={getCharacterColor('user')} />
            <span className="text-sm">Your Rank: <strong>{userRank}</strong></span>
          </div>
        )}
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-none pr-1">
        {leaderboardData.map((entry, index) => (
          <div 
            key={index}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isCurrentUser(entry.name) 
                ? `bg-${character}-primary/20 border border-${character}-primary/40` 
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-full">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isCurrentUser(entry.name) ? getCharacterColor('user') : getCharacterColor(entry.character)}`}>
                  {entry.name}
                </span>
                {isCurrentUser(entry.name) && (
                  <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full">You</span>
                )}
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                {entry.character === 'goku' && 'Saiyan Warrior'}
                {entry.character === 'saitama' && 'Caped Baldy'}
                {entry.character === 'jin-woo' && 'Shadow Monarch'}
                {entry.character === 'user' && character === 'goku' && 'Saiyan Warrior'}
                {entry.character === 'user' && character === 'saitama' && 'Caped Baldy'}
                {entry.character === 'user' && character === 'jin-woo' && 'Shadow Monarch'}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-white">{entry.points}</div>
              <div className="text-xs text-white/60">points</div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
};

export default Leaderboard;
