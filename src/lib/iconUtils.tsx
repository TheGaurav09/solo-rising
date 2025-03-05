
import React from 'react';
import { 
  Award, Star, Zap, Shield, Sparkles, Diamond, Trophy, 
  TrendingUp, Heart, Flame, BookOpen, Book, Coffee, 
  Ghost, Dumbbell, Info, Timer, MessageCircle, Tag,
  User, CheckCircle, Clock, Calendar, ShoppingBag,
  Edit, MoreVertical, LogOut, ArrowUp, Globe, MapPin,
  Brain, Target, Rocket, BarChart, Crown, Gift, Medal,
  Music, Smile, Zap as Lightning, Lightbulb, Briefcase,
  Coffee as CoffeeIcon, Watch, Hexagon, Infinity
} from 'lucide-react';

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
    case 'heart': return <Heart size={size} />;
    case 'flame': return <Flame size={size} />;
    case 'book': return <Book size={size} />;
    case 'book-open': return <BookOpen size={size} />;
    case 'coffee': return <Coffee size={size} />;
    case 'ghost': return <Ghost size={size} />;
    case 'dumbbell': return <Dumbbell size={size} />;
    case 'info': return <Info size={size} />;
    case 'timer': return <Timer size={size} />;
    case 'message-circle': return <MessageCircle size={size} />;
    case 'tag': return <Tag size={size} />;
    case 'user': return <User size={size} />;
    case 'check-circle': return <CheckCircle size={size} />;
    case 'clock': return <Clock size={size} />;
    case 'calendar': return <Calendar size={size} />;
    case 'shopping-bag': return <ShoppingBag size={size} />;
    case 'edit': return <Edit size={size} />;
    case 'more-vertical': return <MoreVertical size={size} />;
    case 'logout': return <LogOut size={size} />;
    case 'arrow-up': return <ArrowUp size={size} />;
    case 'globe': return <Globe size={size} />;
    case 'map-pin': return <MapPin size={size} />;
    case 'discord': return <DiscordIcon size={size} />;
    case 'brain': return <Brain size={size} />;
    case 'target': return <Target size={size} />;
    case 'rocket': return <Rocket size={size} />;
    case 'bar-chart': return <BarChart size={size} />;
    case 'crown': return <Crown size={size} />;
    case 'gift': return <Gift size={size} />;
    case 'medal-icon': return <Medal size={size} />;
    case 'music': return <Music size={size} />;
    case 'smile': return <Smile size={size} />;
    case 'lightning': return <Lightning size={size} />;
    case 'lightbulb': return <Lightbulb size={size} />;
    case 'briefcase': return <Briefcase size={size} />;
    case 'coffee-icon': return <CoffeeIcon size={size} />;
    case 'watch': return <Watch size={size} />;
    case 'hexagon': return <Hexagon size={size} />;
    case 'infinity': return <Infinity size={size} />;
    default: return <Award size={size} />;
  }
};

export const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12h6M9 16h6M8.5 8.5a2 2 0 0 1 3.5-1.5 2 2 0 0 1 3.5 1.5V9a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3Z" />
    <path d="M7 21a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4Z" />
  </svg>
);
