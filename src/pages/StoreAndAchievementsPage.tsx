
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Trophy, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import StoreItemCard from '@/components/ui/StoreItemCard';
import CoinDisplay from '@/components/ui/CoinDisplay';
import ItemDetailModal from '@/components/modals/ItemDetailModal';
import AchievementDetailModal from '@/components/modals/AchievementDetailModal';
import Footer from '@/components/ui/Footer';

const StoreAndAchievementsPage = () => {
  const { character, coins, userId } = useUser();
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [achievementsSearchTerm, setAchievementsSearchTerm] = useState('');
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [filteredStoreItems, setFilteredStoreItems] = useState<any[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]);
  const [showAllStore, setShowAllStore] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    fetchStoreItems();
    fetchAchievements();
    fetchUserItems();
    fetchUserAchievements();
  }, [userId]);

  useEffect(() => {
    if (storeSearchTerm.trim() === '') {
      setFilteredStoreItems(storeItems);
    } else {
      const filtered = storeItems.filter(item => 
        item.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
        item.item_type.toLowerCase().includes(storeSearchTerm.toLowerCase())
      );
      setFilteredStoreItems(filtered);
    }
  }, [storeSearchTerm, storeItems]);

  useEffect(() => {
    if (achievementsSearchTerm.trim() === '') {
      setFilteredAchievements(achievements);
    } else {
      const filtered = achievements.filter(achievement => 
        achievement.name.toLowerCase().includes(achievementsSearchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(achievementsSearchTerm.toLowerCase())
      );
      setFilteredAchievements(filtered);
    }
  }, [achievementsSearchTerm, achievements]);

  const fetchStoreItems = async () => {
    setIsLoadingStore(true);
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      setStoreItems(data || []);
      setFilteredStoreItems(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const fetchAchievements = async () => {
    setIsLoadingAchievements(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });
      
      if (error) throw error;
      
      setAchievements(data || []);
      setFilteredAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  const fetchUserItems = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_items')
        .select('*, item_id(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setUserItems(data || []);
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement_id(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
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

  const isItemPurchased = (itemId: string) => {
    return userItems.some(userItem => userItem.item_id.id === itemId);
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(userAchievement => userAchievement.achievement_id.id === achievementId);
  };

  const purchaseItem = async (item: any) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to purchase items",
        variant: "destructive",
      });
      return;
    }
    
    if (isItemPurchased(item.id)) {
      toast({
        title: "Already Owned",
        description: "You already own this item",
        variant: "default",
      });
      return;
    }
    
    if (coins < item.price) {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough coins to purchase this item",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, add the item to user_items
      const { error: purchaseError } = await supabase
        .from('user_items')
        .insert([
          { user_id: userId, item_id: item.id }
        ]);
      
      if (purchaseError) throw purchaseError;
      
      // Then, update the user's coins
      const { error: updateCoinsError } = await supabase
        .from('users')
        .update({ coins: coins - item.price })
        .eq('id', userId);
      
      if (updateCoinsError) throw updateCoinsError;
      
      // Update local state
      setUserItems([...userItems, { item_id: item, user_id: userId, purchased_at: new Date().toISOString() }]);
      
      toast({
        title: "Purchase Successful",
        description: `You have purchased ${item.name}`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
    }
  };

  const visibleStoreItems = showAllStore ? filteredStoreItems : filteredStoreItems.slice(0, 6);
  const visibleAchievements = showAllAchievements ? filteredAchievements : filteredAchievements.slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Store & Achievements</h1>
      
      <div className="flex justify-end mb-4">
        {/* Fixed: Removed coins prop since CoinDisplay gets it from UserContext */}
        <CoinDisplay className="" />
      </div>
      
      <Tabs defaultValue="store">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="store" className="flex-1">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>Store</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1">
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              <span>Achievements</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="store" className="focus-visible:outline-none focus-visible:ring-0">
          <AnimatedCard className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold">Available Items</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                <Input
                  placeholder="Search items..."
                  value={storeSearchTerm}
                  onChange={(e) => setStoreSearchTerm(e.target.value)}
                  className="pl-8 bg-black/20 border-white/20 text-white"
                />
              </div>
            </div>
            
            {isLoadingStore ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : filteredStoreItems.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {visibleStoreItems.map((item) => (
                    <StoreItemCard
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      owned={isItemPurchased(item.id)} {/* Fixed: isPurchased → owned */}
                      character={character}
                    />
                  ))}
                </div>
                
                {filteredStoreItems.length > 6 && (
                  <div className="flex justify-center mt-6">
                    <button 
                      onClick={() => setShowAllStore(!showAllStore)}
                      className={`text-sm flex items-center gap-1 px-4 py-2 rounded-md transition-all ${
                        character === 'goku' ? 'bg-goku-primary/20 text-goku-primary hover:bg-goku-primary/30' :
                        character === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary hover:bg-saitama-primary/30' :
                        character === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary hover:bg-jin-woo-primary/30' :
                        'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {showAllStore ? (
                        <>Show Less <ChevronUp size={14} /></>
                      ) : (
                        <>Show All <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatedCard>
        </TabsContent>
        
        <TabsContent value="achievements" className="focus-visible:outline-none focus-visible:ring-0">
          <AnimatedCard className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold">Achievements</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                <Input
                  placeholder="Search achievements..."
                  value={achievementsSearchTerm}
                  onChange={(e) => setAchievementsSearchTerm(e.target.value)}
                  className="pl-8 bg-black/20 border-white/20 text-white"
                />
              </div>
            </div>
            
            {isLoadingAchievements ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No achievements found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {visibleAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                        isAchievementUnlocked(achievement.id)
                          ? character === 'goku' 
                              ? 'bg-goku-primary/20 border border-goku-primary/30' 
                              : character === 'saitama'
                                ? 'bg-saitama-primary/20 border border-saitama-primary/30'
                                : character === 'jin-woo'
                                  ? 'bg-jin-woo-primary/20 border border-jin-woo-primary/30'
                                  : 'bg-green-900/20 border border-green-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isAchievementUnlocked(achievement.id)
                            ? character === 'goku' 
                                ? 'bg-goku-primary/30 text-goku-primary' 
                                : character === 'saitama'
                                  ? 'bg-saitama-primary/30 text-saitama-primary'
                                  : character === 'jin-woo'
                                    ? 'bg-jin-woo-primary/30 text-jin-woo-primary'
                                    : 'bg-green-900/30 text-green-400'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          <span className="text-lg">
                            {achievement.icon && (
                              <span dangerouslySetInnerHTML={{ __html: achievement.icon }} />
                            )}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{achievement.name}</h3>
                          <p className="text-sm opacity-70 line-clamp-2">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-right text-sm">
                        <span className={`px-2 py-0.5 rounded-full ${
                          isAchievementUnlocked(achievement.id)
                            ? character === 'goku' 
                                ? 'bg-goku-primary/30 text-goku-primary' 
                                : character === 'saitama'
                                  ? 'bg-saitama-primary/30 text-saitama-primary'
                                  : character === 'jin-woo'
                                    ? 'bg-jin-woo-primary/30 text-jin-woo-primary'
                                    : 'bg-green-900/30 text-green-400'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {achievement.points_required} points
                        </span>
                      </div>
                      {isAchievementUnlocked(achievement.id) && (
                        <div className="absolute top-2 right-2">
                          <span className={`p-1 rounded-full ${
                            character === 'goku' 
                                ? 'bg-goku-primary text-white' 
                                : character === 'saitama'
                                  ? 'bg-saitama-primary text-white'
                                  : character === 'jin-woo'
                                    ? 'bg-jin-woo-primary text-white'
                                    : 'bg-green-600 text-white'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {filteredAchievements.length > 6 && (
                  <div className="flex justify-center mt-6">
                    <button 
                      onClick={() => setShowAllAchievements(!showAllAchievements)}
                      className={`text-sm flex items-center gap-1 px-4 py-2 rounded-md transition-all ${
                        character === 'goku' ? 'bg-goku-primary/20 text-goku-primary hover:bg-goku-primary/30' :
                        character === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary hover:bg-saitama-primary/30' :
                        character === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary hover:bg-jin-woo-primary/30' :
                        'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {showAllAchievements ? (
                        <>Show Less <ChevronUp size={14} /></>
                      ) : (
                        <>Show All <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatedCard>
        </TabsContent>
      </Tabs>
      
      <Footer />
      
      {showItemModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          owned={isItemPurchased(selectedItem.id)} {/* Fixed: isOwned → owned */}
          onClose={() => setShowItemModal(false)}
          onPurchase={() => purchaseItem(selectedItem)}
          character={character}
        />
      )}
      
      {showAchievementModal && selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          unlocked={isAchievementUnlocked(selectedAchievement.id)} {/* Fixed: isUnlocked → unlocked */}
          onClose={() => setShowAchievementModal(false)}
          character={character}
        />
      )}
    </div>
  );
};

export default StoreAndAchievementsPage;
