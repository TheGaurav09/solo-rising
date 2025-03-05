
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Coins, Filter, Search } from 'lucide-react';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { getIconComponent } from '@/lib/iconUtils';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  item_type: string;
  image_path?: string;
}

const StorePage = () => {
  const { character } = useUser();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for store items
    const mockItems: StoreItem[] = [
      {
        id: '1',
        name: 'Double Points Boost',
        description: 'Earn double points for 24 hours.',
        icon: 'zap',
        price: 50,
        item_type: 'boost',
      },
      {
        id: '2',
        name: 'Streak Saver',
        description: 'Automatically maintain your streak for one day.',
        icon: 'shield',
        price: 75,
        item_type: 'consumable',
      },
      {
        id: '3',
        name: 'Custom Title',
        description: 'Equip a custom title on your profile.',
        icon: 'tag',
        price: 100,
        item_type: 'cosmetic',
      },
      {
        id: '4',
        name: 'Extra life',
        description: 'Continue workout even if you fail.',
        icon: 'heart',
        price: 120,
        item_type: 'powerup',
      },
      {
        id: '5',
        name: 'XP Multiplier',
        description: 'Get 1.5x XP for your next 3 workouts.',
        icon: 'trending-up',
        price: 90,
        item_type: 'boost',
      },
      {
        id: '6',
        name: 'Profile Background',
        description: 'Unlock a special profile background.',
        icon: 'image',
        price: 150,
        item_type: 'cosmetic',
      },
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  useEffect(() => {
    let result = items;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (activeFilter) {
      result = result.filter(item => item.item_type === activeFilter);
    }
    
    setFilteredItems(result);
  }, [searchTerm, activeFilter, items]);

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

  const filterCategories = [
    { id: 'boost', name: 'Boosts' },
    { id: 'consumable', name: 'Consumables' },
    { id: 'cosmetic', name: 'Cosmetics' },
    { id: 'powerup', name: 'Power Ups' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Store</h2>
      <AnimatedCard>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${
                  activeFilter === null
                    ? character ? `bg-${character}-primary/20 text-${character}-primary border-${character}-primary/40` 
                      : 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                }`}
              >
                <Filter size={14} />
                <span>All</span>
              </button>
              
              {filterCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    activeFilter === category.id
                      ? character ? `bg-${character}-primary/20 text-${character}-primary border-${character}-primary/40` 
                        : 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <StoreItemsList 
            items={filteredItems} 
            onSelect={handleItemSelect} 
            character={character} 
          />
        </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-6 text-white/50">
          <p>No items found</p>
        </div>
      ) : (
        items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex flex-col"
            onClick={() => onSelect(item)}
          >
            <div className="flex-1 flex items-center justify-center py-3">
              <div className={`w-12 h-12 rounded-full ${character ? `bg-${character}-primary/20` : 'bg-white/10'} flex items-center justify-center`}>
                {getIconComponent(item.icon, 24)}
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Coins size={14} className="text-yellow-500" />
                <span className="font-bold text-sm">{item.price}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StorePage;
