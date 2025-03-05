
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { getIconComponent } from '@/lib/iconUtils';
import { toast } from '@/components/ui/use-toast';
import { ShoppingBag, Info, ArrowUp } from 'lucide-react';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import InfoTooltip from '@/components/ui/InfoTooltip';

type StoreItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  item_type: string;
};

const StoreItemCard = ({ 
  item, 
  onSelect, 
  owned,
  character 
}: { 
  item: StoreItem; 
  onSelect: (item: StoreItem) => void; 
  owned: boolean;
  character: 'goku' | 'saitama' | 'jin-woo' | null;
}) => {
  const icon = getIconComponent(item.icon, 24);
  
  return (
    <div 
      className={`p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 
      transition-all duration-300 cursor-pointer hover:scale-[1.02] group 
      ${owned ? 'bg-gradient-to-br from-white/10 to-transparent' : ''}`}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-3 ${
          character ? `bg-${character}-primary/20` : 'bg-primary/20'
        }`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-white group-hover:text-white/90">{item.name}</h3>
          <p className="text-sm text-white/60 mt-1 line-clamp-2">{item.description}</p>
          
          <div className="flex justify-between items-center mt-3">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full 
              ${character ? `bg-${character}-primary/20 text-${character}-primary` : 'bg-primary/20 text-primary'}`}
            >
              <ShoppingBag size={14} />
              <span>{item.price}</span>
            </div>
            
            {owned && (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                Owned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreFilters = ({ 
  selectedType, 
  setSelectedType,
  character 
}: { 
  selectedType: string;
  setSelectedType: React.Dispatch<React.SetStateAction<string>>;
  character: 'goku' | 'saitama' | 'jin-woo' | null;
}) => {
  const types = [
    { id: 'all', label: 'All Items' },
    { id: 'badge', label: 'Badges' },
    { id: 'power', label: 'Powers' },
    { id: 'cosmetic', label: 'Cosmetics' }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {types.map(type => (
        <button
          key={type.id}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedType === type.id
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
          onClick={() => setSelectedType(type.id)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 
        transition-all duration-300 shadow-lg z-10 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
    >
      <ArrowUp size={20} />
    </button>
  );
};

const StorePage = () => {
  const { character, coins, useCoins } = useUser();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchOwnedItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedItems = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', authData.user.id);
        
      if (error) throw error;
      
      const ownedIds = data.map(item => item.item_id);
      setOwnedItems(ownedIds);
    } catch (error) {
      console.error('Error fetching owned items:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    try {
      // Check if already owned
      if (ownedItems.includes(selectedItem.id)) {
        toast({
          title: 'Already Owned',
          description: 'You already own this item',
        });
        return;
      }
      
      // Check if enough coins
      if (coins < selectedItem.price) {
        toast({
          title: 'Not Enough Coins',
          description: `You need ${selectedItem.price - coins} more coins to purchase this item`,
          variant: 'destructive',
        });
        return;
      }
      
      // Use coins and add to inventory
      const success = await useCoins(selectedItem.price);
      
      if (success) {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;
        
        const { error } = await supabase
          .from('user_items')
          .insert([
            { 
              user_id: authData.user.id,
              item_id: selectedItem.id
            }
          ]);
          
        if (error) throw error;
        
        // Update local state
        setOwnedItems([...ownedItems, selectedItem.id]);
        
        toast({
          title: 'Purchase Successful',
          description: `You have successfully purchased ${selectedItem.name}!`,
        });
        
        setShowDetail(false);
      }
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase Failed',
        description: 'There was an error completing your purchase',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesType = selectedType === 'all' || item.item_type === selectedType;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleSelectItem = (item: StoreItem) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ScrollToTopButton />
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Store
            <InfoTooltip 
              content="Purchase items using the coins you earn from workouts. Collect badges, power-ups, and cosmetic enhancements for your character."
              position="right"
            />
          </h1>
          
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            character ? `bg-${character}-primary/20` : 'bg-primary/20'
          }`}>
            <ShoppingBag size={18} />
            <span className="font-medium">{coins} coins</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <StoreFilters 
            selectedType={selectedType} 
            setSelectedType={setSelectedType} 
            character={character}
          />
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-colors"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <AnimatedCard className="mx-auto max-w-md p-6">
            <Info size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No Items Found</h3>
            <p className="text-white/60 mb-4">
              {searchQuery 
                ? `No items matching "${searchQuery}" in the ${selectedType === 'all' ? 'store' : selectedType + ' category'}.` 
                : `No items available in the ${selectedType === 'all' ? 'store' : selectedType + ' category'} right now.`}
            </p>
            <AnimatedButton 
              character={character}
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
            >
              Clear Filters
            </AnimatedButton>
          </AnimatedCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <StoreItemCard 
              key={item.id} 
              item={item}
              onSelect={handleSelectItem}
              owned={ownedItems.includes(item.id)}
              character={character}
            />
          ))}
        </div>
      )}
      
      {showDetail && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={handleCloseDetail}
          onPurchase={handlePurchase}
          isOwned={ownedItems.includes(selectedItem.id)}
          character={character}
        />
      )}
    </div>
  );
};

export default StorePage;
