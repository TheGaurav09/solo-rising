
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';

interface AuthFormProps {
  onAuthenticated: () => void;
}

const AuthForm = ({ onAuthenticated }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = async () => {
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data: secrets, error } = await supabase.functions.invoke('auth-admin', {
        body: { action: 'get_secrets' }
      });

      if (error) {
        console.error('Error fetching admin secrets:', error);
        throw new Error('Failed to retrieve admin credentials');
      }

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
        setError('Invalid credentials. Please check your email, password, and name.');
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Failed to authenticate. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to authenticate. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
      <AnimatedCard className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Admin Authentication</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-md text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white block mb-1">Name</Label>
            <Input 
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white block mb-1">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white block mb-1">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : 'Login'}
          </Button>
        </form>
      </AnimatedCard>
    </div>
  );
};

export default AuthForm;
