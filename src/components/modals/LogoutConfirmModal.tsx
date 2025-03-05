
import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUser } from '@/context/UserContext';

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmModal = ({ onConfirm, onCancel }: LogoutConfirmModalProps) => {
  const { character } = useUser();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
              <AlertTriangle size={32} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">Log Out Confirmation</h2>
          <p className="text-white/70 text-center mb-6">
            Are you sure you want to log out? Your progress is saved, but you'll need to log in again to continue your training.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <AnimatedButton
              onClick={onCancel}
              character={character || undefined}
              variant="outline"
            >
              No, Stay
            </AnimatedButton>
            
            <AnimatedButton
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Yes, Log Out</span>
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default LogoutConfirmModal;
