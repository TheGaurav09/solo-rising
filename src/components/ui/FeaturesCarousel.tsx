
import React, { useState } from 'react';
import { 
  LayoutDashboard, Dumbbell, Trophy, ShoppingBag, 
  MessageCircle, Activity, Flame, TrendingDown, 
  User, Calendar, Gift, Target, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-mobile';

const FeaturesCarousel = () => {
  const features = [
    {
      icon: <LayoutDashboard className="text-blue-400" size={24} />,
      title: "Dashboard",
      description: "Track your workout progress and achievements in one place.",
      color: "blue"
    },
    {
      icon: <Dumbbell className="text-green-400" size={24} />,
      title: "Custom Workouts",
      description: "Character-specific training schedules designed for your goals.",
      color: "green"
    },
    {
      icon: <Trophy className="text-yellow-400" size={24} />,
      title: "Leaderboard",
      description: "Compete with others and climb the global rankings.",
      color: "yellow"
    },
    {
      icon: <ShoppingBag className="text-purple-400" size={24} />,
      title: "Store",
      description: "Unlock exclusive items with coins earned from workouts.",
      color: "purple"
    },
    {
      icon: <MessageCircle className="text-pink-400" size={24} />,
      title: "AI Trainer",
      description: "Get personalized advice from your character's AI.",
      color: "pink"
    },
    {
      icon: <Activity className="text-indigo-400" size={24} />,
      title: "Progress Tracking",
      description: "Visualize your journey with detailed statistics.",
      color: "indigo"
    },
    {
      icon: <Flame className="text-red-400" size={24} />,
      title: "Streak System",
      description: "Maintain daily activity to build streaks and earn bonuses.",
      color: "red"
    },
    {
      icon: <TrendingDown className="text-orange-400" size={24} />,
      title: "Deduction System",
      description: "Missing workouts will reduce points, keeping you accountable.",
      color: "orange"
    },
    {
      icon: <User className="text-teal-400" size={24} />,
      title: "Character Growth",
      description: "Level up your character as you complete more workouts.",
      color: "teal"
    },
    {
      icon: <Calendar className="text-cyan-400" size={24} />,
      title: "Workout Calendar",
      description: "Plan your training schedule and track completed workouts.",
      color: "cyan"
    },
    {
      icon: <Gift className="text-amber-400" size={24} />,
      title: "Achievement Rewards",
      description: "Earn special rewards by completing achievements.",
      color: "amber"
    },
    {
      icon: <Target className="text-lime-400" size={24} />,
      title: "Goal Setting",
      description: "Set personal fitness goals and track your progress.",
      color: "lime"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Calculate how many items to show based on screen size
  const itemsToShow = isMobile ? 1 : 3;
  
  // Ensure we don't go beyond our feature array
  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev < features.length - itemsToShow ? prev + 1 : prev));
  };
  
  // Get the current features to display
  const displayFeatures = features.slice(currentIndex, currentIndex + itemsToShow);

  return (
    <div className="w-full py-8">
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white text-center mb-4">Features</h3>
        
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <motion.button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-white/10"
              whileTap={{ scale: 0.9 }}
              disabled={currentIndex === 0}
              aria-label="Previous features"
            >
              <ChevronLeft size={20} className="text-white/80" />
            </motion.button>
            
            <motion.button 
              onClick={handleNext}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-white/10"
              whileTap={{ scale: 0.9 }}
              disabled={currentIndex >= features.length - itemsToShow}
              aria-label="Next features"
            >
              <ChevronRight size={20} className="text-white/80" />
            </motion.button>
          </div>
          
          <div className="flex items-stretch gap-4 overflow-hidden">
            {displayFeatures.map((feature, index) => (
              <motion.div
                key={currentIndex + index}
                className="flex-1 min-w-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-full p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className={`p-3 rounded-full bg-${feature.color}-500/20 mb-4 border border-white/10`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: features.length - itemsToShow + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/30 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesCarousel;
