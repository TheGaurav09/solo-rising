
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { ShoppingBag, Coins, Award, Filter, Package, Gift, Crown, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import Footer from '@/components/ui/Footer';

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
  const { character, coins, useCoins, addPoints } = useUser();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [userItems, setUserItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch store items
      const { data: storeItems, error: storeError } = await supabase
        .from('store_items')
        .select('*');

      if (storeError) throw storeError;

      // If no items in the store yet, let's create sample items
      if (!storeItems || storeItems.length === 0) {
        const sampleItems: Partial<StoreItem>[] = [
          {
            name: 'Power Boost',
            description: 'Get a 50% boost on your next workout points',
            icon: 'zap',
            price: 100,
            item_type: 'boost'
          },
          {
            name: 'Legendary Badge',
            description: 'Show off your dedication with this rare badge',
            icon: 'award',
            price: 500,
            item_type: 'badge'
          },
          {
            name: 'Custom Avatar',
            description: 'Unlock a custom avatar for your profile',
            icon: 'user',
            price: 300,
            item_type: 'avatar'
          },
          {
            name: 'Premium Theme',
            description: 'Change the app theme to an exclusive premium design',
            icon: 'paintbrush',
            price: 250,
            item_type: 'theme'
          },
          {
            name: 'Streak Shield',
            description: 'Protect your streak for 1 day if you miss a workout',
            icon: 'shield',
            price: 150,
            item_type: 'shield'
          },
          {
            name: 'Points Bundle',
            description: 'Instantly get 200 workout points',
            icon: 'package',
            price: 400,
            item_type: 'points'
          },
          {
            name: 'Golden Title',
            description: 'Add a golden frame to your name on the leaderboard',
            icon: 'crown',
            price: 600,
            item_type: 'title'
          },
          {
            name: 'Mystery Box',
            description: 'Get a random reward worth between 100-1000 coins',
            icon: 'gift',
            price: 200,
            item_type: 'mystery'
          }
        ];
        
        // Insert sample items
        for (const item of sampleItems) {
          await supabase.from('store_items').insert(item);
        }
        
        // Refetch after inserting samples
        const { data: newItems } = await supabase.from('store_items').select('*');
        setItems(newItems || []);
      } else {
        setItems(storeItems);
      }

      // Fetch user's purchased items
      const { data: purchasedItems, error: purchasedError } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', user.user.id);

      if (purchasedError) throw purchasedError;

      setUserItems(purchasedItems?.map(item => item.item_id) || []);
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

  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      // Check if user has enough coins
      if (!await useCoins(selectedItem.price)) {
        toast({
          title: 'Purchase Failed',
          description: 'Not enough coins',
          variant: 'destructive',
        });
        return;
      }
      
      // Add item to user's inventory
      const { error } = await supabase
        .from('user_items')
        .insert({
          user_id: user.user.id,
          item_id: selectedItem.id,
        });
        
      if (error) throw error;
      
      // Special handling for points bundle
      if (selectedItem.item_type === 'points') {
        addPoints(200);
      }
      
      // Special handling for mystery box
      if (selectedItem.item_type === 'mystery') {
        const randomPoints = Math.floor(Math.random() * 900) + 100;
        addPoints(randomPoints);
        toast({
          title: 'Mystery Box Opened!',
          description: `You received ${randomPoints} points!`,
        });
      }
      
      toast({
        title: 'Purchase Successful',
        description: `You have purchased ${selectedItem.name}`,
      });
      
      // Refresh user items
      setUserItems([...userItems, selectedItem.id]);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase Failed',
        description: 'There was an error processing your purchase',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = filter ? items.filter(item => item.item_type === filter) : items;

  const getItemIcon = (itemType: string) => {
    switch(itemType) {
      case 'boost': return <Star className="text-yellow-500" />;
      case 'badge': return <Award className="text-blue-400" />;
      case 'points': return <Package className="text-green-400" />;
      case 'mystery': return <Gift className="text-purple-400" />;
      case 'title': return <Crown className="text-yellow-400" />;
      default: return <Award className="text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Store</h1>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
          <Coins className="text-yellow-500" size={20} />
          <span className="font-bold">{coins}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <AnimatedCard className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-white/60" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-[80%] flex-nowrap">
              <button
                onClick={() => setFilter(null)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === null 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilter('boost')}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === 'boost' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Boosts
              </button>
              <button
                onClick={() => setFilter('badge')}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === 'badge' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Badges
              </button>
              <button
                onClick={() => setFilter('points')}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === 'points' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setFilter('mystery')}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === 'mystery' 
                    ? character 
                      ? `bg-${character}-primary/20 text-${character}-primary` 
                      : 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Mystery
              </button>
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isPurchased = userItems.includes(item.id);
            
            return (
              <AnimatedCard 
                key={item.id} 
                className={`p-6 transition-transform hover:scale-[1.02] cursor-pointer ${
                  isPurchased ? 'border-2 border-green-500/30' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    {getItemIcon(item.item_type)}
                  </div>
                </div>
                
                <h3 className="font-bold text-center mb-1">{item.name}</h3>
                <p className="text-white/60 text-sm text-center mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex justify-center">
                  {isPurchased ? (
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Purchased
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
                      <Coins size={14} className="text-yellow-500" />
                      <span className="font-bold text-sm">{item.price}</span>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-white/50">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items available in this category</p>
            </div>
          )}
        </div>
      )}
      
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={handlePurchase}
        />
      )}

      <Footer />
    </div>
  );
};

export default StorePage;
