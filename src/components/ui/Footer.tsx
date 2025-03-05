
import React from 'react';
import { Heart, Instagram, Twitter, MessageCircle, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 backdrop-blur-md py-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gradient goku-gradient mr-2">SOLO PROVE</span>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Train like your favorite anime character
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://instagram.com/thegaurav.r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#E1306C] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com/thegaurav.r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#1DA1F2] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://github.com/thegaurav.r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Github"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://t.me/thegaurav.r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#0088cc] transition-colors"
                aria-label="Telegram"
              >
                <MessageCircle size={20} />
              </a>
            </div>
            
            <p className="text-white/60 text-sm text-center md:text-right">
              © {currentYear} Solo Prove. All rights reserved.
            </p>
            <p className="text-white/40 text-xs mt-1 flex items-center">
              Made with <Heart size={12} className="mx-1 text-red-500" /> for anime and fitness fans
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Characters</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><button className="hover:text-white transition-colors">Goku (Dragon Ball)</button></li>
              <li><button className="hover:text-white transition-colors">Saitama (One Punch Man)</button></li>
              <li><button className="hover:text-white transition-colors">Sung Jin-Woo (Solo Leveling)</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><button onClick={() => navigate('/workout')} className="hover:text-white transition-colors">Workouts</button></li>
              <li><button onClick={() => navigate('/achievements')} className="hover:text-white transition-colors">Achievements</button></li>
              <li><button onClick={() => navigate('/store')} className="hover:text-white transition-colors">Store</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><button className="hover:text-white transition-colors">Workout Guides</button></li>
              <li><button className="hover:text-white transition-colors">FAQ</button></li>
              <li><button className="hover:text-white transition-colors">Community</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-white transition-colors">Cookies</button></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
