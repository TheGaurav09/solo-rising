
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XIcon, Copy, Share2, Download, Smartphone, LinkIcon, CheckIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const ShareModal = ({ isOpen, onClose, userId }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;
  const shareUrl = userId ? `${appUrl}/profile/${userId}` : appUrl;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually",
        variant: "destructive",
      });
    }
  };
  
  const handleShareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Solo Prove - Anime-inspired fitness app',
          text: 'Check out my profile on Solo Prove, the anime-inspired fitness app!',
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
          description: "Thanks for sharing Solo Prove!",
        });
      } else {
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support direct sharing. Please use the copy link option instead.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  
  const handleAddToHomeScreen = () => {
    toast({
      title: "Add to Home Screen",
      description: "Open your browser menu and select 'Add to Home Screen' or 'Install App' to add Solo Prove to your device.",
      duration: 5000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Solo Prove
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 rounded-md overflow-hidden">
              <div className="flex items-center border border-white/10 bg-white/5 rounded-md p-2">
                <LinkIcon className="h-4 w-4 text-white/60 mr-2 flex-shrink-0" />
                <span className="text-sm text-white/70 truncate flex-1">{shareUrl}</span>
              </div>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={handleCopyLink}
              className="gap-1.5"
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button 
              variant="outline" 
              onClick={handleShareNative}
              className="flex items-center gap-2 py-6"
            >
              <Share2 className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span>Share</span>
                <span className="text-xs text-white/60">With others</span>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleAddToHomeScreen}
              className="flex items-center gap-2 py-6"
            >
              <Smartphone className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span>Install</span>
                <span className="text-xs text-white/60">On your device</span>
              </div>
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex items-center border-t border-white/10 pt-4">
          <p className="text-xs text-white/60 flex-1">
            Share Solo Prove with your friends and training partners!
          </p>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
