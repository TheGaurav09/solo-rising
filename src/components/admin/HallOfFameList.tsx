
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus, ExternalLink, Trash2, Trophy, Search, Loader2 } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface Supporter {
  id: string;
  name: string;
  amount: number;
  user_id: string | null;
  created_at?: string;
}

interface User {
  id: string;
  warrior_name: string;
}

const HallOfFameList = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSupporterName, setNewSupporterName] = useState('');
  const [newSupporterAmount, setNewSupporterAmount] = useState('');
  const [newSupporterUserId, setNewSupporterUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showHallOfFameDialog, setShowHallOfFameDialog] = useState(false);
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSupporters();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userSearch.trim()) {
      const lowerCaseSearch = userSearch.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.warrior_name.toLowerCase().includes(lowerCaseSearch)
      ));
    } else {
      setFilteredUsers([]);
    }
  }, [userSearch, users]);

  const fetchSupporters = async () => {
    try {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('amount', { ascending: false });
      
      if (error) throw error;
      setSupporters(data || []);
    } catch (error) {
      console.error('Error fetching supporters:', error);
      toast({
        title: "Error",
        description: "Failed to load supporters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, warrior_name')
        .order('warrior_name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddSupporter = async () => {
    if (!newSupporterName.trim() || !newSupporterAmount.trim()) return;
    
    const amount = parseFloat(newSupporterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use the admin function to bypass RLS policies
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'add_to_hall_of_fame',
          name: newSupporterName,
          amount: amount,
          userId: newSupporterUserId || null
        }
      });
      
      if (error || (data && data.error)) {
        throw new Error(error?.message || data?.error || 'Failed to add supporter');
      }
      
      // Refresh the supporters list
      fetchSupporters();
      
      setNewSupporterName('');
      setNewSupporterAmount('');
      setNewSupporterUserId('');
      setShowHallOfFameDialog(false);
      
      toast({
        title: "Success",
        description: `${newSupporterName} has been added to the Hall of Fame`,
      });
    } catch (error) {
      console.error('Error adding supporter:', error);
      toast({
        title: "Error",
        description: "Failed to add supporter. Make sure you have proper permissions and the service role key is configured.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSupporter = async (supporterId: string) => {
    if (!confirm("Are you sure you want to remove this supporter from the Hall of Fame?")) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Direct delete from the database
      const { error } = await supabase
        .from('hall_of_fame')
        .delete()
        .eq('id', supporterId);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete supporter');
      }
      
      setSupporters(supporters.filter(supporter => supporter.id !== supporterId));
      
      toast({
        title: "Success",
        description: "Supporter has been removed from the Hall of Fame",
      });
    } catch (error) {
      console.error('Error removing supporter:', error);
      toast({
        title: "Error",
        description: "Failed to remove supporter",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectUser = (user: User) => {
    setNewSupporterUserId(user.id);
    setNewSupporterName(user.warrior_name);
    setShowUserSearchDialog(false);
  };

  const handleUserClick = (userId: string | null) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Hall of Fame</h2>
        <Button 
          onClick={() => setShowHallOfFameDialog(true)}
          className="bg-goku-primary hover:bg-goku-primary/80"
        >
          <Plus size={16} className="mr-2" />
          Add Supporter
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : supporters.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {supporters.map(supporter => (
            <div key={supporter.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">{supporter.name}</h3>
                  <p className="text-gradient goku-gradient font-bold text-xl">${supporter.amount}</p>
                </div>
                <div className="flex gap-2">
                  {supporter.user_id && (
                    <button 
                      onClick={() => handleUserClick(supporter.user_id)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                    >
                      <ExternalLink size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteSupporter(supporter.id)}
                    className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No supporters added yet</p>
        </div>
      )}

      <Dialog open={showHallOfFameDialog} onOpenChange={setShowHallOfFameDialog}>
        <DialogContent className="bg-black/90 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Add to Hall of Fame</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new supporter to the Hall of Fame. You can optionally link to a user profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="supporter-name" className="text-white">Supporter Name</Label>
              <Input 
                id="supporter-name"
                value={newSupporterName}
                onChange={(e) => setNewSupporterName(e.target.value)}
                placeholder="Enter supporter name"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div>
              <Label htmlFor="supporter-amount" className="text-white">Amount ($)</Label>
              <Input 
                id="supporter-amount"
                value={newSupporterAmount}
                onChange={(e) => setNewSupporterAmount(e.target.value)}
                placeholder="Enter amount"
                type="number"
                min="0.01"
                step="0.01"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div>
              <Label htmlFor="supporter-user-id" className="text-white">Select User (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  id="supporter-user-id"
                  value={newSupporterUserId}
                  onChange={(e) => setNewSupporterUserId(e.target.value)}
                  placeholder="User ID (Optional)"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  readOnly
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setShowUserSearchDialog(true);
                    setUserSearch('');
                  }}
                >
                  <Search size={16} />
                </Button>
              </div>
              {newSupporterUserId && (
                <p className="text-sm text-green-400 mt-1">User selected: {newSupporterName}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowHallOfFameDialog(false)}
              className="border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSupporter}
              className="bg-goku-primary hover:bg-goku-primary/80"
              disabled={!newSupporterName.trim() || !newSupporterAmount.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Supporter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User search dialog */}
      <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
        <DialogContent className="bg-black/90 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search for a user to link to this supporter
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
              <Search className="text-gray-400" />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto border border-white/10 rounded-md">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                    onClick={() => selectUser(user)}
                  >
                    <p className="text-white">{user.warrior_name}</p>
                    <p className="text-xs text-gray-400">{user.id}</p>
                  </div>
                ))
              ) : userSearch.trim() ? (
                <p className="p-4 text-center text-gray-400">No users found</p>
              ) : (
                <p className="p-4 text-center text-gray-400">Start typing to search users</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowUserSearchDialog(false)}
              className="border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedCard>
  );
};

export default HallOfFameList;
