
import React from 'react';
import { useUser } from '@/context/UserContext';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { character } = useUser();

  return (
    <footer className="bg-black/80 border-t border-white/10 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className={`mr-1 text-${character}-primary`}>Warrior</span>
              <span className="text-white">Fit</span>
            </Link>
            <p className="text-white/50 mt-1 text-sm">
              Your journey to becoming stronger
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link to="/about" className="text-white/70 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-white/50 text-sm flex items-center justify-center">
          <span>Made with</span>
          <Heart size={14} className="mx-1 text-red-500" />
          <span>for warriors around the world</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
