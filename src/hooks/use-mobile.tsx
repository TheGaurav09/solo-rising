
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', listener);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

// Add the useIsMobile function that was missing
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
