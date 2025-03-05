
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedButton from './ui/AnimatedButton';
import { toast } from './ui/use-toast';
import { X, Mail, Lock, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// List of countries for selection in alphabetical order with flags
const countries = [
  { name: "Global", flag: "🌎" },
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Vietnam", flag: "🇻🇳" }
];

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: { 
  isOpen: boolean; 
  onClose: () => void;
  initialView?: 'login' | 'signup';
}) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [loading, setLoading] = useState(false);
  const { setCharacter, setUserName, setCountry } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  if (!isOpen) return null;

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user data from our database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      // Set user data in context
      setCharacter(userData.character_type as 'goku' | 'saitama' | 'jin-woo');
      setUserName(userData.warrior_name);
      if (userData.country) {
        setCountry(userData.country);
      }
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${userData.warrior_name}`,
      });
      
      onClose();
      navigate('/workout');
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string, country: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Insert user data into our database - fixing the character_type constraint issue
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            warrior_name: name,
            character_type: 'none', // Set a valid default value that matches the constraint
            password: password,  // Include the password field as required
            country: country,
            points: 0,
            coins: 10, // Start with 10 coins
          });

        if (insertError) throw insertError;

        setUserName(name);
        setCountry(country);
        
        toast({
          title: 'Account created!',
          description: 'Please select your character to continue.',
        });
        
        onClose();
        navigate('/character-selection');
      }
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-lg bg-background border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{view === 'login' ? 'Login' : 'Create Account'}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {view === 'login' ? (
            <LoginForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <SignupForm onSubmit={handleSignup} loading={loading} />
          )}

          <div className="mt-6 text-center">
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm text-white/60 hover:text-white transition-colors">
              {view === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onSubmit, loading }: { onSubmit: (email: string, password: string) => void; loading: boolean }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(email, password);
    }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <AnimatedButton
          type="submit"
          disabled={loading}
          className="w-full flex justify-center"
        >
          {loading ? 'Logging in...' : 'Login'}
        </AnimatedButton>
      </div>
    </form>
  );
};

const SignupForm = ({ onSubmit, loading, character }: { 
  onSubmit: (email: string, password: string, name: string, country: string) => void; 
  loading: boolean;
  character?: 'goku' | 'saitama' | 'jin-woo';
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Global');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(email, password, name, country);
    }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Warrior Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg"
              placeholder="Your warrior name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Country</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-white/40" />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-white/5 border border-white/10 text-white focus:ring-primary focus:border-primary block w-full pl-10 py-3 rounded-lg appearance-none"
            >
              {countries.map((countryOption) => (
                <option key={countryOption.name} value={countryOption.name}>
                  {countryOption.flag} {countryOption.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <AnimatedButton
          type="submit"
          disabled={loading}
          character={character}
          className="w-full flex justify-center"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </AnimatedButton>
      </div>
    </form>
  );
};

export default AuthModal;
