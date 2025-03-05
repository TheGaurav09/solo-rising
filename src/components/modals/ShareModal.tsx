
import React from 'react';
import { X, Twitter, Facebook, Linkedin, Link, Mail, Copy } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { toast } from '@/components/ui/use-toast';

interface ShareModalProps {
  onClose: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo';
}

const ShareModal = ({ onClose, character }: ShareModalProps) => {
  const appUrl = window.location.origin;
  const shareText = "Join me in Workout Wars! Train like your favorite anime characters and compete on the global leaderboard.";
  
  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: <Twitter className="w-5 h-5" />, 
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`, '_blank')
    },
    { 
      name: 'Facebook', 
      icon: <Facebook className="w-5 h-5" />, 
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`, '_blank')
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-5 h-5" />, 
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`, '_blank')
    },
    { 
      name: 'Email', 
      icon: <Mail className="w-5 h-5" />, 
      action: () => window.open(`mailto:?subject=Join Workout Wars&body=${encodeURIComponent(shareText + '\n\n' + appUrl)}`, '_blank')
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Share with your friends to join the competition!",
        duration: 3000,
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-md">
        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-bold text-center mb-2">Share Workout Wars</h2>
          
          <p className="text-center text-white/70 mb-6">
            Invite friends to join you in your fitness journey
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`p-3 rounded-full ${
                  character ? `bg-${character}-primary/20 hover:bg-${character}-primary/30` : 'bg-white/10 hover:bg-white/20'
                } transition-colors`}
                aria-label={`Share on ${option.name}`}
              >
                {option.icon}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 mb-4">
            <input
              type="text"
              value={appUrl}
              readOnly
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            />
            <button
              onClick={copyToClipboard}
              className={`p-2 rounded-full ${
                character ? `bg-${character}-primary/20 hover:bg-${character}-primary/30` : 'bg-white/10 hover:bg-white/20'
              } transition-colors`}
              aria-label="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>
          
          <AnimatedButton
            onClick={onClose}
            character={character}
            className="w-full"
          >
            Close
          </AnimatedButton>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ShareModal;
