
import React, { useState, useEffect } from 'react';
import { Trophy, Star, ShoppingBag, Plus, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Make ShowcaseItem compatible with JSON serialization
interface ShowcaseItem {
  id: string;
  type: 'achievement' | 'badge' | 'store_item';
  name: string;
  icon: string;
  description: string;
}

interface Showcase {
  id: string;
  user_id: string;
  items: ShowcaseItem[];
}

interface ProfileShowcaseProps {
  userId?: string;
  isViewingOtherUser?: boolean;
}

const ProfileShowcase = ({ userId, isViewingOtherUser = false }: ProfileShowcaseProps) => {
  const [showcase, setShowcase] = useState<Showcase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState<ShowcaseItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ShowcaseItem[]>([]);
  
  const loadShowcase = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetUserId = isViewingOtherUser && userId ? userId : userData.user?.id;
      
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }
      
      // Use the new user_showcase table that we created
      const { data, error } = await supabase
        .from('user_showcase')
        .select('*')
        .eq('user_id', targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading showcase:", error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Convert the data to our Showcase type
        const showcaseData: Showcase = {
          id: data.id,
          user_id: data.user_id,
          items: Array.isArray(data.items) ? data.items as ShowcaseItem[] : []
        };
        setShowcase(showcaseData);
        setSelectedItems(Array.isArray(data.items) ? data.items as ShowcaseItem[] : []);
      } else {
        setShowcase(null);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error("Error in loadShowcase:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAvailableItems = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      // Get user's achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievements(*)')
        .eq('user_id', userData.user.id);
      
      if (achievementsError) {
        console.error("Error loading achievements:", achievementsError);
      }
      
      // Get user's badges
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badges(*)')
        .eq('user_id', userData.user.id);
      
      if (badgesError) {
        console.error("Error loading badges:", badgesError);
      }
      
      // Get user's store items
      const { data: storeItems, error: storeItemsError } = await supabase
        .from('user_items')
        .select('store_items(*)')
        .eq('user_id', userData.user.id);
      
      if (storeItemsError) {
        console.error("Error loading store items:", storeItemsError);
      }
      
      const items: ShowcaseItem[] = [
        ...(achievements?.map(a => ({
          id: a.achievements?.id || '',
          type: 'achievement' as const,
          name: a.achievements?.name || '',
          icon: a.achievements?.icon || '',
          description: a.achievements?.description || ''
        })) || []),
        ...(badges?.map(b => ({
          id: b.badges?.id || '',
          type: 'badge' as const,
          name: b.badges?.name || '',
          icon: b.badges?.icon || '',
          description: b.badges?.description || ''
        })) || []),
        ...(storeItems?.map(s => ({
          id: s.store_items?.id || '',
          type: 'store_item' as const,
          name: s.store_items?.name || '',
          icon: s.store_items?.icon || '',
          description: s.store_items?.description || ''
        })) || [])
      ].filter(item => item.id !== '');
      
      setAvailableItems(items);
    } catch (error) {
      console.error("Error in loadAvailableItems:", error);
    }
  };
  
  useEffect(() => {
    loadShowcase();
  }, [userId, isViewingOtherUser]);
  
  const handleEditClick = async () => {
    await loadAvailableItems();
    setIsEditing(true);
  };
  
  const handleAddItem = (item: ShowcaseItem) => {
    if (selectedItems.length >= 5) {
      toast({
        title: "Showcase Limit Reached",
        description: "You can only showcase up to 5 items",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedItems.some(i => i.id === item.id)) {
      toast({
        title: "Item Already Added",
        description: "This item is already in your showcase",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedItems([...selectedItems, item]);
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };
  
  const saveShowcase = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      // Convert selectedItems to a plain object that can be stored as JSON
      const itemsToSave = selectedItems.map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        icon: item.icon,
        description: item.description
      }));
      
      if (showcase) {
        // Update existing showcase
        const { error } = await supabase
          .from('user_showcase')
          .update({ 
            items: itemsToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', showcase.id)
          .eq('user_id', userData.user.id);
        
        if (error) {
          console.error("Error updating showcase:", error);
          toast({
            title: "Error",
            description: "Failed to update showcase",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Create new showcase
        const { error } = await supabase
          .from('user_showcase')
          .insert({
            user_id: userData.user.id,
            items: itemsToSave
          });
        
        if (error) {
          console.error("Error creating showcase:", error);
          toast({
            title: "Error",
            description: "Failed to create showcase",
            variant: "destructive"
          });
          return;
        }
      }
      
      toast({
        title: "Showcase Updated",
        description: "Your profile showcase has been updated",
      });
      
      setIsEditing(false);
      loadShowcase();
    } catch (error) {
      console.error("Error in saveShowcase:", error);
    }
  };
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy size={16} className="text-yellow-500" />;
      case 'badge': return <Star size={16} className="text-blue-500" />;
      case 'store_item': return <ShoppingBag size={16} className="text-green-500" />;
      default: return <Star size={16} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="mt-2 text-white/70">Loading showcase...</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Showcase</h3>
        {!isViewingOtherUser && (
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    loadShowcase(); // Reload to discard changes
                  }}
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveShowcase}
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditClick}
              >
                <Edit size={16} className="mr-1" />
                Edit Showcase
              </Button>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {selectedItems.map(item => (
              <div 
                key={item.id} 
                className="p-3 bg-white/5 border border-white/10 rounded-lg relative"
              >
                <button 
                  className="absolute top-1 right-1 bg-red-500/20 hover:bg-red-500/40 rounded-full p-1"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <X size={12} />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <span className="text-xs text-white/50 mt-1 flex items-center gap-1">
                    {getItemIcon(item.type)}
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
            
            {selectedItems.length < 5 && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="p-3 bg-white/5 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-sm">Add Item</span>
              </button>
            )}
          </div>
          
          <p className="text-sm text-white/60">
            Showcase up to 5 of your favorite achievements, badges, and items.
          </p>
        </div>
      ) : (
        <div>
          {selectedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {selectedItems.map(item => (
                <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <span className="text-xs text-white/50 mt-1 flex items-center gap-1">
                      {getItemIcon(item.type)}
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-white/50">
              {isViewingOtherUser ? (
                <p>This user hasn't added any showcase items yet</p>
              ) : (
                <div>
                  <Trophy size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Add your favorite achievements, badges, and items to your showcase</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditClick}
                    className="mt-3"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Items
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Add Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Item to Showcase</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {availableItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {availableItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleAddItem(item);
                      setIsDialogOpen(false);
                    }}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-colors"
                    disabled={selectedItems.some(i => i.id === item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{item.icon}</div>
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          {getItemIcon(item.type)}
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <Trophy size={32} className="mx-auto mb-2 opacity-50" />
                <p>You haven't earned any items to showcase yet</p>
                <p className="text-sm mt-2">Complete workouts and purchase items to add them here</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileShowcase;
