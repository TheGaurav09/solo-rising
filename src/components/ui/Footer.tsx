import React from 'react';
import { Heart, Instagram, Twitter, MessageCircle, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';
import { getIconComponent } from '@/lib/iconUtils';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Social media links with hover colors
  const socialLinks = [
    {
      name: "Instagram",
      url: "https://instagram.com/thegaurav.r",
      icon: <Instagram size={isMobile ? 18 : 20} />,
      hoverColor: "hover:text-[#E1306C]"
    },
    {
      name: "Twitter",
      url: "https://twitter.com/thegaurav.r",
      icon: <Twitter size={isMobile ? 18 : 20} />,
      hoverColor: "hover:text-[#1DA1F2]"
    },
    {
      name: "Discord",
      url: "https://discord.gg/solorising",
      icon: getIconComponent('discord', isMobile ? 18 : 20),
      hoverColor: "hover:text-[#5865F2]"
    },
    {
      name: "Telegram",
      url: "https://t.me/thegaurav.r",
      icon: <MessageCircle size={isMobile ? 18 : 20} />,
      hoverColor: "hover:text-[#0088cc]"
    }
  ];

  return (
    <footer className="bg-black/50 backdrop-blur-md py-6 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-2xl font-bold text-gradient goku-gradient mr-2">SOLO RISING</span>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Train like your favorite anime character
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-3 md:space-x-4 mb-3">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-white/60 ${social.hoverColor} transition-colors`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col items-center">
              <p className="text-white/60 text-sm text-center md:text-right">
                © {currentYear} Solo Rising. All rights reserved.
              </p>
              <p className="text-white/40 text-xs mt-1 flex items-center">
                Made with <Heart size={12} className="mx-1 text-red-500" /> for anime and fitness fans
              </p>
              <div className="mt-2">
                <a href="https://www.buymeacoffee.com/SoloRising" target="_blank" rel="noreferrer">
                  <button className="flex items-center gap-2 bg-[#FFDD00] text-black text-sm font-medium px-3 py-1 rounded-md">
                    <Coffee size={16} />
                    <span>Buy me a coffee</span>
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-sm md:text-base">Features</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-white/60">
              <li><button onClick={() => navigate('/workout')} className="hover:text-white transition-colors">Workouts</button></li>
              <li><button onClick={() => navigate('/achievements')} className="hover:text-white transition-colors">Achievements</button></li>
              <li><button onClick={() => navigate('/store')} className="hover:text-white transition-colors">Store</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm md:text-base">Resources</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-white/60">
              <li><button className="hover:text-white transition-colors">Workout Guides</button></li>
              <li><button className="hover:text-white transition-colors">FAQ</button></li>
              <li><button className="hover:text-white transition-colors">Community</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm md:text-base">Legal</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-white/60">
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
