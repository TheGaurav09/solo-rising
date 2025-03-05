
import React, { useState } from 'react';
import { X, Share, Link as LinkIcon, Copy, Check, MessageCircle } from 'lucide-react';
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
  
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent('Check out my progress on Solo Prove! ' + window.location.href);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  const shareOnTelegram = () => {
    const text = encodeURIComponent('Check out my progress on Solo Prove!');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };
  
  const shareOnTwitter = () => {
    const text = encodeURIComponent('Check out my progress on Solo Prove!');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
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
          
          <div className="grid grid-cols-3 gap-3">
            <button
              className="p-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors flex flex-col items-center gap-2"
              onClick={shareOnWhatsApp}
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-sm">WhatsApp</span>
            </button>
            
            <button
              className="p-3 rounded-lg bg-[#0088cc]/20 hover:bg-[#0088cc]/30 transition-colors flex flex-col items-center gap-2"
              onClick={shareOnTelegram}
            >
              <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#0088cc">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-sm">Telegram</span>
            </button>
            
            <button
              className="p-3 rounded-lg bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 transition-colors flex flex-col items-center gap-2"
              onClick={shareOnTwitter}
            >
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#1DA1F2">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <span className="text-sm">Twitter</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
