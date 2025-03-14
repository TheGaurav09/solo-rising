
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 mt-auto border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#FF6B00]">SOLO RISING</h2>
          <p className="text-white/50 text-sm mt-1">Train like your favorite anime character</p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <Instagram size={18} />
          </a>
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <Twitter size={18} />
          </a>
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <Facebook size={18} />
          </a>
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <Youtube size={18} />
          </a>
          <a href="#" className="text-white/60 hover:text-white transition-colors">
            <Github size={18} />
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mb-6">
          <div>
            <h3 className="font-medium text-white mb-2">Workouts</h3>
            <ul className="space-y-1 text-white/60">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/profile-workout" className="hover:text-white transition-colors">Achievements</Link></li>
              <li><Link to="/store-achievements" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/ai-chat" className="hover:text-white transition-colors">Comments</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">About Us</h3>
            <ul className="space-y-1 text-white/60">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Help & Support</h3>
            <ul className="space-y-1 text-white/60">
              <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Support Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Legal</h3>
            <ul className="space-y-1 text-white/60">
              <li><Link to="#" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Licenses</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-xs text-white/40">
          <p>© {currentYear} Solo Rising. All rights reserved.</p>
          <div className="mt-2">
            <Link 
              to="#" 
              className="inline-block bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold hover:bg-yellow-400 transition-colors"
            >
              Buy me a coffee
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
