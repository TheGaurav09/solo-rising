
import React, { useState, useEffect } from 'react';
import { Award, Dumbbell, Zap, Gift, ShoppingBag, Shield, Flame, Clock, Target, Sparkles, BookOpen, Sword, Crown, Repeat, User } from 'lucide-react';
import { Button } from './ui/button';
import ItemDetailModal from './modals/ItemDetailModal';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: string;
  effect_value: number;
  image_path?: string;
}

const StoreItems = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [userItems, setUserItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { coins, useCoins } = useUser();

  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('store_items')
          .select('*')
          .order('price', { ascending: true });
        
        if (storeError) {
          console.error('Error fetching store items:', storeError);
          toast({
            title: 'Error',
            description: 'Failed to load store items',
            variant: 'destructive',
          });
          return;
        }
        
        // Get user's purchased items
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user data:', userError);
          setIsLoading(false);
          return;
        }
        
        if (userData.user) {
          const { data: userItemsData, error: userItemsError } = await supabase
            .from('user_items')
            .select('item_id')
            .eq('user_id', userData.user.id);
          
          if (userItemsError) {
            console.error('Error fetching user items:', userItemsError);
          } else if (userItemsData) {
            setUserItems(userItemsData.map((item) => item.item_id));
          }
        }
        
        if (storeData) {
          setItems(storeData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchStoreItems:', error);
        setIsLoading(false);
      }
    };
    
    fetchStoreItems();
  }, []);

  const handlePurchase = async (item: StoreItem) => {
    try {
      // Check if user already has this item
      if (userItems.includes(item.id)) {
        toast({
          title: 'Already Owned',
          description: 'You already own this item',
        });
        return;
      }
      
      // Check if user has enough coins
      if (coins < item.price) {
        toast({
          title: 'Not Enough Coins',
          description: 'You do not have enough coins to purchase this item',
          variant: 'destructive',
        });
        return;
      }
      
      // Use coins (this updates the user's coin balance)
      const success = await useCoins(item.price);
      
      if (!success) {
        toast({
          title: 'Purchase Failed',
          description: 'Failed to complete purchase. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Add item to user's inventory
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: 'Purchase Failed',
          description: 'Failed to complete purchase. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error: purchaseError } = await supabase
        .from('user_items')
        .insert({
          user_id: userData.user.id,
          item_id: item.id
        });
      
      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError);
        toast({
          title: 'Purchase Error',
          description: 'Your account was charged but there was an error recording your purchase.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state
      setUserItems([...userItems, item.id]);
      
      toast({
        title: 'Purchase Successful',
        description: `You have purchased ${item.name}!`,
      });
      
      // Close modal if open
      setSelectedItem(null);
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      toast({
        title: 'Purchase Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderIcon = (iconName: string, size = 24) => {
    const icons: Record<string, React.ReactNode> = {
      dumbbell: <Dumbbell size={size} />,
      award: <Award size={size} />,
      zap: <Zap size={size} />,
      gift: <Gift size={size} />,
      bag: <ShoppingBag size={size} />,
      shield: <Shield size={size} />,
      flame: <Flame size={size} />,
      clock: <Clock size={size} />,
      target: <Target size={size} />,
      sparkles: <Sparkles size={size} />,
      book: <BookOpen size={size} />,
      sword: <Sword size={size} />,
      crown: <Crown size={size} />,
      repeat: <Repeat size={size} />,
      user: <User size={size} />,
    };
    
    return icons[iconName] || <Gift size={size} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const itemsByCategory: Record<string, StoreItem[]> = items.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, StoreItem[]>);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="w-full">
            <h2 className="text-lg font-bold mb-4 capitalize">{category} Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer animated-border"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 rounded-full p-2 bg-white/10">
                      {renderIcon(item.icon)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-white/60 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm font-semibold flex items-center space-x-1">
                      <Sparkles size={16} className="text-yellow-400" />
                      <span>{item.price} coins</span>
                    </div>
                    <Button
                      size="sm"
                      variant={userItems.includes(item.id) ? "outline" : "secondary"}
                      disabled={userItems.includes(item.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(item);
                      }}
                    >
                      {userItems.includes(item.id) ? 'Owned' : 'Buy'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={() => handlePurchase(selectedItem)}
          isOwned={userItems.includes(selectedItem.id)}
          renderIcon={renderIcon}
        />
      )}
    </div>
  );
};

export default StoreItems;
