
import React from 'react';
import { ShoppingBag, Award, Zap, Heart, Shield, Flame, Gift, Eye, BarChart2, Clock, Dumbbell, Star } from 'lucide-react';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { toast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Extended store item data with icons and categories
const STORE_ITEMS = [
  {
    id: 1,
    name: "Energy Booster",
    description: "Gain 50% more points for your next workout",
    price: 10,
    icon: <Zap className="text-yellow-500" />,
    category: "boosts"
  },
  {
    id: 2,
    name: "Power Charm",
    description: "Increases your character's power for 24 hours",
    price: 15,
    icon: <Flame className="text-red-500" />,
    category: "boosts"
  },
  {
    id: 3,
    name: "Health Potion",
    description: "Recover faster after intense workouts",
    price: 8,
    icon: <Heart className="text-pink-500" />,
    category: "recovery"
  },
  {
    id: 4,
    name: "Warrior Shield",
    description: "Protect your streak if you miss a day",
    price: 20,
    icon: <Shield className="text-blue-500" />,
    category: "protection"
  },
  {
    id: 5,
    name: "Mystery Box",
    description: "Contains a random reward or special item",
    price: 25,
    icon: <Gift className="text-purple-500" />,
    category: "special"
  },
  {
    id: 6,
    name: "Workout Vision",
    description: "See optimal workout plans for your character",
    price: 12,
    icon: <Eye className="text-cyan-500" />,
    category: "insights"
  },
  {
    id: 7,
    name: "Progress Tracker",
    description: "Enhanced stats and progress visualization",
    price: 18,
    icon: <BarChart2 className="text-green-500" />,
    category: "insights"
  },
  {
    id: 8,
    name: "Time Extender",
    description: "Add extra time to limited-time challenges",
    price: 15,
    icon: <Clock className="text-orange-500" />,
    category: "protection"
  },
  {
    id: 9,
    name: "Super Training Kit",
    description: "Unlock advanced training routines for your character",
    price: 30,
    icon: <Dumbbell className="text-indigo-500" />,
    category: "training"
  },
  {
    id: 10,
    name: "Champion's Badge",
    description: "Show off your dedication with this exclusive badge",
    price: 50,
    icon: <Award className="text-amber-500" />,
    category: "cosmetic"
  },
  {
    id: 11,
    name: "Legendary Status",
    description: "Add a special aura to your profile for one week",
    price: 75,
    icon: <Star className="text-yellow-400" />,
    category: "cosmetic"
  },
  {
    id: 12,
    name: "Merchant's Bag",
    description: "Store more items in your inventory",
    price: 40,
    icon: <ShoppingBag className="text-emerald-500" />,
    category: "utility"
  }
];

interface StoreItemsProps {
  filter: string;
  searchTerm: string;
  character?: 'goku' | 'saitama' | 'jin-woo' | null;
}

const StoreItems = ({ filter, searchTerm, character }: StoreItemsProps) => {
  const { coins, useCoins } = useUser();

  // Filter items based on category and search term
  const filteredItems = STORE_ITEMS.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePurchase = async (item: typeof STORE_ITEMS[0]) => {
    if (coins < item.price) {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price - coins} more coins to purchase this item`,
        variant: "destructive",
      });
      return;
    }

    // Use the coins
    const success = await useCoins(item.price);
    
    if (success) {
      // Record the purchase in the database
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        try {
          const { error } = await supabase
            .from('user_items')
            .insert({
              user_id: authData.user.id,
              item_id: item.id.toString()
            });
            
          if (error) {
            console.error("Error recording purchase:", error);
            toast({
              title: "Purchase Error",
              description: "There was an error recording your purchase",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error("Error in handlePurchase:", error);
        }
      }
      
      toast({
        title: "Item Purchased!",
        description: `You've successfully purchased ${item.name}`,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-bold">{item.name}</h3>
            </div>
            
            <p className="text-sm text-white/70 mb-4 flex-grow">{item.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-1">
                  <span className="text-yellow-400 text-xs">₵</span>
                </div>
                <span className="font-semibold">{item.price}</span>
              </div>
              
              <AnimatedButton
                onClick={() => handlePurchase(item)}
                character={character}
                disabled={coins < item.price}
                size="sm"
              >
                {coins < item.price ? 'Not Enough Coins' : 'Purchase'}
              </AnimatedButton>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-white/60">No items match your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default StoreItems;
