
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, FileText, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full text-white/60 text-sm mt-12">
      <div className="border-t border-white/10 pt-6 pb-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© {currentYear} Solo Rising. All rights reserved.</p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/privacy" className="flex items-center gap-1 hover:text-white transition-colors">
                <Shield size={14} />
                <span>Privacy Policy</span>
              </Link>
              
              <Link to="/terms" className="flex items-center gap-1 hover:text-white transition-colors">
                <FileText size={14} />
                <span>Terms of Use</span>
              </Link>
              
              <a 
                href="mailto:support@solorising.app" 
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Mail size={14} />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
