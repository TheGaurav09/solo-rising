
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUser } from '@/context/UserContext';

interface WorkoutConfirmModalProps {
  exerciseName: string;
  reps: number;
  duration: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const motivationalQuotes = [
  "The only place where success comes before work is in the dictionary.",
  "The difference between try and triumph is just a little umph!",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "If something stands between you and your success, move it. Never be denied."
];

const WorkoutConfirmModal = ({ exerciseName, reps, duration, onConfirm, onCancel }: WorkoutConfirmModalProps) => {
  const { character } = useUser();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <AlertTriangle size={32} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">Workout Confirmation</h2>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
            <p className="text-white/90 text-center font-medium mb-2">
              Did you really complete:
            </p>
            <p className="text-center text-lg font-bold">
              {exerciseName} for {duration} minutes with {reps} reps?
            </p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm text-center">
              <strong>Warning:</strong> Submitting false workout sessions may result in your account being banned.
            </p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <h3 className="font-medium mb-2 text-center">Motivational Quote</h3>
            <blockquote className="italic text-white/70 pl-3 border-l-2 border-white/20">
              "{randomQuote}"
            </blockquote>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AnimatedButton
              onClick={onCancel}
              character={character || undefined}
              variant="outline"
            >
              Cancel
            </AnimatedButton>
            
            <AnimatedButton
              onClick={onConfirm}
              className="bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              <span>Confirm</span>
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default WorkoutConfirmModal;
