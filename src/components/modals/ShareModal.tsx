import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, Copy, Check, Twitter, Facebook, Linkedin, Mail, QrCode, Globe, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface ShareModalProps {
  onClose: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo';
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, character }) => {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = `${window.location.origin}?ref=${character}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Share this link with your friends.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Join%20me%20on%20SoloProve%20and%20let's%20conquer%20our%20fitness%20goals%20together!`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const sendEmail = () => {
    window.location.href = `mailto:?subject=Join me on SoloProve!&body=Hey,%20I'm using SoloProve to track my workouts and level up my fitness. Join me and let's conquer our goals together!%0D%0A%0D%0A${shareUrl}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share SoloProve</DialogTitle>
          <DialogDescription>
            Share your referral link with friends.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input type="text" value={shareUrl} readOnly className="cursor-pointer" onClick={copyToClipboard} />
            <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={isCopied}>
              {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant="secondary" className="justify-center" onClick={shareOnTwitter}>
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button variant="secondary" className="justify-center" onClick={shareOnFacebook}>
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button variant="secondary" className="justify-center" onClick={shareOnLinkedIn}>
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
            <Button variant="secondary" className="justify-center col-span-3" onClick={sendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
