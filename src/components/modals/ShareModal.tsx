
import React from 'react';
import { X, Share2, MessageCircle, Twitter, Facebook, Linkedin, Link as LinkIcon, Copy } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { toast } from '@/components/ui/use-toast';

interface ShareModalProps {
  onClose: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo';
}

const ShareModal = ({ onClose, character }: ShareModalProps) => {
  const appUrl = window.location.origin;
  const shareText = "Join me on Workout Wars and transform your fitness journey with anime-inspired workouts! 💪";
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${appUrl}\n\n${shareText}`);
    toast({
      title: "Link Copied!",
      description: "Share link has been copied to clipboard",
      duration: 3000,
    });
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleShareLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Workout Wars',
        text: shareText,
        url: appUrl,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support native sharing",
        variant: "destructive",
      });
    }
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
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Share2 size={32} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-4">Share Workout Wars</h2>
          
          <p className="text-center text-white/70 mb-6">
            Share this app with your friends and build a community of anime-inspired fitness warriors!
          </p>

          <div className="bg-white/5 p-4 rounded-md mb-6">
            <p className="text-sm text-white/90">{shareText}</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Twitter size={24} className="text-[#1DA1F2]" />
              <span className="text-xs">Twitter</span>
            </button>
            
            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Facebook size={24} className="text-[#4267B2]" />
              <span className="text-xs">Facebook</span>
            </button>
            
            <button
              onClick={handleShareLinkedin}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Linkedin size={24} className="text-[#0077B5]" />
              <span className="text-xs">LinkedIn</span>
            </button>
            
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Copy size={24} className="text-white/80" />
              <span className="text-xs">Copy</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            <AnimatedButton
              onClick={handleNativeShare}
              character={character}
              className="w-full justify-center"
            >
              <Share2 size={16} className="mr-2" />
              Share via Device
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handleCopyLink}
              variant="outline"
              className="w-full justify-center"
            >
              <LinkIcon size={16} className="mr-2" />
              Copy Link
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ShareModal;
