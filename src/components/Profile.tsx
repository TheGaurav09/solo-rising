
import React, { useState } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { User, Medal, TrendingUp, Clock, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ShareModal from './modals/ShareModal';

interface ProfileProps {
  userData?: any;
  isViewingOtherUser?: boolean;
}

const Profile = ({ userData, isViewingOtherUser = false }: ProfileProps) => {
  const { userName, character, points } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use the provided userData if available, otherwise use the context values
  const userDisplayName = userData?.warrior_name || userName;
  const userCharacter = userData?.character_type || character;
  const userPoints = userData?.points || points;

  const getCharacterTitle = () => {
    switch(userCharacter) {
      case 'goku': return 'Saiyan Warrior';
      case 'saitama': return 'Caped Baldy';
      case 'jin-woo': return 'Shadow Monarch';
      default: return 'Warrior';
    }
  };

  const getLevel = () => {
    return Math.floor(userPoints / 100) + 1;
  };

  const getNextLevelPoints = () => {
    const level = getLevel();
    return level * 100;
  };

  const getProgressPercentage = () => {
    const nextLevelPoints = getNextLevelPoints();
    const previousLevelPoints = (getLevel() - 1) * 100;
    const currentLevelPoints = userPoints - previousLevelPoints;
    return (currentLevelPoints / (nextLevelPoints - previousLevelPoints)) * 100;
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (userPoints >= 50) {
      achievements.push({ name: 'First Steps', description: 'Complete your first workout', icon: <Medal size={18} />, completed: true });
    }
    
    if (userPoints >= 200) {
      achievements.push({ name: 'Dedicated', description: 'Reach 200 points', icon: <TrendingUp size={18} />, completed: true });
    }
    
    if (userPoints >= 500) {
      achievements.push({ name: 'Warrior', description: 'Reach 500 points', icon: <Medal size={18} />, completed: true });
    }
    
    // Add more achievements here with completed status based on points
    achievements.push({ name: 'Consistent', description: 'Complete 10 workouts', icon: <TrendingUp size={18} />, completed: userPoints >= 100 });
    achievements.push({ name: 'Power Level', description: 'Reach level 5', icon: <Medal size={18} />, completed: getLevel() >= 5 });
    achievements.push({ name: 'Elite', description: 'Reach 1000 points', icon: <Medal size={18} />, completed: userPoints >= 1000 });
    achievements.push({ name: 'Master', description: 'Complete 50 workouts', icon: <TrendingUp size={18} />, completed: userPoints >= 500 });
    
    return achievements;
  };

  const shareProfile = () => {
    setShowShareModal(true);
  };

  const copyProfileLink = () => {
    // TODO: Replace with actual profile link
    const profileLink = `${window.location.origin}/profile/${userData?.id || 'me'}`;
    navigator.clipboard.writeText(profileLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    });
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-6 relative overflow-hidden">
        {/* Character-themed accent corner */}
        <div 
          className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full ${
            userCharacter ? `bg-${userCharacter}-primary/30` : 'bg-primary/30'
          }`}
        ></div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            userCharacter ? `bg-${userCharacter}-primary/20 border-2 border-${userCharacter}-primary/50` : 'bg-primary/20 border-2 border-primary/50'
          }`}>
            <User className={userCharacter ? `text-${userCharacter}-primary` : 'text-primary'} size={36} />
          </div>
          
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${userCharacter ? `text-${userCharacter}-primary` : 'text-white'}`}>
              {userDisplayName}
            </h2>
            <p className="text-white/70">{getCharacterTitle()}</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {getLevel()}</span>
                <span>{userPoints} / {getNextLevelPoints()} points</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${userCharacter ? `bg-${userCharacter}-primary` : 'bg-primary'}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{userPoints}</div>
            <div className="text-sm text-white/70">total points</div>
          </div>
        </div>
        
        {!isViewingOtherUser && (
          <div className="mt-6 flex gap-2 justify-end">
            <AnimatedButton 
              variant="outline" 
              character={userCharacter || undefined}
              size="sm" 
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white"
              onClick={shareProfile}
            >
              <Share2 size={16} />
              <span>Share Profile</span>
            </AnimatedButton>
            
            <AnimatedButton 
              variant="outline" 
              character={userCharacter || undefined}
              size="sm" 
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white"
              onClick={copyProfileLink}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </AnimatedButton>
          </div>
        )}
      </AnimatedCard>
      
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Achievements</h3>
        
        <div className="space-y-3">
          {getAchievements().map((achievement, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                achievement.completed 
                  ? userCharacter 
                    ? `bg-${userCharacter}-primary/20 border border-${userCharacter}-primary/50` 
                    : 'bg-primary/20 border border-primary/50'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                achievement.completed
                  ? userCharacter 
                    ? `bg-${userCharacter}-primary/40` 
                    : 'bg-primary/40'
                  : 'bg-white/10'
              }`}>
                {achievement.icon}
              </div>
              <div>
                <div className="font-medium">{achievement.name}</div>
                <div className="text-sm text-white/70">{achievement.description}</div>
              </div>
              {achievement.completed && (
                <div className="ml-auto">
                  <div className="text-xs px-2 py-1 rounded-full bg-white/10">Completed</div>
                </div>
              )}
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
      
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)}
          title="Share Your Profile"
          shareUrl={`${window.location.origin}/profile/${userData?.id || 'me'}`}
          shareTitle={`Check out ${userDisplayName}'s fitness profile on Solo Rising!`}
          shareDescription={`${userDisplayName} is a level ${getLevel()} ${getCharacterTitle()} with ${userPoints} points. Join now!`}
        />
      )}
    </div>
  );
};

export default Profile;
