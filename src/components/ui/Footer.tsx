
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-black/40 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} Workout Wars. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={20} className="text-white" />
            </a>
            <a 
              href="https://twitter.com/thegaurav_r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter size={20} className="text-white" />
            </a>
            <a 
              href="https://youtube.com/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
              aria-label="YouTube"
            >
              <Youtube size={20} className="text-white" />
            </a>
            <a 
              href="https://discord.com/users/thegaurav.r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
              aria-label="Discord"
            >
              <MessageCircle size={20} className="text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
