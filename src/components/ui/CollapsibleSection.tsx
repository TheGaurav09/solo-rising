
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false, // Default is now false (collapsed)
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Handle toggle with a single click
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle click outside to close the section if it's open
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside the collapsible section
      if (isOpen && !target.closest(`[data-collapsible-id="${title}"]`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, title]);

  return (
    <div 
      className={`border border-white/10 rounded-lg overflow-hidden ${className}`}
      data-collapsible-id={title}
    >
      <button
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-left"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <h3 className="font-medium text-lg">{title}</h3>
        {isOpen ? (
          <ChevronUp className="text-white/60" />
        ) : (
          <ChevronDown className="text-white/60" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-black/20">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
