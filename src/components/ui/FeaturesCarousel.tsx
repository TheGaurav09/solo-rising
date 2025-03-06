
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, Trophy, Users, Crown, User, MessageCircle } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { useMediaQuery } from '@/hooks/use-mobile';

const features = [
  {
    title: "Personalized Workouts",
    description: "Track your workouts with our customizable workout logger and earn points.",
    icon: <Dumbbell className="w-8 h-8 text-blue-400" />
  },
  {
    title: "Character System",
    description: "Choose your favorite character and follow their training style.",
    icon: <User className="w-8 h-8 text-green-400" />
  },
  {
    title: "Global Rankings",
    description: "Compete with users worldwide and climb the leaderboard rankings.",
    icon: <Trophy className="w-8 h-8 text-yellow-400" />
  },
  {
    title: "AI Chat Assistant",
    description: "Get workout advice and motivation from our AI chat assistant.",
    icon: <MessageCircle className="w-8 h-8 text-purple-400" />
  },
  {
    title: "Community",
    description: "Join a community of like-minded fitness enthusiasts.",
    icon: <Users className="w-8 h-8 text-red-400" />
  },
  {
    title: "Achievements",
    description: "Unlock achievements and earn rewards as you progress.",
    icon: <Crown className="w-8 h-8 text-orange-400" />
  }
];

const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const maxIndex = features.length - 1;

  const handleNext = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  // For touch swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
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
    
    if (isLeftSwipe && currentIndex < maxIndex) {
      handleNext();
    } else if (isRightSwipe && currentIndex > 0) {
      handlePrev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="relative w-full py-4 overflow-hidden">
      <div 
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex"
          animate={{ x: `calc(-${currentIndex * 100}%)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {features.map((feature, index) => (
            <div key={index} className="min-w-full px-4">
              <AnimatedCard className="p-6 border border-white/10 animated-border h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </AnimatedCard>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1 items-center">
          {Array.from({ length: features.length }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-white' : 'bg-white/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FeaturesCarousel;
