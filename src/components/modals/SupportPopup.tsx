
import React from 'react';
import { X, Coffee, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { CharacterType } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  character?: CharacterType;
}

const SupportPopup = ({ isOpen, onClose, character }: SupportPopupProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Solo Rising',
          text: 'Check out Solo Rising - the anime-inspired workout app that helps you stay motivated!',
          url: window.location.origin,
        });
        toast({
          title: "Shared Successfully",
          description: "Thank you for sharing Solo Rising!",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard!",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/10 text-white p-6 max-w-md mx-auto rounded-lg">
        <div className="absolute right-4 top-4">
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <DialogTitle className="text-xl font-bold mb-4 text-center">Support Solo Rising</DialogTitle>
        
        <div className="text-center space-y-4">
          <Coffee size={40} className="mx-auto text-[#FFDD00]" />
          
          <p className="text-white/80">
            Solo Rising is completely free to use. If you're enjoying the app and want to support its development, consider buying me a coffee!
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <a 
              href="https://www.buymeacoffee.com/SoloRising" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFDD00] text-black font-medium px-6 py-3 rounded-md hover:bg-[#E5C700] transition-colors"
            >
              <Coffee size={18} />
              <span>Buy me a coffee</span>
            </a>
            
            <AnimatedButton
              onClick={handleShare}
              variant="outline"
              character={character}
              className="flex items-center gap-2"
            >
              <Share2 size={18} />
              <span>Share App</span>
            </AnimatedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportPopup;
