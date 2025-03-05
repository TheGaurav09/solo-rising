
import React from 'react';
import { X, Coins, Info } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { getIconComponent } from '@/lib/iconUtils';

interface ItemDetailModalProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    item_type: string;
  };
  owned: boolean;
  onClose: () => void;
  onPurchase?: () => void;
}

const motivationalQuotes = [
  "Every achievement starts with the decision to try.",
  "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow."
];

const ItemDetailModal = ({ item, owned, onClose, onPurchase }: ItemDetailModalProps) => {
  const { character } = useUser();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-lg relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              owned 
                ? `bg-${character}-primary/30 text-${character}-primary` 
                : 'bg-white/10 text-white/60'
            }`}>
              {getIconComponent(item.icon, 32)}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center bg-white/10 px-2 py-0.5 rounded text-sm">
                  <Coins className="text-yellow-400 mr-1" size={14} />
                  <span>{item.price}</span>
                </div>
                <div className="text-sm text-white/60">
                  {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Info size={16} className="text-white/60" />
              Details
            </h3>
            <p className="text-white/70">{item.description}</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <h3 className="font-medium mb-2">Motivational Quote</h3>
            <blockquote className="italic text-white/70 pl-3 border-l-2 border-white/20">
              "{randomQuote}"
            </blockquote>
          </div>
          
          {!owned && onPurchase && (
            <AnimatedButton
              onClick={onPurchase}
              character={character || undefined}
              className="w-full"
            >
              Purchase Item
            </AnimatedButton>
          )}
          
          {owned && (
            <div className="px-3 py-2 text-center rounded-lg bg-green-500/20 text-green-500">
              You already own this item
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ItemDetailModal;
