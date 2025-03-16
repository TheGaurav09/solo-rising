
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle } from 'lucide-react';

export interface WorkoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  character: string | null;
}

const getMotivationalQuote = (character: string | null) => {
  const quotes = {
    goku: "Remember, training is not just about getting stronger, but becoming a better version of yourself.",
    saitama: "True power comes from consistent effort, not shortcuts.",
    'jin-woo': "The path to becoming the strongest requires honesty with yourself first.",
    default: "Progress is built on consistency and honesty, not shortcuts."
  };
  
  return quotes[character as keyof typeof quotes] || quotes.default;
};

const getCharacterAccentColor = (character: string | null) => {
  switch (character) {
    case 'goku': return 'bg-goku-primary text-white border-goku-primary';
    case 'saitama': return 'bg-saitama-primary text-black border-saitama-primary';
    case 'jin-woo': return 'bg-jin-woo-primary text-white border-jin-woo-primary';
    default: return 'bg-purple-600 text-white border-purple-600';
  }
};

const WorkoutConfirmDialog = ({ isOpen, onClose, onConfirm, character }: WorkoutConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-black/80 backdrop-blur-lg border border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl">Workout Confirmation</AlertDialogTitle>
          <AlertDialogDescription className="text-white/80">
            Did you really complete this workout? You won't gain anything by logging workouts you haven't done.
            <p className="mt-2 text-sm italic text-white/60">"{getMotivationalQuote(character)}"</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel 
            onClick={onClose} 
            className="bg-gray-800 text-white hover:bg-gray-700 border-none flex items-center"
          >
            <XCircle className="mr-2" size={16} />
            No, I didn't
          </AlertDialogCancel>
          
          <AlertDialogAction 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`${getCharacterAccentColor(character)} hover:opacity-90 border-none flex items-center`}
          >
            <CheckCircle className="mr-2" size={16} />
            Yes, I completed it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WorkoutConfirmDialog;
