
import React from 'react';
import { Coins, ShoppingCart, PackageOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface StoreItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  category: string;
  onPurchase: (itemId: string) => void;
  owned?: boolean;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({
  id,
  name,
  description,
  price,
  imageSrc,
  category,
  onPurchase,
  owned = false
}) => {
  const { character, coins } = useUser();
  const canAfford = coins >= price;
  
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
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover-border animated-border h-full flex flex-col">
      <div className="relative h-40 overflow-hidden bg-black/20">
        <img 
          src={imageSrc || '/placeholder.svg'} 
          alt={name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-black/60">
          {category}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-white/70 text-sm mb-4 flex-1">{description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Coins size={16} className="text-yellow-500 mr-1" />
              <span className="font-medium">{price}</span>
            </div>
            {!canAfford && !owned && (
              <div className="text-xs text-red-400">
                Need {price - coins} more coins
              </div>
            )}
          </div>
          
          <button
            onClick={() => onPurchase(id)}
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
