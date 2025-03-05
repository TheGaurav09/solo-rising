
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  hoverEffect?: 'glow' | 'scale' | 'border' | 'none';
}

const AnimatedCard = ({ 
  className, 
  children, 
  onClick, 
  active = false,
  hoverEffect = 'scale'
}: AnimatedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'glow':
        return 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow duration-300';
      case 'scale':
        return 'hover:scale-[1.02] transition-transform duration-300';
      case 'border':
        return 'border border-white/10 hover:border-white/30 transition-colors duration-300';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'glass-card rounded-xl transition-all duration-300 ease-out',
        getHoverClasses(),
        active && 'ring-2 ring-white/30',
        isHovered && 'transform-gpu',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered 
          ? 'perspective(1000px) rotateX(2deg) rotateY(0deg)'
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
