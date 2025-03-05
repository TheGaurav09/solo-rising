
import React from 'react';
import { Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

const Footer = () => {
  const { character } = useUser();
  
  const getColorClass = (platform: string) => {
    switch (platform) {
      case 'twitter': 
        return 'group-hover:text-blue-400';
      case 'instagram':
        return 'group-hover:text-rose-500';
      case 'youtube':
        return 'group-hover:text-red-500';
      case 'discord':
        return 'group-hover:text-indigo-400';
      default:
        return '';
    }
  };

  return (
    <footer className="mt-auto py-6 px-4 border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Workout Wars. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-white/70 text-sm">Join us on:</span>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors group"
              aria-label="Twitter"
            >
              <Twitter className={`h-5 w-5 ${getColorClass('twitter')}`} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors group"
              aria-label="Instagram"
            >
              <Instagram className={`h-5 w-5 ${getColorClass('instagram')}`} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors group"
              aria-label="YouTube"
            >
              <Youtube className={`h-5 w-5 ${getColorClass('youtube')}`} />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors group"
              aria-label="Discord"
            >
              <MessageCircle className={`h-5 w-5 ${getColorClass('discord')}`} />
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <Link 
              to="/terms" 
              className={`text-white/60 hover:${character ? `text-${character}-primary` : 'text-primary'} transition-colors`}
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className={`text-white/60 hover:${character ? `text-${character}-primary` : 'text-primary'} transition-colors`}
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
