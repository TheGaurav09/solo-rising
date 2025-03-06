
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Menu, Trophy, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersList from '@/components/admin/UsersList';
import HallOfFameList from '@/components/admin/HallOfFameList';
import MessagesList from '@/components/admin/MessagesList';
import AuthForm from '@/components/admin/AuthForm';

const AdminPage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    setAuthenticated(isAuth);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthForm onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gradient goku-gradient">Admin Panel</h1>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="bg-red-950/20 border-red-800/30 hover:bg-red-900/30 text-red-400"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-black/40 p-1 rounded-xl mb-4">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-goku-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <div className="flex items-center gap-2">
                <Menu size={18} />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="hall-of-fame" 
              className="data-[state=active]:bg-goku-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <div className="flex items-center gap-2">
                <Trophy size={18} />
                <span className="hidden sm:inline">Hall of Fame</span>
                <span className="sm:hidden">HoF</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-goku-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Msgs</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-0">
            <UsersList />
          </TabsContent>
          
          <TabsContent value="hall-of-fame" className="mt-0">
            <HallOfFameList />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <MessagesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
