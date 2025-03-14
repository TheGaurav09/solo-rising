
import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface SectionCarouselProps {
  children: ReactNode[];
  title?: string;
  itemsPerView?: number;
  gap?: number;
}

const SectionCarousel: React.FC<SectionCarouselProps> = ({ 
  children, 
  title, 
  itemsPerView = 3,
  gap = 16
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Adjust cards per view based on screen size
  const getItemsPerView = () => {
    if (isMobile) return 1;
    if (itemsPerView > children.length) return children.length;
    return itemsPerView;
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        const containerWidth = scrollRef.current.clientWidth;
        const scrollWidth = scrollRef.current.scrollWidth;
        setMaxScroll(scrollWidth - containerWidth);
        setShowControls(scrollWidth > containerWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [children]);
  
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - containerWidth) 
        : Math.min(maxScroll, scrollPosition + containerWidth);
      
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Calculate child width based on items per view and gap
  const childWidth = `calc((100% - ${(getItemsPerView() - 1) * gap}px) / ${getItemsPerView()})`;
  
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
      
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory" 
          style={{ scrollSnapType: 'x mandatory', gap: `${gap}px` }}
        >
          {React.Children.map(children, (child, index) => (
            <div 
              className="flex-shrink-0 snap-start" 
              style={{ width: childWidth }}
              key={index}
            >
              {child}
            </div>
          ))}
        </div>
        
        {/* Navigation controls - only on non-mobile */}
        {showControls && !isMobile && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
              onClick={() => scrollTo('left')}
              disabled={scrollPosition <= 0}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
              onClick={() => scrollTo('right')}
              disabled={scrollPosition >= maxScroll}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      
      {/* Dots indicator - for mobile */}
      {isMobile && children.length > 1 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {Array.from({ length: children.length }).map((_, index) => {
            // Calculate which dot is active based on scroll position
            const containerWidth = scrollRef.current?.clientWidth || 0;
            const activeIndex = Math.round(scrollPosition / containerWidth);
            
            return (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === index ? 'bg-white scale-110' : 'bg-white/30'
                }`}
                onClick={() => {
                  if (scrollRef.current) {
                    const containerWidth = scrollRef.current.clientWidth;
                    scrollRef.current.scrollTo({
                      left: containerWidth * index,
                      behavior: 'smooth'
                    });
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SectionCarousel;
