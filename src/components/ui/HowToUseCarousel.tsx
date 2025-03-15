
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Dumbbell, Crown, BadgeCheck, Flame, Clock, Trophy } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowToUseCarousel = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const steps: Step[] = [
    {
      icon: <User className="text-blue-400" />,
      title: "Create Your Account",
      description: "Sign up with your email and choose your warrior name to begin your fitness journey"
    },
    {
      icon: <Dumbbell className="text-green-400" />,
      title: "Select Your Character",
      description: "Choose between Goku, Saitama, or Jin-Woo to determine your training style"
    },
    {
      icon: <Clock className="text-orange-400" />,
      title: "Complete Daily Workouts",
      description: "Follow guided workouts based on your character's routine to earn points and XP"
    },
    {
      icon: <Flame className="text-red-400" />,
      title: "Maintain Your Streak",
      description: "Train consistently to build a streak and earn bonus rewards"
    },
    {
      icon: <Trophy className="text-yellow-400" />,
      title: "Climb the Leaderboard",
      description: "Compete with others to reach the top of global and character rankings"
    },
    {
      icon: <Crown className="text-purple-400" />,
      title: "Earn Rewards",
      description: "Collect coins and unlock special items in the store as you progress"
    },
    {
      icon: <BadgeCheck className="text-indigo-400" />,
      title: "Unlock Achievements",
      description: "Complete challenges to earn badges and special recognition"
    }
  ];
  
  const handleNext = () => {
    setCurrentStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrev = () => {
    setCurrentStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
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

  return (
    <div 
      className="relative overflow-hidden max-w-md mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={carouselRef}
    >
      <div className="relative">
        <motion.div 
          className="flex flex-col items-center p-6"
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-black/30 p-4 rounded-full border border-white/10">
            {steps[currentStep].icon}
          </div>
          
          <h3 className="text-lg font-bold text-white mt-4">{steps[currentStep].title}</h3>
          <p className="text-white/70 text-sm mt-2 text-center max-w-xs">{steps[currentStep].description}</p>
          
          <div className="flex justify-center space-x-2 mt-6">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Previous step"
            >
              <ChevronLeft size={20} className="text-white/80" />
            </button>
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Next step"
            >
              <ChevronRight size={20} className="text-white/80" />
            </button>
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="flex space-x-1.5">
          {steps.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentStep(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-white w-6' 
                  : 'bg-white/30 w-1.5'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-xs text-white/50 text-center mt-4">
        Swipe left or right to navigate
      </div>
    </div>
  );
};

export default HowToUseCarousel;
