
import React from 'react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Coffee, Award, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

const HallOfFamePage = () => {
  const { character } = useUser();
  
  const hallOfFameUsers = [
    {
      name: "Alex Johnson",
      character: "goku",
      achievement: "First to reach 1000 points",
      date: "May 2023"
    },
    {
      name: "Sarah Williams",
      character: "saitama",
      achievement: "30-day workout streak champion",
      date: "June 2023"
    },
    {
      name: "Michael Rodriguez",
      character: "jin-woo",
      achievement: "Most consistent Hunter",
      date: "July 2023"
    },
    {
      name: "Emily Chen",
      character: "goku",
      achievement: "Highest single workout score",
      date: "August 2023"
    },
    {
      name: "James Wilson",
      character: "saitama",
      achievement: "Community ambassador",
      date: "September 2023"
    }
  ];
  
  const getCharacterColor = (char: string) => {
    switch(char) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: return 'text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Hall of Fame</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="text-yellow-500" />
                Elite Warriors
              </h2>
              <Award size={24} className="text-yellow-500" />
            </div>
            
            <div className="space-y-4">
              {hallOfFameUsers.map((user, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-bold text-lg ${getCharacterColor(user.character)}`}>
                        {user.name}
                      </h3>
                      <p className="text-white/70">{user.achievement}</p>
                    </div>
                    <div className="text-right text-sm text-white/50">
                      {user.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="text-red-500" />
                Support Solo Rising
              </h2>
              <Coffee size={24} className="text-amber-500" />
            </div>
            
            <div className="text-center py-6">
              <Coffee size={64} className="mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-bold mb-2">Buy me a coffee</h3>
              <p className="text-white/70 mb-4">
                If you enjoy using Solo Rising and want to support further development,
                consider buying me a coffee! Your support helps keep the servers running
                and enables new features.
              </p>
              
              <a 
                href="https://www.buymeacoffee.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-block px-6 py-3 rounded-lg font-bold transition-all ${
                  character === 'goku' ? 'bg-goku-primary hover:bg-goku-primary/80' :
                  character === 'saitama' ? 'bg-saitama-primary hover:bg-saitama-primary/80' :
                  character === 'jin-woo' ? 'bg-jin-woo-primary hover:bg-jin-woo-primary/80' :
                  'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coffee size={20} />
                  <span>Buy me a coffee</span>
                </div>
              </a>
              
              <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="font-bold mb-2">Future Plans</h4>
                <ul className="text-left space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <Star size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>More character options and workout types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Advanced achievement system with character-specific challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Mobile app for tracking workouts on the go</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default HallOfFamePage;
