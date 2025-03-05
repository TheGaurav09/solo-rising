import React from 'react';
import { 
  Award, Star, Zap, Shield, Sparkles, Diamond, Trophy, 
  TrendingUp, Heart, Flame, BookOpen, Book, Coffee, 
  Ghost, Dumbbell, Info, Timer, MessageCircle, Tag,
  User, CheckCircle, Clock, Calendar, ShoppingBag,
  Edit, MoreVertical, LogOut, ArrowUp, Globe, MapPin
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
    case 'discord': return <MessageCircle size={size} />;
    default: return <Award size={size} />;
  }
};
