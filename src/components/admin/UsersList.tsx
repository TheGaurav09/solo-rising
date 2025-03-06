import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Search, AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  warrior_name: string;
  email: string;
  character_type: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, warrior_name, email, character_type');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data: secrets } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });
      
      const password = prompt("Please enter the admin delete password to confirm:");
      if (password !== secrets.DELETE_USER_PASSWORD) {
        toast({
          title: "Unauthorized",
          description: "Incorrect delete password",
          variant: "destructive",
        });
        return;
      }
      
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        return;
      }

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: "User has been deleted",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage.trim()) return;
    
    try {
      const { data: secrets } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });

      const { error } = await supabase
        .from('warnings')
        .insert({
          user_id: selectedUser.id,
          message: warningMessage,
          read: false,
          admin_email: secrets.ADMIN_EMAIL // Add the admin_email from secrets
        });

      if (error) throw error;
      
      setWarningMessage('');
      setShowWarningDialog(false);
      
      toast({
        title: "Warning Sent",
        description: `Warning sent to ${selectedUser.warrior_name}`,
      });
    } catch (error) {
      console.error('Error sending warning:', error);
      toast({
        title: "Error",
        description: "Failed to send warning",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.warrior_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
          <Input 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredUsers.map(user => (
            <div key={user.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{user.warrior_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.character_type === 'goku' ? 'bg-goku-primary/20 text-goku-primary' :
                      user.character_type === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary' :
                      user.character_type === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary' :
                      'bg-white/20 text-white/80'
                    }`}>
                      {user.character_type}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/profile/${user.id}`} 
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                    target="_blank"
                    state={{ userId: user.id }}
                  >
                    <ExternalLink size={18} />
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowWarningDialog(true);
                    }}
                    className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
                  >
                    <AlertTriangle size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
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
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No users found</p>
        </div>
      )}

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="bg-black/90 border border-white/20">
          <DialogHeader>
            <DialogTitle>Send Warning to {selectedUser?.warrior_name}</DialogTitle>
            <DialogDescription>
              This warning will be displayed as a notification to the user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="warning-message">Warning Message</Label>
              <Textarea 
                id="warning-message"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter your warning message..."
                className="h-32 bg-white/5"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowWarningDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendWarning}
              className="bg-amber-500 hover:bg-amber-600 text-black"
              disabled={!warningMessage.trim()}
            >
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedCard>
  );
};

export default UsersList;
