
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, AlertTriangle, Send, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface User {
  id: string;
  email: string;
  warrior_name: string;
  character_type: string;
  points: number;
  streak: number;
  coins: number;
  xp: number;
  level: number;
  country: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [deleteUserPassword, setDeleteUserPassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      toast({
        title: "Error",
        description: "Unexpected error fetching users",
        variant: "destructive",
      });
    }
  };

  const filterUsers = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.warrior_name?.toLowerCase().includes(lowerCaseQuery) ||
      user.email?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    setIsProcessing(true);
    setDeletePasswordError('');

    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'delete_user',
          userDeleteId: selectedUserId,
          password: deleteUserPassword
        }
      });

      if (error) {
        console.error('Error deleting user:', error);
        setDeletePasswordError('Failed to delete user: ' + error.message);
        return;
      }

      if (data.error) {
        console.error('Error response:', data.error);
        setDeletePasswordError(data.error);
        return;
      }

      // Remove user from public.users table
      const { error: publicUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUserId);

      if (publicUserError) {
        console.error('Error deleting user from public.users:', publicUserError);
        toast({
          title: "Partial Success",
          description: "User auth deleted, but failed to delete user data",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
      });

      setUsers(users.filter(user => user.id !== selectedUserId));
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      setDeletePasswordError('Unexpected error deleting user');
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
      setDeleteUserPassword('');
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUserId || !warningMessage.trim()) return;
    
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: { 
          action: 'send_warning',
          userId: selectedUserId,
          warningMessage: warningMessage.trim()
        }
      });

      if (error || (data && data.error)) {
        console.error('Error sending warning:', error || data.error);
        toast({
          title: "Error",
          description: "Failed to send warning",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Warning Sent",
        description: `Warning sent to ${selectedUserName}`,
      });
    } catch (error) {
      console.error('Unexpected error sending warning:', error);
      toast({
        title: "Error",
        description: "Unexpected error sending warning",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setWarningDialogOpen(false);
      setSelectedUserId(null);
      setSelectedUserName('');
      setWarningMessage('');
    }
  };

  const handleViewProfile = (userId: string) => {
    window.open(`/profile/${userId}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
        />
        <Search className="text-gray-400" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{user.warrior_name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white"
                onClick={() => handleViewProfile(user.id)}
              >
                <ExternalLink size={16} className="mr-1" />
                View
              </Button>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-300">
                Points: <span className="text-white">{user.points}</span>
              </p>
              <p className="text-sm text-gray-300">
                Level: <span className="text-white">{user.level}</span>
              </p>
              <p className="text-sm text-gray-300">
                Country: <span className="text-white">{user.country}</span>
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-950/40 border-amber-700/30 hover:bg-amber-900/30 text-amber-400"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedUserName(user.warrior_name);
                    setWarningDialogOpen(true);
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Warning
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedUserName(user.warrior_name);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <AlertDialogContent className="bg-black/90 border border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Warning to {selectedUserName}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This warning will be displayed to the user when they log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-4">
            <Textarea
              placeholder="Enter warning message"
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
              onClick={() => setWarningDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleSendWarning}
              disabled={!warningMessage.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Warning
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black/90 border border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              To delete <span className="font-semibold text-white">{selectedUserName}</span>, please enter the admin delete password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-4">
            <Input
              type="password"
              placeholder="Admin Delete Password"
              value={deleteUserPassword}
              onChange={(e) => setDeleteUserPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
            {deletePasswordError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle size={14} />
                {deletePasswordError}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={!deleteUserPassword || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersList;
