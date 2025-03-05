
import React from 'react';
import { Instagram, Twitter, Youtube, MessageCircle, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-md py-6 mt-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="flex space-x-4">
            <a 
              href="https://instagram.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all group"
            >
              <Instagram 
                size={20} 
                className="text-white/60 group-hover:text-pink-400 transition-colors" 
              />
            </a>
            <a 
              href="https://twitter.com/thegaurav_r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all group"
            >
              <Twitter 
                size={20} 
                className="text-white/60 group-hover:text-blue-400 transition-colors" 
              />
            </a>
            <a 
              href="https://youtube.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all group"
            >
              <Youtube 
                size={20} 
                className="text-white/60 group-hover:text-red-500 transition-colors" 
              />
            </a>
            <a 
              href="https://discord.com/users/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all group"
            >
              <MessageCircle 
                size={20} 
                className="text-white/60 group-hover:text-indigo-400 transition-colors" 
              />
            </a>
          </div>
        </div>
        
        <div className="text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} GokAI Workout. All rights reserved.</p>
          <p className="mt-1 flex items-center justify-center">
            Built with <span className="px-1">❤️</span> by thegaurav.r
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
