
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  children, 
  className,
  title,
  icon
}) => {
  return (
    <div className={cn(
      "bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-4",
      className
    )}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && icon}
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
