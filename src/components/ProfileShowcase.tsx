import React, { useState, useEffect } from 'react';
import { Trophy, Star, ShoppingBag, Plus, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

interface ShowcaseItem {
  id: string;
  type: 'achievement' | 'badge' | 'item';
  name: string;
  description: string;
  icon: string;
}

interface ProfileShowcaseProps {
  userId?: string;
  isViewingOtherUser?: boolean;
}

const ProfileShowcase: React.FC<ProfileShowcaseProps> = ({
  userId,
  isViewingOtherUser = false
}) => {
  const { character } = useUser();
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableItems, setAvailableItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const targetUserId = userId || authData.user?.id;
      
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const { data: showcaseData, error: showcaseError } = await supabase
        .from('user_showcase')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      if (showcaseError && showcaseError.code !== 'PGRST116') {
        console.error("Error fetching showcase:", showcaseError);
      }
      
      if (showcaseData?.items) {
        setShowcaseItems(showcaseData.items as unknown as ShowcaseItem[]);
      }

      if (!isViewingOtherUser && authData.user) {
        const achievements = await fetchAchievements(authData.user.id);
        const badges = await fetchBadges(authData.user.id);
        const items = await fetchItems(authData.user.id);
        
        setAvailableItems([...achievements, ...badges, ...items]);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async (userId: string): Promise<ShowcaseItem[]> => {
    return [];
  };

  const fetchBadges = async (userId: string): Promise<ShowcaseItem[]> => {
    return [];
  };

  const fetchItems = async (userId: string): Promise<ShowcaseItem[]> => {
    return [];
  };

  const addToShowcase = (item: ShowcaseItem) => {
    if (showcaseItems.length >= 5) {
      toast({
        title: "Showcase Limit Reached",
        description: "You can only showcase up to 5 items",
        variant: "destructive"
      });
      return;
    }
    
    if (showcaseItems.some(i => i.id === item.id)) {
      toast({
        title: "Item Already Added",
        description: "This item is already in your showcase",
        variant: "destructive"
      });
      return;
    }
    
    setShowcaseItems([...showcaseItems, item]);
  };

  const removeFromShowcase = (itemId: string) => {
    setShowcaseItems(showcaseItems.filter(item => item.id !== itemId));
  };

  const saveShowcase = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      
      const { data: existingShowcase, error: checkError } = await supabase
        .from('user_showcase')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking showcase:", checkError);
        return;
      }
      
      let saveError;
      
      if (existingShowcase) {
        const { error } = await supabase
          .from('user_showcase')
          .update({ 
            items: showcaseItems as unknown as Json 
          })
          .eq('id', existingShowcase.id);
        
        saveError = error;
      } else {
        const { error } = await supabase
          .from('user_showcase')
          .insert({ 
            user_id: authData.user.id,
            items: showcaseItems as unknown as Json
          });
        
        saveError = error;
      }
      
      if (saveError) {
        console.error("Error saving showcase:", saveError);
        toast({
          title: "Error",
          description: "Failed to save showcase",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Showcase saved successfully",
      });
      
      setIsEditMode(false);
    } catch (error) {
      console.error("Error in saveShowcase:", error);
    }
  };

  const getItemIcon = (item: ShowcaseItem) => {
    switch (item.type) {
      case 'achievement': return <Trophy size={16} className="text-yellow-500" />;
      case 'badge': return <Star size={16} className="text-blue-500" />;
      case 'item': return <ShoppingBag size={16} className="text-green-500" />;
      default: return <Star size={16} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Showcase</h3>
        {!isViewingOtherUser && (
          isEditMode ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditMode(false)}
                className="flex items-center gap-1"
              >
                <X size={16} />
                <span>Cancel</span>
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={saveShowcase}
                className="flex items-center gap-1"
              >
                <Save size={16} />
                <span>Save</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-1"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Button>
          )
        )}
      </div>
      
      {showcaseItems.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          {isViewingOtherUser 
            ? "This user hasn't added any items to their showcase yet."
            : "Add your achievements, badges, and items to your showcase."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {showcaseItems.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 ${isEditMode ? 'pr-10 relative' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/20 text-${character}-primary` : 'bg-primary/20 text-primary'}`}>
                {getItemIcon(item)}
              </div>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-white/70">{item.description}</div>
              </div>
              {isEditMode && (
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  onClick={() => removeFromShowcase(item.id)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isEditMode && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Available Items</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {availableItems.filter(item => !showcaseItems.some(s => s.id === item.id)).map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10"
                onClick={() => addToShowcase(item)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character ? `bg-${character}-primary/20 text-${character}-primary` : 'bg-primary/20 text-primary'}`}>
                  {getItemIcon(item)}
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-white/70">{item.description}</div>
                </div>
                <button 
                  className="ml-auto p-1 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
            {availableItems.filter(item => !showcaseItems.some(s => s.id === item.id)).length === 0 && (
              <div className="col-span-full text-center py-4 text-white/50">
                No more items available to add.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileShowcase;
