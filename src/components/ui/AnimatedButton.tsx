
import React, { forwardRef } from 'react';
import { cn } from "@/lib/utils";
import { useMediaQuery } from '@/hooks/use-mobile';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  character?: 'goku' | 'saitama' | 'jin-woo' | null | undefined;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(({
  children, 
  onClick, 
  className,
  variant = 'primary',
  size = 'md',
  character = null,
  disabled = false,
  type = 'button',
  style,
  ...props
}, ref) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const getCharacterGradient = () => {
    switch (character) {
      case 'goku':
        return 'bg-gradient-to-r from-goku-primary to-goku-secondary hover:from-goku-secondary hover:to-goku-primary';
      case 'saitama':
        return 'bg-gradient-to-r from-saitama-primary to-saitama-secondary hover:from-saitama-secondary hover:to-saitama-primary';
      case 'jin-woo':
        return 'bg-gradient-to-r from-jin-woo-primary to-jin-woo-secondary hover:from-jin-woo-secondary hover:to-jin-woo-primary';
      default:
        return '';
    }
  };

  const getVariantClasses = () => {
    if (character) {
      return getCharacterGradient();
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'outline':
        return 'border border-white/20 bg-transparent hover:bg-white/5 hover:border-white/40';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-sm';
      case 'md':
        return 'py-2 px-4';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return '';
    }
  };

  // Adjust scale for mobile to prevent overflow issues
  const hoverScaleClass = isMobile ? 'hover:scale-[1.005]' : 'hover:scale-[1.01]';

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={style}
      className={cn(
        'relative rounded-lg font-medium',
        'transition-all duration-300 ease-out transform-gpu',
        'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/25',
        'active:scale-[0.99] hover:border hover:border-white/20',
        'max-w-full break-words whitespace-normal', // Fixes the text wrapping issue
        hoverScaleClass, // Dynamic scale based on device
        getVariantClasses(),
        getSizeClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
