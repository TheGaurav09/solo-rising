
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

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-white/10 rounded-lg overflow-hidden animated-border ${className}`}>
      <button 
        className="flex justify-between items-center p-4 w-full text-left cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
        onClick={toggleSection}
        type="button"
      >
        <h3 className="font-medium">{title}</h3>
        <div>
          {isOpen ? (
            <ChevronUp size={18} className="text-white/60" />
          ) : (
            <ChevronDown size={18} className="text-white/60" />
          )}
        </div>
      </button>
      
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
