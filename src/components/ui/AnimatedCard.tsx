
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  hoverEffect?: 'glow' | 'border' | 'none';
}

const AnimatedCard = ({ 
  className, 
  children, 
  onClick, 
  active = false,
  hoverEffect = 'border'
}: AnimatedCardProps) => {
  return (
    <div
      className={cn(
        'glass-card rounded-xl relative overflow-hidden',
        hoverEffect === 'border' && 'before:content-[""] before:absolute before:w-[200%] before:h-[200%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-left-[100%] before:animate-border-slide',
        hoverEffect === 'glow' && 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow duration-300',
        active && 'ring-2 ring-white/30',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
