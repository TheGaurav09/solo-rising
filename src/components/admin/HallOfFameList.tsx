
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Trophy, Trash2, Search, Loader2, Coffee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';

interface DonorEntry {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  user_id?: string | null;
  user?: {
    warrior_name?: string;
    email?: string;
  } | null;
}

const HallOfFameList = () => {
  const [donors, setDonors] = useState<DonorEntry[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Remove fake users
    const removeFakeUsers = async () => {
      try {
        const fakeNames = ['Son Goku', 'Saitama', 'Sung Jin-Woo', 'Test User', 'Demo User'];
        
        for (const fakeName of fakeNames) {
          const { data } = await supabase
            .from('hall_of_fame')
            .select('*')
            .eq('name', fakeName);

          if (data && data.length > 0) {
            console.log(`Found fake user entry for ${fakeName}, deleting...`);
            await supabase
              .from('hall_of_fame')
              .delete()
              .eq('name', fakeName);
            
            console.log(`${fakeName} entry deleted`);
          }
        }
      } catch (error) {
        console.error("Error deleting fake users:", error);
      }
    };

    removeFakeUsers();
    fetchDonors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = donors.filter(donor => 
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.amount.toString().includes(searchTerm)
      );
      setFilteredDonors(filtered);
    } else {
      setFilteredDonors(donors);
    }
  }, [searchTerm, donors]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      console.log("Fetching hall of fame data");
      
      // First, fetch basic hall of fame data
      const { data: hofData, error: hofError } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('amount', { ascending: false });

      if (hofError) {
        console.error("Error fetching hall of fame data:", hofError);
        throw hofError;
      }

      console.log("Hall of fame data received:", hofData?.length || 0, "entries");
      
      // Create the base donor entries from the hall of fame data
      const donorEntries: DonorEntry[] = hofData || [];
      
      // For each entry with a user_id, fetch the user data separately
      const enhancedDonors = await Promise.all(
        donorEntries.map(async (donor) => {
          if (donor.user_id) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('warrior_name, email')
                .eq('id', donor.user_id)
                .single();
                
              if (!userError && userData) {
                return { ...donor, user: userData };
              }
            } catch (error) {
              console.error(`Error fetching user data for user_id ${donor.user_id}:`, error);
            }
          }
          return { ...donor, user: null };
        })
      );
      
      setDonors(enhancedDonors);
      setFilteredDonors(enhancedDonors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch donors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (donor: DonorEntry) => {
    setSelectedDonor(donor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDonor) return;
    
    setIsDeleting(true);
    try {
      console.log("Deleting hall of fame entry:", selectedDonor.id);
      const { error } = await supabase
        .from('hall_of_fame')
        .delete()
        .eq('id', selectedDonor.id);

      if (error) {
        console.error("Error deleting hall of fame entry:", error);
        throw error;
      }

      // Update local state
      setDonors(prev => prev.filter(d => d.id !== selectedDonor.id));
      setDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting donor:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold">Hall of Fame</h3>
        
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <motion.a 
            href="https://www.buymeacoffee.com/" 
            target="_blank"
            className="flex justify-center items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Coffee size={18} />
            <span>Buy me a coffee</span>
          </motion.a>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
            <Input 
              placeholder="Search donors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-black/20 border-white/20 text-white"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No donations found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/30 text-white/70">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor.id} className="border-b border-white/10 bg-black/10 hover:bg-black/20">
                  <td className="px-4 py-3 font-medium">{donor.name}</td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{formatAmount(donor.amount)}</td>
                  <td className="px-4 py-3 text-white/70">{formatDate(donor.created_at)}</td>
                  <td className="px-4 py-3 text-white/70">
                    {donor.user?.warrior_name || 'N/A'}
                    {donor.user?.email && (
                      <div className="text-xs text-white/50">{donor.user.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      onClick={() => handleDeleteClick(donor)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 h-auto"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-red-900/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this entry from the Hall of Fame?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              className="bg-red-900 hover:bg-red-800 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HallOfFameList;
