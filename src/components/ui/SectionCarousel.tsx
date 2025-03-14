
import React, { ReactNode } from 'react';

interface SectionCarouselProps {
  title: string;
  imageSrc?: string;
  color: string;
  children?: ReactNode;
}

const SectionCarousel = ({ title, imageSrc, color, children }: SectionCarouselProps) => {
  return (
    <div className="rounded-xl overflow-hidden bg-black/20 border border-white/10">
      <div className="flex flex-col md:flex-row">
        {imageSrc && (
          <div className="md:w-1/3">
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full h-64 md:h-full object-cover" 
            />
          </div>
        )}
        
        <div className={`p-8 ${imageSrc ? 'md:w-2/3' : 'w-full'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${color}`}>{title}</h3>
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionCarousel;
