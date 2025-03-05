
import React from 'react';
import { X, Award, Info, TrendingUp } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import { useUser } from '@/context/UserContext';
import { getIconComponent } from '@/lib/iconUtils';

interface AchievementDetailModalProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    points_required: number;
    icon: string;
  };
  unlocked: boolean;
  progress: number;
  onClose: () => void;
}

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done."
];

const AchievementDetailModal = ({ achievement, unlocked, progress, onClose }: AchievementDetailModalProps) => {
  const { character, points } = useUser();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-lg relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              unlocked 
                ? `bg-${character}-primary/30 text-${character}-primary` 
                : 'bg-white/10 text-white/60'
            }`}>
              {getIconComponent(achievement.icon, 32)}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{achievement.name}</h2>
              {unlocked ? (
                <div className="inline-block px-2 py-1 mt-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                  Unlocked
                </div>
              ) : (
                <div className="text-sm text-white/60 mt-1">
                  {points} / {achievement.points_required} points to unlock
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Info size={16} className="text-white/60" />
              Details
            </h3>
            <p className="text-white/70">{achievement.description}</p>
          </div>
          
          {!unlocked && (
            <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-white/60" />
                Progress
              </h3>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{points} / {achievement.points_required} points</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${character ? `bg-${character}-primary` : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              {progress < 50 && (
                <p className="text-xs text-white/60 mt-2">Keep training to unlock this achievement!</p>
              )}
              {progress >= 50 && progress < 90 && (
                <p className="text-xs text-white/60 mt-2">You're making great progress!</p>
              )}
              {progress >= 90 && progress < 100 && (
                <p className="text-xs text-white/60 mt-2">Almost there! Just a little more effort!</p>
              )}
            </div>
          )}
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="font-medium mb-2">Motivational Quote</h3>
            <blockquote className="italic text-white/70 pl-3 border-l-2 border-white/20">
              "{randomQuote}"
            </blockquote>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AchievementDetailModal;
