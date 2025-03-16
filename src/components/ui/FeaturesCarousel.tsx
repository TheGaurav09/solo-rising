
import React, { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, Dumbbell, Trophy, ShoppingBag, MessageCircle, Activity, Flame, TrendingDown, User, Calendar, Gift, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';

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

  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (currentIndex < features.length - visibleItems) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(features.length - visibleItems); // Loop to end
    }
  };

  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNext();
    }
    
    if (isRightSwipe) {
      handlePrev();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Get color class for icon background based on feature color
  const getIconBgClass = (color: string) => {
    const colorMap: {[key: string]: string} = {
      blue: "bg-blue-500/20",
      green: "bg-green-500/20",
      yellow: "bg-yellow-500/20",
      purple: "bg-purple-500/20",
      pink: "bg-pink-500/20",
      indigo: "bg-indigo-500/20",
      red: "bg-red-500/20",
      orange: "bg-orange-500/20",
      teal: "bg-teal-500/20",
      cyan: "bg-cyan-500/20",
      amber: "bg-amber-500/20",
      lime: "bg-lime-500/20"
    };
    
    return colorMap[color] || "bg-white/10";
  };

  return (
    <div className="w-full py-4 relative">
      <div 
        className="relative overflow-hidden px-4 border border-white/10 rounded-xl p-4 backdrop-blur-sm bg-black/20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={carouselRef}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white text-center w-full">Features</h3>
        </div>

        <div className="flex justify-center space-x-2 mb-4">
          <motion.button 
            onClick={handlePrev}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-white/10"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Previous features"
          >
            <motion.div animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronLeft size={20} className="text-white/80" />
            </motion.div>
          </motion.button>
          <motion.button 
            onClick={handleNext}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-white/10"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Next features"
          >
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronRight size={20} className="text-white/80" />
            </motion.div>
          </motion.button>
        </div>

        <div className="relative">
          <motion.div 
            className="flex gap-4"
            animate={{ x: `calc(-${currentIndex * 100}%)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="min-w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard className="h-full p-6 bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:border-white/30">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${getIconBgClass(feature.color)} mb-4 border border-white/10`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex justify-center mt-4">
          <div className="flex space-x-1.5">
            {Array.from({ length: features.length }).map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <motion.button 
                  key={index} 
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive ? 'bg-white w-6' : 'bg-white/30 w-1.5'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to feature ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-xs text-white/50 text-center mt-2">
          Swipe left or right to explore more features
        </div>
      </div>
    </div>
  );
};

export default FeaturesCarousel;
