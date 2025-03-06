
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
import { useUser } from '@/context/UserContext';

interface WorkoutConfirmDialogProps {
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

const WorkoutConfirmDialog = ({ isOpen, onClose, onConfirm, character }: WorkoutConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 border border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle>Workout Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Did you really complete this workout? You won't gain anything by logging workouts you haven't done.
            <p className="mt-2 text-sm italic text-white/60">"{getMotivationalQuote(character)}"</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="bg-gray-800 text-white hover:bg-gray-700">No</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onConfirm();
            onClose();
          }} className="bg-green-600 hover:bg-green-700">Yes, I completed it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WorkoutConfirmDialog;
