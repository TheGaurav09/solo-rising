import React from 'react';
import { Coins, ShoppingCart, PackageOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface StoreItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    item_type: string;
  };
  owned?: boolean;
  onClick: () => void;
  character?: 'goku' | 'saitama' | 'jin-woo' | null;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  owned = false,
  onClick,
  character
}) => {
  const { coins } = useUser();
  const canAfford = coins >= item.price;
  
  const getButtonColor = () => {
    if (owned) return 'bg-green-600 hover:bg-green-700';
    if (!canAfford) return 'bg-gray-600 cursor-not-allowed';
    
    switch(character) {
      case 'goku': return 'bg-goku-primary hover:bg-goku-primary/80';
      case 'saitama': return 'bg-saitama-primary hover:bg-saitama-primary/80';
      case 'jin-woo': return 'bg-jin-woo-primary hover:bg-jin-woo-primary/80';
      default: return 'bg-primary hover:bg-primary/80';
    }
  };
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
      <div className="relative h-40 overflow-hidden bg-black/20">
        <img 
          src={item.icon || '/placeholder.svg'} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-black/60">
          {item.item_type}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        <p className="text-white/70 text-sm mb-4 flex-1">{item.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Coins size={16} className="text-yellow-500 mr-1" />
              <span className="font-medium">{item.price}</span>
            </div>
            {!canAfford && !owned && (
              <div className="text-xs text-red-400">
                Need {item.price - coins} more coins
              </div>
            )}
          </div>
          
          <button
            onClick={onClick}
            disabled={!canAfford || owned}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${getButtonColor()}`}
          >
            {owned ? (
              <>
                <PackageOpen size={16} />
                <span>Owned</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>{canAfford ? 'Purchase' : 'Cannot Afford'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreItemCard;
