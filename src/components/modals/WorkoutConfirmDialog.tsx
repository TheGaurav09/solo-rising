
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CharacterType } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';

export interface WorkoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  character: CharacterType | null;
  loading?: boolean;
}

const WorkoutConfirmDialog: React.FC<WorkoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  character,
  loading = false
}) => {
  const characterMessages = {
    'goku': "Training complete! Remember, a true Saiyan never stops pushing their limits.",
    'saitama': "Just another workout in your journey to become the strongest hero!",
    'jin-woo': "You've logged your training. Arise and become stronger!"
  };

  const message = character ? characterMessages[character] : "Great job completing your workout!";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/10 text-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Confirm Workout</DialogTitle>
          <DialogDescription className="text-white/70">
            Are you sure you want to log this workout?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>{message}</p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border border-white/10 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className={`${
              character === 'goku' ? 'bg-goku-primary hover:bg-goku-primary/80' :
              character === 'saitama' ? 'bg-saitama-primary hover:bg-saitama-primary/80' :
              character === 'jin-woo' ? 'bg-jin-woo-primary hover:bg-jin-woo-primary/80' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Logging...</span>
              </div>
            ) : (
              'Log Workout'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutConfirmDialog;
