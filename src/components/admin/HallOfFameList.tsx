
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Plus, ExternalLink, Trash2, Trophy } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Supporter {
  id: string;
  name: string;
  amount: number;
  user_id: string | null;
  created_at?: string;
}

const HallOfFameList = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSupporterName, setNewSupporterName] = useState('');
  const [newSupporterAmount, setNewSupporterAmount] = useState('');
  const [newSupporterUserId, setNewSupporterUserId] = useState('');
  const [showHallOfFameDialog, setShowHallOfFameDialog] = useState(false);

  useEffect(() => {
    fetchSupporters();
  }, []);

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
    
    try {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .insert({
          name: newSupporterName,
          amount: amount,
          user_id: newSupporterUserId || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSupporters([...supporters, data]);
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
        description: "Failed to add supporter",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupporter = async (supporterId: string) => {
    if (!confirm("Are you sure you want to remove this supporter from the Hall of Fame?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('hall_of_fame')
        .delete()
        .eq('id', supporterId);
      
      if (error) throw error;
      
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
    }
  };

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Hall of Fame</h2>
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
                  <h3 className="font-bold text-lg">{supporter.name}</h3>
                  <p className="text-gradient goku-gradient font-bold text-xl">${supporter.amount}</p>
                </div>
                <div className="flex gap-2">
                  {supporter.user_id && (
                    <Link 
                      to={`/profile/${supporter.user_id}`} 
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                      target="_blank"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  )}
                  <button 
                    onClick={() => handleDeleteSupporter(supporter.id)}
                    className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 size={18} />
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
        <DialogContent className="bg-black/90 border border-white/20">
          <DialogHeader>
            <DialogTitle>Add to Hall of Fame</DialogTitle>
            <DialogDescription>
              Add a new supporter to the Hall of Fame. You can optionally link to a user profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="supporter-name">Supporter Name</Label>
              <Input 
                id="supporter-name"
                value={newSupporterName}
                onChange={(e) => setNewSupporterName(e.target.value)}
                placeholder="Enter supporter name"
                className="bg-white/5"
              />
            </div>
            
            <div>
              <Label htmlFor="supporter-amount">Amount ($)</Label>
              <Input 
                id="supporter-amount"
                value={newSupporterAmount}
                onChange={(e) => setNewSupporterAmount(e.target.value)}
                placeholder="Enter amount"
                type="number"
                min="0.01"
                step="0.01"
                className="bg-white/5"
              />
            </div>
            
            <div>
              <Label htmlFor="supporter-user-id">User ID (Optional)</Label>
              <Input 
                id="supporter-user-id"
                value={newSupporterUserId}
                onChange={(e) => setNewSupporterUserId(e.target.value)}
                placeholder="Enter user ID to link profile (optional)"
                className="bg-white/5"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowHallOfFameDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSupporter}
              className="bg-goku-primary hover:bg-goku-primary/80"
              disabled={!newSupporterName.trim() || !newSupporterAmount.trim()}
            >
              Add Supporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedCard>
  );
};

export default HallOfFameList;
