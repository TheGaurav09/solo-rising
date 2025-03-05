
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { ShoppingBag, Info, Sparkles, Medal, Dumbbell } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getIconComponent } from '@/lib/iconUtils';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import InfoTooltip from '@/components/ui/InfoTooltip';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  item_type: string;
}

const StorePage = () => {
  const { coins, useCoins, character } = useUser();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreItems();
    fetchPurchasedItems();
  }, []);

  const fetchStoreItems = async () => {
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

  const fetchPurchasedItems = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', authData.user.id);

      if (error) throw error;
      
      // Extract just the item_ids into an array
      const itemIds = data.map(item => item.item_id);
      setPurchasedItems(itemIds);
    } catch (error) {
      console.error('Error fetching purchased items:', error);
    }
  };

  const purchaseItem = async (item: StoreItem) => {
    try {
      // First check if user already purchased this item
      if (purchasedItems.includes(item.id)) {
        toast({
          title: 'Already Purchased',
          description: 'You already own this item',
        });
        return;
      }

      // Check if user has enough coins
      if (coins < item.price) {
        toast({
          title: 'Not Enough Coins',
          description: 'You don\'t have enough coins to purchase this item',
          variant: 'destructive',
        });
        return;
      }

      // Use UserContext to spend coins
      const success = await useCoins(item.price);
      
      if (!success) {
        toast({
          title: 'Purchase Failed',
          description: 'Failed to purchase the item',
          variant: 'destructive',
        });
        return;
      }

      // Record the purchase in the database
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to purchase items',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('user_items')
        .insert({
          user_id: authData.user.id,
          item_id: item.id
        });

      if (error) throw error;

      // Update the local state
      setPurchasedItems([...purchasedItems, item.id]);
      
      toast({
        title: 'Purchase Successful',
        description: `You have purchased ${item.name}`,
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase Failed',
        description: 'An error occurred while purchasing the item',
        variant: 'destructive',
      });
    }
  };

  const handleOpenModal = (item: StoreItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const renderItemIcon = (item: StoreItem) => {
    switch (item.item_type) {
      case 'badge':
        return <Medal size={24} className="text-yellow-500" />;
      case 'equipment':
        return <Dumbbell size={24} className="text-blue-500" />;
      case 'power':
        return <Sparkles size={24} className="text-purple-500" />;
      default:
        return getIconComponent(item.icon, 24);
    }
  };

  const getItemTypeFilterButtons = () => {
    const itemTypes = Array.from(new Set(items.map(item => item.item_type)));
    
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            itemTypeFilter === null 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setItemTypeFilter(null)}
        >
          All Items
        </button>
        
        {itemTypes.map(type => (
          <button
            key={type}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              itemTypeFilter === type 
                ? character 
                  ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                  : 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-white/10 hover:bg-white/20 border border-white/10'
            }`}
            onClick={() => setItemTypeFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>
    );
  };

  const filteredItems = itemTypeFilter 
    ? items.filter(item => item.item_type === itemTypeFilter)
    : items;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="text-white/80" />
          Store
          <InfoTooltip 
            content="Purchase items with coins you earn from workouts to customize your profile and unlock special features."
            position="right"
          />
        </h1>
        
        <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 flex items-center gap-2">
          <span className="text-yellow-400">💰</span>
          <span className="font-medium">{coins}</span>
          <span className="text-sm text-white/60">coins</span>
        </div>
      </div>

      {getItemTypeFilterButtons()}
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto mb-4 text-white/30" />
          <p className="text-white/60">No items available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <AnimatedCard key={item.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {renderItemIcon(item)}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-xs text-white/60 capitalize">{item.item_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-sm">
                    <span className="text-yellow-400">💰</span>
                    <span>{item.price}</span>
                  </div>
                </div>
                
                <p className="text-sm text-white/80 mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex justify-between">
                  <button 
                    className="text-sm text-white/60 hover:text-white"
                    onClick={() => handleOpenModal(item)}
                  >
                    View Details
                  </button>
                  
                  {purchasedItems.includes(item.id) ? (
                    <div className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      Owned
                    </div>
                  ) : (
                    <AnimatedButton
                      character={character}
                      disabled={coins < item.price}
                      className="text-sm px-3 py-1"
                      onClick={() => purchaseItem(item)}
                    >
                      Purchase
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
      
      {showModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={closeModal}
          onPurchase={purchasedItems.includes(selectedItem.id) 
            ? undefined 
            : () => purchaseItem(selectedItem)
          }
          isOwned={purchasedItems.includes(selectedItem.id)}
          character={character || undefined}
        />
      )}
    </div>
  );
};

export default StorePage;
