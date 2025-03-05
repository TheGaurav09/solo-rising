import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';

// Update the import to use the correct hook
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
