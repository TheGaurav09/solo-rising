
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Coffee, Share2 } from 'lucide-react';
import { useUser, CharacterType } from '@/context/UserContext';

interface DailySupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailySupportPopup: React.FC<DailySupportPopupProps> = ({ isOpen, onClose }) => {
  const { character } = useUser();
  
  const handleSupport = () => {
    window.open('https://www.buymeacoffee.com/solorising', '_blank');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Solo Rising',
        text: 'Check out Solo Rising, a fitness app that makes working out fun!',
        url: window.location.origin,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.origin)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy link: ', err);
        });
    }
  };
  
  const getButtonClass = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary hover:bg-goku-primary/90';
      case 'saitama': return 'bg-saitama-primary hover:bg-saitama-primary/90';
      case 'jin-woo': return 'bg-jin-woo-primary hover:bg-jin-woo-primary/90';
      default: return 'bg-white/10 hover:bg-white/20';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Support Solo Rising</DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4">
            Thanks for using Solo Rising! We're passionate about helping you achieve your fitness goals.
          </p>
          <p className="mb-4">
            This app is completely free to use, but your support helps us maintain and improve it.
            Consider buying us a coffee if you're enjoying the app!
          </p>
          
          <div className="flex justify-center my-6">
            <div className="bg-black/30 p-4 rounded-lg inline-flex items-center justify-center">
              <Coffee className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto border-white/20" onClick={onClose}>
            Maybe Later
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share App
          </Button>
          <Button className={`w-full sm:w-auto ${getButtonClass()}`} onClick={handleSupport}>
            <Coffee className="mr-2 h-4 w-4" />
            Buy Me a Coffee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailySupportPopup;
