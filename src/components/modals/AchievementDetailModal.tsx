
import React from 'react';
import { X, Trophy, Calendar } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { getIconComponent } from '@/lib/iconUtils';

type CharacterType = 'goku' | 'saitama' | 'jin-woo' | null;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

interface AchievementDetailModalProps {
  achievement: Achievement;
  onClose: () => void;
  character?: CharacterType;
  currentPoints?: number;
}

// List of motivational quotes
const motivationalQuotes = [
  "The difference between the impossible and the possible lies in determination.",
  "Success isn't always about greatness. It's about consistency.",
  "The only way to achieve the impossible is to believe it is possible.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "The best way to predict the future is to create it.",
  "Believe you can and you're halfway there.",
  "Your body can stand almost anything. It's your mind that you have to convince."
];

const AchievementDetailModal = ({ achievement, onClose, character, currentPoints = 0 }: AchievementDetailModalProps) => {
  const userContext = useUser();
  const characterToUse = character || userContext.character;
  
  // Get a random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  // Check if the achievement is unlocked
  const isUnlocked = achievement.unlocked || (currentPoints >= achievement.points_required);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-md">
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full ${
              isUnlocked 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-white/10 text-white/40'
            } flex items-center justify-center`}>
              {getIconComponent(achievement.icon, 40)}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">{achievement.name}</h2>
          
          <div className="flex items-center justify-center mb-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              isUnlocked 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-white/10 text-white/60 border border-white/20'
            }`}>
              {isUnlocked ? 'Unlocked' : 'Locked'} 
              {achievement.unlocked_at && <span> • {new Date(achievement.unlocked_at).toLocaleDateString()}</span>}
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
            <p className="text-white/80 text-center">
              {achievement.description}
            </p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">Required Points</span>
              <span className="font-medium">{achievement.points_required}</span>
            </div>
            
            {achievement.unlocked_at && (
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm flex items-center">
                  <Calendar size={14} className="mr-1" /> Unlocked on
                </span>
                <span className="text-green-400">
                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <h3 className="font-medium mb-2 text-center">Motivational Quote</h3>
            <blockquote className="italic text-white/70 pl-3 border-l-2 border-white/20">
              "{randomQuote}"
            </blockquote>
          </div>
          
          <AnimatedButton
            onClick={onClose}
            character={characterToUse || undefined}
            className="w-full"
          >
            Close
          </AnimatedButton>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AchievementDetailModal;
