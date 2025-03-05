
import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { getIconComponent } from '@/lib/iconUtils';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  item_type: string;
  purchased?: boolean;
  purchased_at?: string;
}

interface ItemDetailModalProps {
  item: StoreItem;
  onClose: () => void;
  onPurchase?: () => void;
}

// List of motivational quotes
const motivationalQuotes = [
  "Invest in yourself. It pays the best interest.",
  "The best investment you can make is in yourself.",
  "Continuous improvement is better than delayed perfection.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Small steps every day lead to big results over time.",
  "You don't have to be great to start, but you have to start to be great.",
  "Good things come to those who train.",
  "Today's pain is tomorrow's power."
];

const ItemDetailModal = ({ item, onClose, onPurchase }: ItemDetailModalProps) => {
  const { character, points } = useUser();
  
  // Get a random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  const canPurchase = points >= item.price && !item.purchased;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <AnimatedCard className="w-full max-w-md">
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full ${
              item.purchased 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-white/10 text-white/70'
            } flex items-center justify-center`}>
              {getIconComponent(item.icon, 40)}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">{item.name}</h2>
          
          <div className="flex items-center justify-center mb-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              item.purchased 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : item.item_type === 'power-up' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {item.purchased ? 'Purchased' : item.item_type.replace('-', ' ')}
              {item.purchased_at && <span> • {new Date(item.purchased_at).toLocaleDateString()}</span>}
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
            <p className="text-white/80 text-center">
              {item.description}
            </p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">Price</span>
              <span className={`font-medium ${
                canPurchase ? 'text-green-400' : points < item.price ? 'text-red-400' : 'text-white/70'
              }`}>
                {item.price} points
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Your Points</span>
              <span className="font-medium">{points}</span>
            </div>
            
            {item.purchased && item.purchased_at && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                <span className="text-white/60 text-sm">Purchased on</span>
                <span className="text-green-400">
                  {new Date(item.purchased_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
            <h3 className="font-medium mb-2 text-center">Motivational Quote</h3>
            <blockquote className="italic text-white/70 pl-3 border-l-2 border-white/20">
              "{randomQuote}"
            </blockquote>
          </div>
          
          {onPurchase && !item.purchased ? (
            <div className="grid grid-cols-2 gap-4">
              <AnimatedButton
                onClick={onClose}
                character={character || undefined}
                variant="outline"
              >
                Cancel
              </AnimatedButton>
              
              <AnimatedButton
                onClick={onPurchase}
                disabled={!canPurchase}
                className={`${
                  canPurchase 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                Purchase
              </AnimatedButton>
            </div>
          ) : (
            <AnimatedButton
              onClick={onClose}
              character={character || undefined}
              className="w-full"
            >
              Close
            </AnimatedButton>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ItemDetailModal;
