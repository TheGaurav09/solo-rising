import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';
import { Coins, ShoppingCart, Search, Tag, Filter } from 'lucide-react';
import ItemDetailModal from './modals/ItemDetailModal';
import AnimatedCard from './ui/AnimatedCard';
import { getIconComponent } from '@/lib/iconUtils';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  item_type: string;
  type?: string;
  effect_value?: number;
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
    const mockItems: StoreItem[] = [
      {
        id: '1',
        name: 'Double Points Boost',
        description: 'Earn double points for 24 hours.',
        icon: 'zap',
        price: 50,
        item_type: 'boost',
        image_path: '/images/store/double-points.png'
      },
      {
        id: '2',
        name: 'Streak Saver',
        description: 'Automatically maintain your streak for one day.',
        icon: 'shield',
        price: 75,
        item_type: 'consumable',
        image_path: '/images/store/streak-saver.png'
      },
      {
        id: '3',
        name: 'Custom Title',
        description: 'Equip a custom title on your profile.',
        icon: 'tag',
        price: 100,
        item_type: 'cosmetic',
        image_path: '/images/store/custom-title.png'
      },
      {
        id: '4',
        name: 'Extra Life',
        description: 'Continue workout even if you fail.',
        icon: 'heart',
        price: 120,
        item_type: 'powerup',
        image_path: '/images/store/extra-life.png'
      },
      {
        id: '5',
        name: 'XP Multiplier',
        description: 'Get 1.5x XP for your next 3 workouts.',
        icon: 'trending-up',
        price: 90,
        item_type: 'boost',
        image_path: '/images/store/xp-multiplier.png'
      },
      {
        id: '6',
        name: 'Profile Background',
        description: 'Unlock a special profile background.',
        icon: 'image',
        price: 150,
        item_type: 'cosmetic',
        image_path: '/images/store/profile-bg.png'
      },
      {
        id: '7',
        name: 'Energy Drink',
        description: 'Instantly recover energy and continue your workout.',
        icon: 'battery-charging',
        price: 60,
        item_type: 'consumable',
        image_path: '/images/store/energy-drink.png'
      },
      {
        id: '8',
        name: 'Workout Skip',
        description: 'Skip a workout while still earning points and maintaining streak.',
        icon: 'skip-forward',
        price: 200,
        item_type: 'powerup',
        image_path: '/images/store/workout-skip.png'
      },
      {
        id: '9',
        name: 'Power Gloves',
        description: 'Increase strength for your next workout by 20%.',
        icon: 'clipboard-list',
        price: 80,
        item_type: 'boost',
        image_path: '/images/store/power-gloves.png'
      },
      {
        id: '10',
        name: 'Animated Avatar',
        description: 'Add special animation effects to your profile avatar.',
        icon: 'user',
        price: 180,
        item_type: 'cosmetic',
        image_path: '/images/store/animated-avatar.png'
      },
      {
        id: '11',
        name: 'Mystery Box',
        description: 'Contains a random item or bonus.',
        icon: 'box',
        price: 100,
        item_type: 'consumable',
        image_path: '/images/store/mystery-box.png'
      },
      {
        id: '12',
        name: 'Special Badge',
        description: 'Exclusive badge to show off on your profile.',
        icon: 'award',
        price: 250,
        item_type: 'cosmetic',
        image_path: '/images/store/special-badge.png'
      },
      {
        id: '13',
        name: 'Super Protein',
        description: 'Gives a 15% bonus to all points earned for 2 days.',
        icon: 'activity',
        price: 120,
        item_type: 'boost',
        image_path: '/images/store/super-protein.png'
      },
      {
        id: '14',
        name: 'Task Automator',
        description: 'Automatically complete daily tasks for one day.',
        icon: 'cpu',
        price: 170,
        item_type: 'powerup',
        image_path: '/images/store/task-automator.png'
      },
      {
        id: '15',
        name: 'Training Program',
        description: 'Unlock a specialized training program for optimal results.',
        icon: 'calendar',
        price: 300,
        item_type: 'powerup',
        image_path: '/images/store/training-program.png'
      },
      {
        id: '16',
        name: 'Friend Boost',
        description: 'Increase points earned when working out with friends.',
        icon: 'users',
        price: 110,
        item_type: 'boost',
        image_path: '/images/store/friend-boost.png'
      },
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  useEffect(() => {
    let result = items;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
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
          owned={isItemPurchased(selectedItem.id)}
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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-6 text-white/50">
          <p>No items found</p>
        </div>
      ) : (
        items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/5 rounded-lg p-2 border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex flex-col"
            onClick={() => onSelect(item)}
          >
            <div className="flex-1 flex items-center justify-center py-2">
              <div className={`w-10 h-10 rounded-full ${character ? `bg-${character}-primary/20` : 'bg-white/10'} flex items-center justify-center`}>
                {getIconComponent(item.icon, 20)}
              </div>
            </div>
            
            <div className="mt-1 text-center">
              <h3 className="font-medium text-xs truncate px-1">{item.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Coins size={12} className="text-yellow-500" />
                <span className="font-bold text-xs">{item.price}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StorePage;
