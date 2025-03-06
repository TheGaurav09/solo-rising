
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminAuthFormProps {
  onAuthenticated: () => void;
}

const AdminAuthForm = ({ onAuthenticated }: AdminAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const authenticate = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: secrets, error: secretsError } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });

      if (secretsError) throw secretsError;

      if (email === secrets.ADMIN_EMAIL && 
          password === secrets.ADMIN_PASSWORD && 
          name === secrets.ADMIN_NAME) {
        localStorage.setItem('admin_authenticated', 'true');
        onAuthenticated();
        toast({
          title: "Success",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <AnimatedCard className="w-full max-w-md p-6" hoverEffect="none">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">Admin Authentication</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input 
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
              className="bg-input/5 text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              className="bg-input/5 text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              className="bg-input/5 text-foreground"
            />
          </div>
          <Button 
            onClick={authenticate} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AdminAuthForm;
