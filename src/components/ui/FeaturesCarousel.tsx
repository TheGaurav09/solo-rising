
import React from 'react';
import { LayoutDashboard, Dumbbell, Trophy, ShoppingBag, MessageCircle, Activity } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

const FeaturesCarousel = () => {
  const features = [
    {
      icon: <LayoutDashboard className="text-white" size={24} />,
      title: "Dashboard",
      description: "Track your workout progress and achievements in one place."
    },
    {
      icon: <Dumbbell className="text-white" size={24} />,
      title: "Custom Workouts",
      description: "Character-specific training schedules designed for your goals."
    },
    {
      icon: <Trophy className="text-white" size={24} />,
      title: "Leaderboard",
      description: "Compete with others and climb the global rankings."
    },
    {
      icon: <ShoppingBag className="text-white" size={24} />,
      title: "Store",
      description: "Unlock exclusive items with coins earned from workouts."
    },
    {
      icon: <MessageCircle className="text-white" size={24} />,
      title: "AI Trainer",
      description: "Get personalized advice from your character's AI."
    },
    {
      icon: <Activity className="text-white" size={24} />,
      title: "Progress Tracking",
      description: "Visualize your journey with detailed statistics."
    }
  ];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="inline-block w-[300px] min-w-[300px]"
          >
            <AnimatedCard className="h-full p-6 bg-black/40 backdrop-blur-md border border-white/10">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-white/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            </AnimatedCard>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturesCarousel;
