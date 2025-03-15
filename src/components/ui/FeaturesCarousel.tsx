
import React, { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, Dumbbell, Trophy, ShoppingBag, MessageCircle, Activity, Flame, TrendingDown, User, Calendar, Gift, Target } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';

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
    },
    {
      icon: <Flame className="text-white" size={24} />,
      title: "Streak System",
      description: "Maintain daily activity to build streaks and earn bonuses."
    },
    {
      icon: <TrendingDown className="text-white" size={24} />,
      title: "Deduction System",
      description: "Missing workouts will reduce points, keeping you accountable."
    },
    {
      icon: <User className="text-white" size={24} />,
      title: "Character Growth",
      description: "Level up your character as you complete more workouts."
    },
    {
      icon: <Calendar className="text-white" size={24} />,
      title: "Workout Calendar",
      description: "Plan your training schedule and track completed workouts."
    },
    {
      icon: <Gift className="text-white" size={24} />,
      title: "Achievement Rewards",
      description: "Earn special rewards by completing achievements."
    },
    {
      icon: <Target className="text-white" size={24} />,
      title: "Goal Setting",
      description: "Set personal fitness goals and track your progress."
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

  const displayedFeatures = features.slice(currentIndex, currentIndex + visibleItems);

  return (
    <div className="w-full py-4 relative">
      <div 
        className="relative overflow-hidden px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={carouselRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Features</h3>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Previous features"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <motion.div animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <motion.div>
                    <ChevronLeft size={20} className="text-white/80" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </button>
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Next features"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <motion.div>
                    <ChevronRight size={20} className="text-white/80" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </button>
          </div>
        </div>

        <div className="relative">
          <motion.div 
            className="flex gap-4"
            animate={{ x: `calc(-${currentIndex * 100}% / ${visibleItems})` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`w-full ${visibleItems === 1 ? 'min-w-full' : visibleItems === 2 ? 'min-w-[calc(50%-8px)]' : 'min-w-[calc(33.333%-10.667px)]'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard className="h-full p-6 bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:border-white/30">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-white/10 mb-4">
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
          <div className="flex space-x-1">
            {Array.from({ length: Math.ceil(features.length / visibleItems) }).map((_, index) => {
              const isActive = index === Math.floor(currentIndex / visibleItems);
              return (
                <button 
                  key={index} 
                  onClick={() => setCurrentIndex(index * visibleItems)}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive ? 'bg-white w-4' : 'bg-white/30 w-1.5'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-xs text-white/50 text-center mt-2">
          Swipe left or right to explore more features
        </div>
      </div>
      
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default FeaturesCarousel;
