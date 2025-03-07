
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Search, Trash2, AlertTriangle, Loader2, CalendarDays, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface UserInfo {
  warrior_name: string;
  email: string;
}

interface Warning {
  id: string;
  user_id: string;
  message: string;
  admin_email: string;
  read: boolean;
  created_at: string;
  user?: UserInfo | null;
}

const MessagesList = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [filteredWarnings, setFilteredWarnings] = useState<Warning[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchWarnings();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = warnings.filter(warning => 
        warning.user?.warrior_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warning.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warning.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWarnings(filtered);
    } else {
      setFilteredWarnings(warnings);
    }
  }, [searchTerm, warnings]);
  
  const fetchWarnings = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching warnings");
      // First fetch all warnings
      const { data: warningsData, error: warningsError } = await supabase
        .from('warnings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (warningsError) {
        console.error("Error fetching warnings:", warningsError);
        throw warningsError;
      }
      
      console.log("Warnings data received:", warningsData?.length || 0, "entries");
      
      if (!warningsData || warningsData.length === 0) {
        setWarnings([]);
        setFilteredWarnings([]);
        setIsLoading(false);
        return;
      }
      
      // If we have warnings, fetch the user details separately for each warning
      const enhancedWarnings: Warning[] = [];
      
      for (const warning of warningsData) {
        try {
          if (warning.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('warrior_name, email')
              .eq('id', warning.user_id)
              .maybeSingle();
              
            if (!userError && userData) {
              enhancedWarnings.push({
                ...warning,
                user: userData
              });
            } else {
              // If user not found, still include the warning with user as null
              console.log("User data not found for warning:", warning.id);
              enhancedWarnings.push({
                ...warning,
                user: null
              });
            }
          } else {
            // If no user_id, still include the warning with user as null
            enhancedWarnings.push({
              ...warning,
              user: null
            });
          }
        } catch (error) {
          console.error('Error fetching user for warning:', error);
          // Still include the warning even if there was an error fetching user
          enhancedWarnings.push({
            ...warning,
            user: null
          });
        }
      }
      
      setWarnings(enhancedWarnings);
      setFilteredWarnings(enhancedWarnings);
    } catch (error) {
      console.error('Error fetching warnings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch warnings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteWarning = (warning: Warning) => {
    setSelectedWarning(warning);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteWarning = async () => {
    if (!selectedWarning) return;
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting warning:", selectedWarning.id);
      const { error } = await supabase
        .from('warnings')
        .delete()
        .eq('id', selectedWarning.id);
      
      if (error) {
        console.error("Error deleting warning:", error);
        throw error;
      }
      
      // Immediately update UI
      setWarnings(prev => prev.filter(w => w.id !== selectedWarning.id));
      setFilteredWarnings(prev => prev.filter(w => w.id !== selectedWarning.id));
      
      toast({
        title: "Success",
        description: "Warning has been deleted.",
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting warning:', error);
      toast({
        title: "Error",
        description: "Failed to delete warning.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/10">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Warnings & Messages</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-black/20 border-white/20 text-white"
          />
        </div>
      </div>
      
      <Button
        onClick={fetchWarnings}
        className="bg-blue-700 hover:bg-blue-600 text-white"
        size="sm"
      >
        <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
        Refresh Warnings
      </Button>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        </div>
      ) : filteredWarnings.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No warnings found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/30 text-white/70">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">User</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarnings.map((warning) => (
                <tr key={warning.id} className="border-b border-white/10 bg-black/10 hover:bg-black/20">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-white/50" />
                      <span className="font-medium text-white">{warning.user?.warrior_name || 'Unknown User'}</span>
                    </div>
                    <span className="text-xs text-white/50">{warning.user?.email || warning.user_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {warning.message}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-white/80">{warning.admin_email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-white/70">
                      <CalendarDays size={14} />
                      <span>{formatDate(warning.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      warning.read ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                    }`}>
                      {warning.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => handleDeleteWarning(warning)}
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
            <AlertDialogTitle>Delete Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this warning? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={confirmDeleteWarning}
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

export default MessagesList;
