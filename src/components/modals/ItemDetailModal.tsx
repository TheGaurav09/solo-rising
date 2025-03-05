
import React from 'react';
import { X, Award, Coins } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  item_type: string;
  image_path?: string;
}

interface ItemDetailModalProps {
  item: StoreItem;
  onClose: () => void;
  onPurchase: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo' | null;
}

const ItemDetailModal = ({ item, onClose, onPurchase, character }: ItemDetailModalProps) => {
  const { coins } = useUser();
  const canAfford = coins >= item.price;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-black/80 border border-white/10 rounded-lg p-6 max-w-md w-full backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{item.name}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex justify-center my-6">
          <div className={`w-24 h-24 rounded-full ${character ? `bg-${character}-primary/20` : 'bg-white/10'} flex items-center justify-center`}>
            <Award size={40} className={character ? `text-${character}-primary` : 'text-yellow-500'} />
          </div>
        </div>
        
        <p className="mb-4 text-white/80">{item.description}</p>
        
        <div className="bg-white/5 rounded p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Price:</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Coins size={18} />
              <span className="font-bold">{item.price}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-white/60">Your Coins:</span>
            <div className="flex items-center gap-1 text-white">
              <Coins size={18} className="text-yellow-500" />
              <span className="font-bold">{coins}</span>
            </div>
          </div>
          
          {!canAfford && (
            <div className="text-red-400 text-sm mt-2 text-right">
              Not enough coins to purchase
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={onPurchase}
            disabled={!canAfford}
            className={`py-2 rounded-lg transition-colors ${
              canAfford 
                ? character
                  ? `bg-${character}-primary/20 text-${character}-primary hover:bg-${character}-primary/30`
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }`}
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
