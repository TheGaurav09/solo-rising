import React, { useState } from 'react';
import { X, Share, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareModalProps {
  onClose: () => void;
  character?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, character = 'goku' }) => {
  const [copied, setCopied] = useState(false);
  
  const getThemeColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary text-white';
      case 'saitama': return 'bg-saitama-primary text-white';
      case 'jin-woo': return 'bg-jin-woo-primary text-white';
      default: return 'bg-primary text-white';
    }
  };
  
  const getBgColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary/10';
      case 'saitama': return 'bg-saitama-primary/10';
      case 'jin-woo': return 'bg-jin-woo-primary/10';
      default: return 'bg-primary/10';
    }
  };
  
  const getTextColor = () => {
    switch(character) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: return 'text-primary';
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Solo Prove',
          text: 'Check out my progress on Solo Prove!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Share Solo Prove</h2>
          <button 
            className="p-1 rounded-full hover:bg-white/10"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <button
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${getThemeColor()} transition-transform hover:scale-105`}
            onClick={handleShare}
          >
            <Share size={20} />
            <span className="font-medium">Share with friends</span>
          </button>
          
          <div className="space-y-2">
            <label className="text-sm text-white/70">Or copy this link:</label>
            <div className="flex items-center gap-2">
              <div className={`flex-1 rounded-lg ${getBgColor()} border border-white/10 p-3 flex items-center gap-2 overflow-hidden`}>
                <LinkIcon size={16} className="text-white/60 flex-shrink-0" />
                <span className="truncate text-white/80">{window.location.href}</span>
              </div>
              <button
                className={`p-3 rounded-lg ${copied ? 'bg-green-500/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <div className={`rounded-lg ${getBgColor()} border border-white/20 p-4 mt-4`}>
            <h3 className={`font-medium ${getTextColor()} mb-2`}>Install Solo Prove App</h3>
            <p className="text-sm text-white/70 mb-3">Install the app for quick access to your workouts and progress tracking.</p>
            <button 
              className={`text-sm px-4 py-2 rounded-lg ${getThemeColor()} w-full`}
              onClick={onClose}
            >
              Install Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
