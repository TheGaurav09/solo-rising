
import React from 'react';
import { Coins } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface CoinDisplayProps {
  className?: string;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ className = '' }) => {
  const { coins, character } = useUser();
  
  const getBgColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary border-goku-primary/40';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary border-saitama-primary/40';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary border-jin-woo-primary/40';
      default: return 'bg-primary/20 text-primary border-primary/40';
    }
  };
  
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getBgColor()} border ${className}`}>
      <Coins size={18} className="text-yellow-500" />
      <span className="font-bold">{coins}</span>
      <span className="text-sm opacity-70">coins</span>
    </div>
  );
};

export default CoinDisplay;
