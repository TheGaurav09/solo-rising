
import React from 'react';
import { Coffee, Trophy, Crown, Star } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';

const HallOfFamePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">HALL OF FAME</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            The legendary supporters who help Solo Rising grow
          </p>
          
          <div className="mt-8 text-center text-white/70">
            <p className="text-3xl font-bold mb-2">0</p>
            <p className="text-lg">Supporters</p>
          </div>
        </div>
        
        {/* Buy Me a Coffee section */}
        <div className="mt-16 text-center">
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Support Solo Rising</h2>
            <p className="text-white/70 mb-6">
              If you're enjoying Solo Rising and want to support its development, consider buying me a coffee!
            </p>
            <a 
              href="https://www.buymeacoffee.com/SoloRising" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFDD00] text-black font-medium px-6 py-3 rounded-md hover:bg-[#E5C700] transition-colors"
            >
              <Coffee size={24} />
              <span>Buy me a coffee</span>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HallOfFamePage;
