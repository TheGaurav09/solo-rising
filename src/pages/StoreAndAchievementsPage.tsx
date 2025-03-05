import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import CoinDisplay from '@/components/ui/CoinDisplay';
import StoreItemCard from '@/components/ui/StoreItemCard';
import { ShoppingBag, Award, ChevronDown, ChevronUp, Gift, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import AchievementDetailModal from '@/components/modals/AchievementDetailModal';
import Footer from '@/components/ui/Footer';

const StoreAndAchievementsPage = () => {
  const { character, points, coins, addCoins, useCoins } = useUser();
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [userItems, setUserItems] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data: storeItems, error: storeError } = await supabase
        .from('store_items')
        .select('*')
        .order('price', { ascending: true });

      if (storeError) {
        console.error("Store items fetch error:", storeError);
      } else {
        setStoreItems(storeItems || []);
      }

      const { data: userItemsData, error: userItemsError } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', userData.user.id);

      if (userItemsError) {
        console.error("User items fetch error:", userItemsError);
      } else {
        setUserItems(userItemsData?.map(item => item.item_id) || []);
      }

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (achievementsError) {
        console.error("Achievements fetch error:", achievementsError);
      } else {
        setAchievements(achievementsData || []);
      }

      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userData.user.id);

      if (userAchievementsError) {
        console.error("User achievements fetch error:", userAchievementsError);
      } else {
        setUserAchievements(userAchievementsData?.map(item => item.achievement_id) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store and achievements data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handlePurchase = async (item: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      if (userItems.includes(item.id)) {
        toast({
          title: 'Already Owned',
          description: 'You already own this item',
          duration: 3000,
        });
        return;
      }
      
      const { data: userCoins, error: userCoinsError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userData.user.id)
        .single();
      
      if (userCoinsError) throw userCoinsError;
      
      if (!userCoins || userCoins.coins < item.price) {
        toast({
          title: 'Not Enough Coins',
          description: `You need ${item.price - (userCoins?.coins || 0)} more coins to purchase this item`,
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }
      
      const { error: purchaseError } = await supabase
        .from('user_items')
        .insert([
          { user_id: userData.user.id, item_id: item.id }
        ]);
      
      if (purchaseError) throw purchaseError;
      
      const newCoins = userCoins.coins - item.price;
      const { error: updateError } = await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', userData.user.id);
      
      if (updateError) throw updateError;
      
      setUserItems([...userItems, item.id]);
      useCoins(-item.price);
      
      toast({
        title: 'Purchase Successful',
        description: `You have purchased ${item.name}`,
        duration: 3000,
      });
      
      setShowItemModal(false);
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'There was an error completing your purchase',
        variant: 'destructive',
      });
    }
  };

  const visibleAchievements = showAllAchievements ? achievements : achievements.slice(0, 6);

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
        <h1 className="text-2xl font-bold">Store & Achievements</h1>
        <CoinDisplay />
      </div>
      
      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>Store</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award size={16} />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="store" className="space-y-4">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag size={20} />
                <span>Item Shop</span>
              </h2>
              <CoinDisplay />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeItems.map((item) => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  owned={userItems.includes(item.id)}
                  onClick={() => handleItemClick(item)}
                  character={character}
                />
              ))}
            </div>
          </AnimatedCard>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award size={20} />
                <span>Achievements</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-white/70">
                  {userAchievements.length}/{achievements.length} unlocked
                </div>
                {achievements.length > 6 && (
                  <button 
                    onClick={() => setShowAllAchievements(!showAllAchievements)}
                    className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
                  >
                    {showAllAchievements ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>Show All <ChevronDown size={14} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleAchievements.map((achievement) => {
                const isUnlocked = userAchievements.includes(achievement.id);
                const progress = Math.min(100, Math.floor((points / achievement.points_required) * 100));
                
                return (
                  <div 
                    key={achievement.id}
                    onClick={() => handleAchievementClick(achievement)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      isUnlocked 
                        ? character 
                          ? `bg-${character}-primary/20 border-${character}-primary/40` 
                          : 'bg-primary/20 border-primary/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-black/30 p-2 rounded-lg">
                        <Award 
                          size={24} 
                          className={isUnlocked ? character 
                            ? `text-${character}-primary` 
                            : 'text-primary' : 'text-white/40'} 
                        />
                      </div>
                      {isUnlocked && (
                        <CheckCircle 
                          size={20} 
                          className={character ? `text-${character}-primary` : 'text-primary'} 
                        />
                      )}
                    </div>
                    
                    <h3 className="font-bold">{achievement.name}</h3>
                    <p className="text-sm text-white/70 mb-2">{achievement.description}</p>
                    
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>{points}/{achievement.points_required} points</span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          isUnlocked 
                            ? character 
                              ? `bg-${character}-primary` 
                              : 'bg-primary' 
                            : 'bg-white/30'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
      
      {showItemModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setShowItemModal(false)}
          onPurchase={() => handlePurchase(selectedItem)}
          character={character}
        />
      )}
      
      {showAchievementModal && selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setShowAchievementModal(false)}
          character={character}
          currentPoints={points}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default StoreAndAchievementsPage;
