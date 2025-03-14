
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Dumbbell, Crown, BadgeCheck, LucideIcon } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowToUseCarousel = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: Step[] = [
    {
      icon: <User className="text-blue-400" />,
      title: "Sign up with your email",
      description: "Create your account and personalize your fitness journey"
    },
    {
      icon: <Dumbbell className="text-green-400" />,
      title: "Complete daily workouts",
      description: "Follow guided workouts based on your chosen character"
    },
    {
      icon: <Crown className="text-yellow-400" />,
      title: "Earn points and rewards",
      description: "Track your progress and climb the leaderboard rankings"
    },
    {
      icon: <BadgeCheck className="text-purple-400" />,
      title: "Unlock achievements",
      description: "Discover new challenges and collect special rewards"
    }
  ];
  
  const handleNext = () => {
    setCurrentStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrev = () => {
    setCurrentStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  return (
    <div className="flex justify-center">
      <div className="relative max-w-md w-full">
        <div className="flex items-center justify-center p-6">
          <div className="bg-black/30 p-4 rounded-full">
            {steps[currentStep].icon}
          </div>
        </div>
        
        <div className="text-center px-4">
          <h3 className="text-lg font-bold text-white">{steps[currentStep].title}</h3>
          <p className="text-white/70 text-sm mt-2">{steps[currentStep].description}</p>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${index === currentStep ? 'bg-white w-3' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseCarousel;
