
import React from 'react';
import { Instagram, Twitter, Youtube, DiscordLogo } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex space-x-4 mb-4">
            <a 
              href="https://instagram.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <Instagram size={20} className="text-pink-500" />
            </a>
            <a 
              href="https://twitter.com/thegaurav_r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <Twitter size={20} className="text-blue-400" />
            </a>
            <a 
              href="https://youtube.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <Youtube size={20} className="text-red-500" />
            </a>
            <a 
              href="https://discord.com/users/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <DiscordLogo size={20} className="text-indigo-400" />
            </a>
          </div>
          <div className="text-white/60 text-sm">
            <p>© 2023 Anime Workout. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
