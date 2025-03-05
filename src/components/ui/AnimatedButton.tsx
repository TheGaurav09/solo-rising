
import React from 'react';
import { Button } from './button';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  character?: 'goku' | 'saitama' | 'jin-woo' | null;
};

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background duration-200 border',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary: 'border-transparent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-white/20 bg-white/5 hover:bg-white/10',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const AnimatedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, character, children, ...props }, ref) => {
    let characterClass = '';
    let textColorClass = '';

    // If character is provided, override with character-specific styling
    if (character) {
      switch (character) {
        case 'goku':
          characterClass = 'bg-goku-primary hover:bg-goku-primary/90 border-transparent';
          textColorClass = 'text-black';
          break;
        case 'saitama':
          characterClass = 'bg-saitama-primary hover:bg-saitama-primary/90 border-transparent';
          textColorClass = 'text-black';
          break;
        case 'jin-woo':
          characterClass = 'bg-jin-woo-primary hover:bg-jin-woo-primary/90 border-transparent';
          break;
        default:
          break;
      }
    }

    return (
      <Button
        className={cn(
          buttonVariants({ variant, size }), 
          'relative overflow-hidden group hover-lift transition-all', 
          characterClass, 
          textColorClass,
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="z-10 relative group-hover:scale-105 transition-transform duration-200">
          {children}
        </span>
        <span className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-200"></span>
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
