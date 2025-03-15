
import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';
import { Trophy, Medal, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const HallOfFamePage = () => {
  const { character } = useUser();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/10">
          <Trophy size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hall of Fame</h1>
          <p className="text-white/60 text-sm">Legendary warriors who've made history</p>
        </div>
      </div>
      
      <motion.div 
        className="mb-6 border border-yellow-400/30 rounded-xl overflow-hidden bg-gradient-to-r from-yellow-900/20 to-yellow-500/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0 bg-yellow-500 p-3 rounded-full">
            <Coffee size={24} className="text-black" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Support Solo Rising</h3>
            <p className="text-white/70 text-sm mb-3">Help us grow and continue to improve the app with new features</p>
            
            <motion.a 
              href="https://www.buymeacoffee.com/" 
              target="_blank"
              className="inline-flex gap-2 items-center bg-yellow-500 text-black text-sm px-4 py-2 rounded-md font-bold hover:bg-yellow-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Coffee size={16} />
              <span>Buy me a coffee</span>
            </motion.a>
          </div>
        </div>
      </motion.div>
      
      <AnimatedCard className="border border-white/10 backdrop-blur-md">
        <div className="p-6">
          <div className="text-center mb-8">
            <Medal size={48} className="mx-auto text-yellow-400 mb-2" />
            <h2 className="text-xl font-bold">Top Global Warriors</h2>
            <p className="text-white/60">The best of the best from around the world</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Vegeta96", points: 12500, character: "goku", country: "Japan" },
              { name: "OnePunchGod", points: 11200, character: "saitama", country: "Korea" },
              { name: "ShadowRiser", points: 10800, character: "jin-woo", country: "USA" }
            ].map((warrior, index) => (
              <div key={index} className="rounded-lg border border-white/10 overflow-hidden">
                <div className={`h-2 ${
                  warrior.character === 'goku' ? 'bg-orange-500' :
                  warrior.character === 'saitama' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      warrior.character === 'goku' ? 'bg-orange-500/20 text-orange-400' :
                      warrior.character === 'saitama' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {warrior.character === 'goku' ? 'Saiyan' :
                       warrior.character === 'saitama' ? 'Hero' :
                       'Hunter'}
                    </div>
                    <div className="text-white/60 text-xs">{warrior.country}</div>
                  </div>
                  <h3 className="font-bold text-lg text-white">{warrior.name}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-white/60 text-sm">Lifetime Points:</div>
                    <div className="font-bold text-white">{warrior.points.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center text-white/60 text-sm">
            <p>Hall of Fame is updated at the end of each month.</p>
            <p>Keep training to secure your place among the legends!</p>
          </div>
        </div>
      </AnimatedCard>
      
      {/* Add margin between content and footer */}
      <div className="mt-16"></div>
      <Footer />
    </div>
  );
};

export default HallOfFamePage;
