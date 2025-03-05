
import React from 'react';
import AnimatedCard from './ui/AnimatedCard';
import { useUser } from '@/context/UserContext';
import { User, Medal, TrendingUp, Clock, Share2 } from 'lucide-react';
import AnimatedButton from './ui/AnimatedButton';

const Profile = () => {
  const { userName, character, points } = useUser();

  const getCharacterTitle = () => {
    switch(character) {
      case 'goku': return 'Saiyan Warrior';
      case 'saitama': return 'Caped Baldy';
      case 'jin-woo': return 'Shadow Monarch';
      default: return 'Warrior';
    }
  };

  const getLevel = () => {
    return Math.floor(points / 100) + 1;
  };

  const getNextLevelPoints = () => {
    const level = getLevel();
    return level * 100;
  };

  const getProgressPercentage = () => {
    const nextLevelPoints = getNextLevelPoints();
    const previousLevelPoints = (getLevel() - 1) * 100;
    const currentLevelPoints = points - previousLevelPoints;
    return (currentLevelPoints / (nextLevelPoints - previousLevelPoints)) * 100;
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (points >= 50) {
      achievements.push({ name: 'First Steps', description: 'Complete your first workout', icon: <Medal size={18} /> });
    }
    
    if (points >= 200) {
      achievements.push({ name: 'Dedicated', description: 'Reach 200 points', icon: <TrendingUp size={18} /> });
    }
    
    if (points >= 500) {
      achievements.push({ name: 'Warrior', description: 'Reach 500 points', icon: <Medal size={18} /> });
    }
    
    return achievements;
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/30` : 'bg-primary/30'}`}>
            <User className={character ? `text-${character}-primary` : 'text-primary'} size={28} />
          </div>
          
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${character ? `text-${character}-primary` : 'text-white'}`}>
              {userName}
            </h2>
            <p className="text-white/70">{getCharacterTitle()}</p>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">{points}</div>
            <div className="text-sm text-white/70">total points</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {getLevel()}</span>
            <span>{points} / {getNextLevelPoints()} points</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${character ? `bg-${character}-primary` : 'bg-primary'}`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          <AnimatedButton 
            variant="outline" 
            character={character || undefined}
            size="sm" 
            className="flex items-center gap-2"
          >
            <Share2 size={16} />
            <span>Share Profile</span>
          </AnimatedButton>
        </div>
      </AnimatedCard>
      
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Achievements</h3>
        
        <div className="space-y-3">
          {getAchievements().map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/20` : 'bg-primary/20'}`}>
                {achievement.icon}
              </div>
              <div>
                <div className="font-medium">{achievement.name}</div>
                <div className="text-sm text-white/70">{achievement.description}</div>
              </div>
            </div>
          ))}
          
          {getAchievements().length === 0 && (
            <div className="text-center py-6 text-white/50">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Complete workouts to earn achievements</p>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Profile;
