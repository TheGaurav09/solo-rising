
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Search, Trash2, AlertTriangle, Send, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const UsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [hallOfFameDialogOpen, setHallOfFameDialogOpen] = useState(false);
  const [hallOfFameName, setHallOfFameName] = useState('');
  const [hallOfFameAmount, setHallOfFameAmount] = useState('');
  const [isAddingToHallOfFame, setIsAddingToHallOfFame] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.warrior_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleWarningUser = (user: any) => {
    setSelectedUser(user);
    setWarningDialogOpen(true);
  };
  
  const handleAddToHallOfFame = (user: any) => {
    setSelectedUser(user);
    setHallOfFameName(user.warrior_name || '');
    setHallOfFameAmount('');
    setHallOfFameDialogOpen(true);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  const confirmDeleteUser = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Please enter the admin delete password",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'delete_user', 
          userId: selectedUser.id,
          password: deletePassword
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Success",
        description: `User ${selectedUser.warrior_name} has been deleted.`,
      });
      
      fetchUsers();
      setDeleteDialogOpen(false);
      setDeletePassword('');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const sendWarning = async () => {
    if (!warningMessage) {
      toast({
        title: "Error",
        description: "Please enter a warning message",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'send_warning', 
          userId: selectedUser.id,
          message: warningMessage
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Success",
        description: `Warning sent to ${selectedUser.warrior_name}.`,
      });
      
      setWarningDialogOpen(false);
      setWarningMessage('');
    } catch (error: any) {
      console.error('Error sending warning:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send warning.",
        variant: "destructive",
      });
    }
  };
  
  const addToHallOfFame = async () => {
    if (!hallOfFameName || !hallOfFameAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(hallOfFameAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToHallOfFame(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'add_to_hall_of_fame', 
          userId: selectedUser.id,
          name: hallOfFameName,
          amount: amount
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Success",
        description: `${hallOfFameName} added to Hall of Fame.`,
      });
      
      setHallOfFameDialogOpen(false);
      setHallOfFameName('');
      setHallOfFameAmount('');
    } catch (error: any) {
      console.error('Error adding to Hall of Fame:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add to Hall of Fame.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToHallOfFame(false);
    }
  };
  
  return (
    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/10">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Users Management</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 bg-black/20 border-white/20 text-white"
          />
        </div>
      </div>
      
      {isLoadingUsers ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/30 text-white/70">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Character</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/10 bg-black/10 hover:bg-black/20">
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-white">{user.warrior_name}</td>
                  <td className="px-4 py-3 text-white/80">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-white/80">{user.character_type}</td>
                  <td className="px-4 py-3 text-white/80">{user.country}</td>
                  <td className="px-4 py-3 text-white/80">{user.points}</td>
                  <td className="px-4 py-3 text-white/80">{user.streak}</td>
                  <td className="px-4 py-3 text-white/80">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(user.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                      <button
                        onClick={() => handleAddToHallOfFame(user)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"></path><path d="M12 21v-8"></path><path d="M17 5H7v8h10V5z"></path><path d="M10 5V3h4v2"></path></svg>
                      </button>
                      <button
                        onClick={() => handleWarningUser(user)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <AlertTriangle size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete {selectedUser?.warrior_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="deletePassword" className="text-white">Admin Password</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-black/30 border-white/20 text-white"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={confirmDeleteUser}
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
      
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent className="bg-gray-900 border border-yellow-900/50 text-white">
          <DialogHeader>
            <DialogTitle>Send Warning</DialogTitle>
            <DialogDescription className="text-white/70">
              Send a warning to {selectedUser?.warrior_name}. The warning will be displayed to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="warningMessage" className="text-white">Warning Message</Label>
              <Textarea
                id="warningMessage"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message"
                className="min-h-[100px] bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setWarningDialogOpen(false)}
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={sendWarning}
              className="bg-yellow-900 hover:bg-yellow-800 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={hallOfFameDialogOpen} onOpenChange={setHallOfFameDialogOpen}>
        <DialogContent className="bg-gray-900 border border-green-900/50 text-white">
          <DialogHeader>
            <DialogTitle>Add to Hall of Fame</DialogTitle>
            <DialogDescription className="text-white/70">
              Add {selectedUser?.warrior_name} to the Hall of Fame.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="hofName" className="text-white">Name</Label>
              <Input
                id="hofName"
                value={hallOfFameName}
                onChange={(e) => setHallOfFameName(e.target.value)}
                placeholder="Enter name"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hofAmount" className="text-white">Amount</Label>
              <Input
                id="hofAmount"
                value={hallOfFameAmount}
                onChange={(e) => setHallOfFameAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-black/30 border-white/20 text-white"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setHallOfFameDialogOpen(false)}
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={addToHallOfFame}
              className="bg-green-900 hover:bg-green-800 text-white"
              disabled={isAddingToHallOfFame}
            >
              {isAddingToHallOfFame ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : 'Add to Hall of Fame'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;
