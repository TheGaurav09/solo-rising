
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Award, ShoppingBag, Coin, Lock, Check, Star, Shield, Zap, Sparkles, Diamond } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AchievementsPage = () => {
  const { character, points } = useUser();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      // Fetch user's points/coins
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', currentUser.user.id)
        .single();

      if (userError) throw userError;
      setCoins(userData?.points || 0);

      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      // Fetch user's unlocked achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', currentUser.user.id);

      if (userAchievementsError) throw userAchievementsError;
      setUserAchievements(userAchievementsData || []);

      // Fetch store items
      const { data: storeItemsData, error: storeItemsError } = await supabase
        .from('store_items')
        .select('*')
        .order('price', { ascending: true });

      if (storeItemsError) throw storeItemsError;
      setStoreItems(storeItemsData || []);

      // Fetch user's purchased items
      const { data: userItemsData, error: userItemsError } = await supabase
        .from('user_items')
        .select('*')
        .eq('user_id', currentUser.user.id);

      if (userItemsError) throw userItemsError;
      setUserItems(userItemsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements and store data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const isItemPurchased = (itemId: string) => {
    return userItems.some(ui => ui.item_id === itemId);
  };

  const handlePurchaseItem = async (item: any) => {
    if (isItemPurchased(item.id)) {
      toast({
        title: 'Already Purchased',
        description: 'You already own this item',
      });
      return;
    }

    if (coins < item.price) {
      toast({
        title: 'Not Enough Coins',
        description: `You need ${item.price - coins} more coins to purchase this item`,
        variant: 'destructive',
      });
      return;
    }

    setPurchaseLoading(item.id);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('User not authenticated');

      // Add item to user's inventory
      const { error: purchaseError } = await supabase
        .from('user_items')
        .insert([
          {
            user_id: currentUser.user.id,
            item_id: item.id
          }
        ]);

      if (purchaseError) throw purchaseError;

      // Update user's coins
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: coins - item.price })
        .eq('id', currentUser.user.id);

      if (updateError) throw updateError;

      // Update local state
      setCoins(coins - item.price);
      setUserItems([...userItems, { user_id: currentUser.user.id, item_id: item.id }]);

      toast({
        title: 'Purchase Successful',
        description: `You've purchased ${item.name}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to complete purchase',
        variant: 'destructive',
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const getIconComponent = (iconName: string, size = 18) => {
    switch(iconName) {
      case 'award': return <Award size={size} />;
      case 'star': return <Star size={size} />;
      case 'medal': return <Award size={size} />;
      case 'trending-up': return <Award size={size} />;
      case 'zap': return <Zap size={size} />;
      case 'sparkles': return <Sparkles size={size} />;
      case 'shield': return <Shield size={size} />;
      case 'diamond': return <Diamond size={size} />;
      default: return <Award size={size} />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Achievements & Store</h1>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
          <Coin className="text-yellow-400" size={18} />
          <span className="font-medium">{coins} coins</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements Section */}
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Achievements</h2>
              <Award size={20} className="text-white/60" />
            </div>
            
            <div className="space-y-4">
              {achievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.id);
                const progress = Math.min(100, (coins / achievement.points_required) * 100);
                
                return (
                  <div 
                    key={achievement.id} 
                    className={`rounded-lg p-4 transition-colors ${
                      unlocked 
                        ? `bg-${character}-primary/20 border border-${character}-primary/40` 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        unlocked 
                          ? `bg-${character}-primary/30 text-${character}-primary` 
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {getIconComponent(achievement.icon, 24)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{achievement.name}</h3>
                          {unlocked && (
                            <Check size={16} className="ml-2 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-white/70">{achievement.description}</p>
                        
                        {!unlocked && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{coins} / {achievement.points_required} points</span>
                              <span>{Math.floor(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${character ? `bg-${character}-primary` : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!unlocked && (
                        <div className="text-white/40">
                          <Lock size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedCard>
        </div>
        
        {/* Store Section */}
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Item Shop</h2>
              <ShoppingBag size={20} className="text-white/60" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {storeItems.map((item) => {
                const purchased = isItemPurchased(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`rounded-lg p-4 transition-colors ${
                      purchased 
                        ? `bg-${character}-primary/20 border border-${character}-primary/40` 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        purchased 
                          ? `bg-${character}-primary/30 text-${character}-primary` 
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {getIconComponent(item.icon, 24)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-white/70">{item.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-white/10 px-2 py-0.5 rounded text-xs">
                            <Coin className="text-yellow-400 mr-1" size={12} />
                            <span>{item.price}</span>
                          </div>
                          <div className="text-xs text-white/60">
                            {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {purchased ? (
                          <div className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-500">
                            Owned
                          </div>
                        ) : (
                          <AnimatedButton
                            onClick={() => handlePurchaseItem(item)}
                            disabled={coins < item.price || purchaseLoading === item.id}
                            character={character || undefined}
                            size="sm"
                          >
                            {purchaseLoading === item.id ? 'Buying...' : 'Purchase'}
                          </AnimatedButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
