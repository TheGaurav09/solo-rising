
import React from 'react';
import { Award, Star, Zap, Shield, Sparkles, Diamond, Trophy, TrendingUp } from 'lucide-react';

export const getIconComponent = (iconName: string, size = 18) => {
  switch(iconName) {
    case 'award': return <Award size={size} />;
    case 'star': return <Star size={size} />;
    case 'medal': return <Trophy size={size} />;
    case 'trending-up': return <TrendingUp size={size} />;
    case 'zap': return <Zap size={size} />;
    case 'sparkles': return <Sparkles size={size} />;
    case 'shield': return <Shield size={size} />;
    case 'diamond': return <Diamond size={size} />;
    default: return <Award size={size} />;
  }
};
