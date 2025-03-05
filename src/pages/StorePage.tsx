
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { ShoppingBag, Info, Tag, Search, Sparkles, Heart, Flame, Star, Award, Shield, Book, Dumbbell, Filter, EyeOff, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getIconComponent } from '@/lib/iconUtils';
import ItemDetailModal from '@/components/modals/ItemDetailModal';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  item_type: string;
}

const StorePage = () => {
  const { character, coins, useCoins } = useUser();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userItems, setUserItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPurchased, setShowPurchased] = useState(true);
  
  useEffect(() => {
    fetchStoreItems();
    fetchUserItems();
  }, []);
  
  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      setStoreItems(data || []);
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
  
  const fetchUserItems = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      const { data, error } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', user.user.id);
        
      if (error) throw error;
      
      // Extract item IDs into array
      const itemIds = data?.map(item => item.item_id) || [];
      setUserItems(itemIds);
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };
  
  const handlePurchase = async (item: StoreItem) => {
    try {
      // First check if user has enough coins
      if (coins < item.price) {
        toast({
          title: 'Not enough coins',
          description: `You need ${item.price - coins} more coins to purchase this item.`,
          variant: 'destructive',
        });
        return;
      }
      
      // Try to use coins from the user's balance
      const success = await useCoins(item.price);
      
      if (!success) {
        toast({
          title: 'Purchase failed',
          description: 'Unable to process the purchase. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Get the user ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: 'Authentication error',
          description: 'You must be logged in to make purchases.',
          variant: 'destructive',
        });
        return;
      }
      
      // Record the purchase in the database
      const { error } = await supabase
        .from('user_items')
        .insert({
          user_id: userData.user.id,
          item_id: item.id
        });
        
      if (error) throw error;
      
      // Update the local list of user items
      setUserItems([...userItems, item.id]);
      
      toast({
        title: 'Purchase successful!',
        description: `You've purchased ${item.name}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase failed',
        description: 'An error occurred while purchasing the item.',
        variant: 'destructive',
      });
    }
  };
  
  const getItemTypeLabel = (type: string) => {
    switch(type) {
      case 'boost': return 'Power Boost';
      case 'recovery': return 'Recovery Item';
      case 'cosmetic': return 'Cosmetic';
      case 'training': return 'Training';
      case 'equipment': return 'Equipment';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'boost': return 'text-yellow-400';
      case 'recovery': return 'text-green-400';
      case 'cosmetic': return 'text-purple-400';
      case 'training': return 'text-blue-400';
      case 'equipment': return 'text-orange-400';
      default: return 'text-white';
    }
  };
  
  const filteredItems = storeItems.filter(item => {
    // Apply type filter
    if (filter && item.item_type !== filter) return false;
    
    // Apply search query filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Apply purchased filter
    if (!showPurchased && userItems.includes(item.id)) return false;
    
    return true;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store</h1>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
            <ShoppingBag size={18} className="text-yellow-400" />
            <span className="font-medium">{coins}</span>
            <span className="text-white/60">coins</span>
          </div>
          <div 
            className="p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10"
            onClick={() => setShowPurchased(!showPurchased)}
            title={showPurchased ? "Hide purchased items" : "Show purchased items"}
          >
            {showPurchased ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 text-white/60" size={18} />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:justify-end">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === null ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Filter size={14} className="inline mr-1" /> All
          </button>
          <button
            onClick={() => setFilter('boost')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === 'boost' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Sparkles size={14} className="inline mr-1" /> Boost
          </button>
          <button
            onClick={() => setFilter('recovery')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === 'recovery' ? 'bg-green-400/20 text-green-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Heart size={14} className="inline mr-1" /> Recovery
          </button>
          <button
            onClick={() => setFilter('cosmetic')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === 'cosmetic' ? 'bg-purple-400/20 text-purple-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Sparkles size={14} className="inline mr-1" /> Cosmetic
          </button>
          <button
            onClick={() => setFilter('training')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === 'training' ? 'bg-blue-400/20 text-blue-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Book size={14} className="inline mr-1" /> Training
          </button>
          <button
            onClick={() => setFilter('equipment')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              filter === 'equipment' ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Dumbbell size={14} className="inline mr-1" /> Equipment
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-white/60">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg">No items found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <AnimatedCard 
              key={item.id} 
              className="p-4 cursor-pointer hover:border-white/30 transition-colors relative overflow-hidden"
              onClick={() => setSelectedItem(item)}
            >
              {userItems.includes(item.id) && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Owned
                </div>
              )}
              
              <div className="flex items-center justify-center h-16 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  character ? `bg-${character}-primary/20` : 'bg-primary/20'
                }`}>
                  {getIconComponent(item.icon, 24)}
                </div>
              </div>
              
              <h3 className="text-center font-bold mb-2">{item.name}</h3>
              
              <p className="text-sm text-white/70 text-center mb-3 line-clamp-2 h-10">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${getTypeColor(item.item_type)}`}>
                  <Tag size={10} />
                  <span>{getItemTypeLabel(item.item_type)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-yellow-400">
                  <span className="font-bold">{item.price}</span>
                  <ShoppingBag size={12} />
                </div>
              </div>
              
              {userItems.includes(item.id) ? (
                <button
                  className="w-full py-1.5 rounded-lg bg-green-500/20 text-green-400 cursor-default"
                >
                  Purchased
                </button>
              ) : (
                <AnimatedButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(item);
                  }}
                  character={character || undefined}
                  className="w-full py-1.5"
                  disabled={coins < item.price}
                >
                  {coins < item.price 
                    ? `Need ${item.price - coins} more coins` 
                    : `Purchase - ${item.price} coins`}
                </AnimatedButton>
              )}
            </AnimatedCard>
          ))}
        </div>
      )}
      
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={handlePurchase}
          isOwned={userItems.includes(selectedItem.id)}
          character={character || undefined}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-10">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-lg hover:scale-110 transform duration-150"
          aria-label="Scroll to top"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default StorePage;
