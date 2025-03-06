
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Share2, Plus, Search, Trash2, AlertTriangle, Send, ExternalLink, Trophy, Menu, X } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import UsersList from '@/components/admin/UsersList';
import HallOfFameList from '@/components/admin/HallOfFameList';
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
          
          <TabsContent value="users">
            <UsersList />
          </TabsContent>
          
          <TabsContent value="hall-of-fame">
            <HallOfFameList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
