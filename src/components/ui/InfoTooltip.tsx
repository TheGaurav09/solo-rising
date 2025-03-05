
import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  content, 
  position = 'top',
  width = 'w-64' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch(position) {
      case 'top': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right': return 'left-full top-0 ml-2';
      case 'bottom': return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-0 mr-2';
      default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="More information"
      >
        <Info size={16} />
      </button>

      {isVisible && (
        <div 
          className={`absolute z-50 ${width} p-3 rounded-lg bg-black/90 border border-white/10 shadow-lg text-sm backdrop-blur-md animate-fade-in ${getPositionClasses()}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
