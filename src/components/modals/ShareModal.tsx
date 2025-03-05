
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Copy, Share2, Check, Twitter, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

interface ShareModalProps {
  onClose: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo';
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, character = 'goku' }) => {
  const [copied, setCopied] = useState(false);
  
  const getAccentClass = () => {
    switch (character) {
      case 'goku': return 'bg-goku-primary text-white';
      case 'saitama': return 'bg-saitama-primary text-white';
      case 'jin-woo': return 'bg-jin-woo-primary text-white';
      default: return 'bg-primary text-white';
    }
  };
  
  const getShareText = () => {
    return encodeURIComponent("Check out SoloProve! I'm training like an anime character and tracking my progress. Join me!");
  };
  
  const url = encodeURIComponent(window.location.origin);
  const shareText = getShareText();
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SoloProve Workout App',
          text: decodeURIComponent(shareText),
          url: window.location.origin,
        });
        toast({
          title: "Shared Successfully",
          description: "Content was shared successfully",
          duration: 3000,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      toast({
        title: "Sharing Not Supported",
        description: "Web Share API is not supported in your browser",
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-black border border-white/10 rounded-xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Share SoloProve</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 truncate">
              <LinkIcon size={18} className="text-white/60" />
              <span className="truncate text-white/80">{window.location.origin}</span>
            </div>
            <button 
              onClick={handleCopyLink}
              className={`p-2 rounded-full transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {/* WhatsApp */}
            <a 
              href={`https://wa.me/?text=${shareText}%20${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <FaWhatsapp size={24} className="text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </a>
            
            {/* Telegram */}
            <a 
              href={`https://t.me/share/url?url=${url}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <FaTelegram size={24} className="text-blue-500" />
              <span className="text-xs">Telegram</span>
            </a>
            
            {/* Twitter */}
            <a 
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Twitter size={24} className="text-sky-500" />
              <span className="text-xs">Twitter</span>
            </a>
            
            {/* Share API (for mobile) */}
            <button 
              onClick={handleShareNative}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Share2 size={24} className="text-white/80" />
              <span className="text-xs">More</span>
            </button>
          </div>
          
          <button 
            onClick={handleShareNative}
            className={`w-full py-2 rounded-lg mt-4 ${getAccentClass()}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={18} />
              <span>Share to Apps</span>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
