
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { Mail, Lock, User, X } from 'lucide-react';

interface AuthModalProps {
  character: 'goku' | 'saitama' | 'jin-woo';
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ character, onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warriorName, setWarriorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast({
          title: 'Login successful',
          description: 'Welcome back to Workout Wars!',
        });
        onSuccess();
      } else {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Insert user info into our users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: authData.user?.id,
              email,
              password: 'hashed-by-supabase', // We don't store actual passwords
              warrior_name: warriorName,
              character_type: character
            },
          ]);

        if (insertError) throw insertError;

        toast({
          title: 'Sign up successful',
          description: 'Your warrior journey begins now!',
        });
        onSuccess();
      }
    } catch (e: any) {
      setError(e.message);
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradientClass = () => {
    switch (character) {
      case 'goku': return 'goku-gradient';
      case 'saitama': return 'saitama-gradient';
      case 'jin-woo': return 'jin-woo-gradient';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <AnimatedCard className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 text-center text-gradient ${getGradientClass()}`}>
            {isLogin ? 'Login to Continue' : 'Join Workout Wars'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="warriorName" className="block text-sm font-medium mb-2 text-white/80">
                  Warrior Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="warriorName"
                    type="text"
                    value={warriorName}
                    onChange={(e) => setWarriorName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                    placeholder="Choose a warrior name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/80">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/80">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}
            
            <AnimatedButton
              type="submit"
              disabled={loading}
              character={character}
              className="w-full py-3"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </AnimatedButton>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/60 hover:text-white text-sm"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AuthModal;
