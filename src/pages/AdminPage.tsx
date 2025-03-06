import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Search, Trash2, AlertTriangle, Send, Plus, ExternalLink, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  warrior_name: string;
  email: string;
  character_type: string;
}

interface Warning {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Supporter {
  id: string;
  name: string;
  amount: number;
  user_id: string | null;
  created_at?: string;
}

const ADMIN_EMAIL = "thegaurav.r@gmail.com";
const ADMIN_PASSWORD = "solo123";
const SUPABASE_URL = "https://xppaofqmxtaikkacvvzt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcGFvZnFteHRhaWtrYWN2dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTM0OTUsImV4cCI6MjA1NjcyOTQ5NX0.lI372EUlv0gCI8536_AbSd_kvSrsurZP7xx2DbyW7Dc";

const AdminPage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  
  const [newSupporterName, setNewSupporterName] = useState('');
  const [newSupporterAmount, setNewSupporterAmount] = useState('');
  const [newSupporterUserId, setNewSupporterUserId] = useState('');
  const [showHallOfFameDialog, setShowHallOfFameDialog] = useState(false);

  const authenticate = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && name === "Gaurav") {
      setAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      toast({
        title: "Authenticated",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    setAuthenticated(isAuth);
    
    if (isAuth) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, warrior_name, email, character_type');
      
      if (userError) throw userError;
      setUsers(userData || []);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          action: 'get_hall_of_fame',
        }),
      });
      
      const hallOfFameData = await response.json();
      if (hallOfFameData.error) throw new Error(hallOfFameData.error);
      setSupporters(hallOfFameData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          action: 'delete_user',
          data: { user_id: userId },
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          action: 'send_warning',
          data: {
            user_id: selectedUser.id,
            message: warningMessage,
            admin_email: ADMIN_EMAIL,
          },
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
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

  const handleAddToHallOfFame = async () => {
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          action: 'add_hall_of_fame',
          data: {
            name: newSupporterName,
            amount: amount,
            user_id: newSupporterUserId || null,
          },
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setSupporters([...supporters, result[0]]);
      setNewSupporterName('');
      setNewSupporterAmount('');
      setNewSupporterUserId('');
      setShowHallOfFameDialog(false);
      
      toast({
        title: "Supporter Added",
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
        title: "Supporter Removed",
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

  const filteredUsers = users.filter(user => 
    user.warrior_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
        <AnimatedCard className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Authentication</h1>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
                className="bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                className="bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                className="bg-white/5"
              />
            </div>
            <Button 
              onClick={authenticate} 
              className="w-full bg-goku-primary text-white hover:bg-goku-primary/80"
            >
              Login
            </Button>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gradient goku-gradient">Admin Panel</h1>
          <Button 
            onClick={() => {
              localStorage.removeItem('admin_authenticated');
              setAuthenticated(false);
            }}
            variant="outline" 
            className="bg-red-950/20 border-red-800/30 hover:bg-red-900/30 text-red-400"
          >
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="hall-of-fame">Hall of Fame</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
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
                            <h3 className="font-bold text-lg">
                              {user.warrior_name}
                            </h3>
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
            </AnimatedCard>
          </TabsContent>
          
          <TabsContent value="hall-of-fame" className="space-y-4">
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
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="bg-black/90 border border-white/20">
          <DialogHeader>
            <DialogTitle>Send Warning to {selectedUser?.warrior_name}</DialogTitle>
            <DialogDescription>
              This warning will be displayed as a notification to the user. They will be able to contact you via the provided admin email.
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
              <Send size={16} className="mr-2" />
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              onClick={handleAddToHallOfFame}
              className="bg-goku-primary hover:bg-goku-primary/80"
              disabled={!newSupporterName.trim() || !newSupporterAmount.trim()}
            >
              <Plus size={16} className="mr-2" />
              Add Supporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
