import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Coins } from 'lucide-react';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import AnimatedCard from '@/components/ui/AnimatedCard';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  item_type: string;
  image_path?: string;
}

const ItemIcon = ({ icon, size, character }: { icon: string; size: number; character: string | null }) => {
  switch (icon) {
    case 'award':
      return <AwardIcon size={size} character={character} />;
    default:
      return <div className="text-white">Unknown Icon</div>;
  }
};

const AwardIcon = ({ size, character }: { size: number; character: string | null }) => {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={character ? `var(--${character}-primary)` : "var(--yellow-500)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
};

const StorePage = () => {
  const { character } = useUser();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mock data for store items
    const mockItems: StoreItem[] = [
      {
        id: '1',
        name: 'Double Points Boost',
        description: 'Earn double points for 24 hours.',
        icon: 'award',
        price: 50,
        item_type: 'boost',
      },
      {
        id: '2',
        name: 'Streak Saver',
        description: 'Automatically maintain your streak for one day.',
        icon: 'award',
        price: 75,
        item_type: 'consumable',
      },
      {
        id: '3',
        name: 'Custom Title',
        description: 'Equip a custom title on your profile.',
        icon: 'award',
        price: 100,
        item_type: 'cosmetic',
      },
      {
        id: '4',
        name: 'Extra life',
        description: 'Continue workout even if you fail.',
        icon: 'award',
        price: 120,
        item_type: 'powerup',
      },
    ];
    setItems(mockItems);
  }, []);

  const handleItemSelect = (item: StoreItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handlePurchase = () => {
    // Implement purchase logic here
    console.log('Purchasing item:', selectedItem);
    handleCloseModal();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Store</h2>
      <AnimatedCard>
        <StoreItemsList items={items} onSelect={handleItemSelect} character={character} />
      </AnimatedCard>

      {isModalOpen && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
          character={character}
        />
      )}
    </div>
  );
};

const StoreItemsList = ({ items, onSelect, character }: { items: StoreItem[]; onSelect: (item: StoreItem) => void; character: string | null }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="aspect-square bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex flex-col"
          onClick={() => onSelect(item)}
        >
          <div className="flex-1 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full ${character ? `bg-${character}-primary/20` : 'bg-white/10'} flex items-center justify-center`}>
              <ItemIcon icon={item.icon} size={32} character={character} />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="font-medium">{item.name}</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Coins size={16} className="text-yellow-500" />
              <span className="font-bold">{item.price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorePage;
