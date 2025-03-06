
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, Heart, Dumbbell, Trophy, Users, ShieldCheck } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { useMediaQuery } from '@/hooks/use-mobile';

const howToUseSteps = [
  {
    title: "Create Your Account",
    description: "Sign up with your email and password to start your fitness journey.",
    icon: <User className="w-8 h-8 text-blue-400" />
  },
  {
    title: "Choose Your Character",
    description: "Select from Goku, Saitama, or Sung Jin-Woo to define your training style.",
    icon: <Heart className="w-8 h-8 text-red-400" />
  },
  {
    title: "Log Your Workouts",
    description: "Record your exercises, reps, and duration to earn points and track progress.",
    icon: <Dumbbell className="w-8 h-8 text-green-400" />
  },
  {
    title: "Complete Challenges",
    description: "Take on special challenges to earn extra points and unlock achievements.",
    icon: <Trophy className="w-8 h-8 text-yellow-400" />
  },
  {
    title: "Check the Leaderboard",
    description: "See how you rank against other warriors globally or in your country.",
    icon: <Users className="w-8 h-8 text-purple-400" />
  },
  {
    title: "Visit the Store",
    description: "Spend your earned coins on items to customize your experience.",
    icon: <ShieldCheck className="w-8 h-8 text-orange-400" />
  }
];

const HowToUseCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px) and (min-width: 769px)");

  useEffect(() => {
    if (isMobile) {
      setVisibleCards(1);
    } else if (isTablet) {
      setVisibleCards(2);
    } else {
      setVisibleCards(3);
    }
  }, [isMobile, isTablet]);

  const maxIndex = Math.max(0, howToUseSteps.length - visibleCards);

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
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="relative w-full py-4 overflow-hidden">
      <div 
        ref={carouselRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex"
          animate={{ x: `calc(-${currentIndex * 100}% / ${visibleCards})` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`grid grid-flow-col auto-cols-fr gap-6`} style={{ width: `calc(100% * ${howToUseSteps.length / visibleCards})` }}>
            {howToUseSteps.map((step, index) => (
              <div key={index} className="px-2">
                <AnimatedCard className="p-6 border border-white/10 animated-border h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-white/10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">Step {index + 1}: {step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </AnimatedCard>
              </div>
            ))}
          </div>
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
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
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

export default HowToUseCarousel;
