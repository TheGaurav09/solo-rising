
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  defaultOpen = true, 
  children,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-white/10 rounded-lg overflow-hidden ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium">{title}</h3>
        <div>
          {isOpen ? (
            <ChevronUp size={18} className="text-white/60" />
          ) : (
            <ChevronDown size={18} className="text-white/60" />
          )}
        </div>
      </div>
      
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
