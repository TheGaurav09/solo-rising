
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthFormProps {
  onAuthenticated: () => void;
}

const AuthForm = ({ onAuthenticated }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const authenticate = async () => {
    setLoading(true);
    try {
      const { data: secrets, error } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });

      if (error) throw error;

      if (email === secrets.ADMIN_EMAIL && 
          password === secrets.ADMIN_PASSWORD && 
          name === secrets.ADMIN_NAME) {
        localStorage.setItem('admin_authenticated', 'true');
        onAuthenticated();
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
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AuthForm;
