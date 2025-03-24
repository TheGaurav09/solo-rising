
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/10 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Solo Rising</h3>
            <p className="text-sm text-white/60 mt-1">Train hard, rise higher.</p>
          </div>
          
          <div className="flex gap-4 mb-4 md:mb-0">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/hall-of-fame" className="text-sm text-white/60 hover:text-white transition-colors">
              Hall of Fame
            </Link>
            <Link to="/faq" className="text-sm text-white/60 hover:text-white transition-colors">
              FAQs
            </Link>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Solo Rising. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
