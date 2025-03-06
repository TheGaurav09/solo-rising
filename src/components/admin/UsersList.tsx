import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
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
import { Search, Trash2, AlertTriangle } from 'lucide-react';

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
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUserPassword, setDeleteUserPassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const navigate = useNavigate();

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
      user.warrior_name.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    setDeletePasswordError('');

    try {
      const { data: secrets, error: secretsError } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });

      if (secretsError) {
        console.error('Error fetching admin secrets:', secretsError);
        setDeletePasswordError('Failed to fetch admin secrets');
        return;
      }

      if (deleteUserPassword !== secrets.DELETE_USER_PASSWORD) {
        setDeletePasswordError('Incorrect password');
        return;
      }

      const { error } = await supabase.auth.admin.deleteUser(selectedUserId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      // Also delete the user from the public.users table
      const { error: publicUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUserId);

      if (publicUserError) {
        console.error('Error deleting user from public.users:', publicUserError);
        toast({
          title: "Error",
          description: "Failed to delete user data",
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
      toast({
        title: "Error",
        description: "Unexpected error deleting user",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
      setDeleteUserPassword('');
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`, { state: { fromAdmin: true } });
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
                className="text-white/80 hover:text-white"
                onClick={() => handleViewProfile(user.id)}
              >
                View Profile
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

            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setWarningDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this user from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setWarningDialogOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        setWarningDialogOpen(false);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Admin Password</AlertDialogTitle>
            <AlertDialogDescription>
              To confirm, please enter the admin password to delete this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Input
              type="password"
              placeholder="Admin Password"
              value={deleteUserPassword}
              onChange={(e) => setDeleteUserPassword(e.target.value)}
            />
            {deletePasswordError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle size={14} />
                {deletePasswordError}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={!deleteUserPassword}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersList;
