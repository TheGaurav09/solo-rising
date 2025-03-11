
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useUser, CharacterType } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, Info, Loader2 } from 'lucide-react';
import { countries, Country } from './Countries';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warriorName, setWarriorName] = useState('');
  const [country, setCountry] = useState('');
  const [countryError, setCountryError] = useState('');
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { character, setUserData } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  
  const validateForm = () => {
    let isValid = true;
    
    setLoginError('');
    setCountryError('');
    
    if (view === 'signup' && !country) {
      setCountryError('Please select your country');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!character) {
      toast({
        title: "No Character Selected",
        description: "Please select a character before signing up",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setLoginError('');
    
    try {
      console.log("Attempting to sign up with email:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            character_type: character,
            warrior_name: warriorName,
            country: country
          }
        }
      });
      
      if (error) {
        console.error("Sign up error", error);
        throw error;
      }
      
      if (data.user) {
        console.log("User created, creating profile:", data.user.id);
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            warrior_name: warriorName,
            character_type: character,
            country: country,
            points: 0,
            streak: 0,
            coins: 100,
            xp: 0,
            level: 1,
            password: '******'
          });
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
        
        setUserData(warriorName, character, 0, 0, 100, country, 0, 1);
        
        toast({
          title: "Account created!",
          description: "Welcome to Solo Rising. Your journey begins now!",
        });
        
        onClose();
        navigate('/profile-workout');
      }
    } catch (error: any) {
      console.error('Sign up error', error);
      setLoginError(error.message || 'An error occurred during sign up');
      
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      console.log("Attempting to login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("User logged in, fetching profile:", data.user.id);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (userError) {
          console.error("User data fetch error:", userError);
          throw userError;
        }
        
        if (userData) {
          console.log("User profile found:", userData);
          localStorage.setItem('sb-auth-token', 'true'); // Set token in localStorage for faster auth checks
          
          setUserData(
            userData.warrior_name,
            userData.character_type as CharacterType,
            userData.points,
            userData.streak || 0,
            userData.coins || 0,
            userData.country || 'Global',
            userData.xp || 0,
            userData.level || 1
          );
          
          toast({
            title: "Welcome back!",
            description: `Logged in as ${userData.warrior_name}`,
          });
          
          onClose();
          navigate('/profile-workout');
        } else {
          console.error("No user profile found despite successful login");
          setLoginError("User profile not found. Please contact support.");
        }
      }
    } catch (error: any) {
      console.error('Login error', error);
      setLoginError(error.message || 'Invalid email or password');
      
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setLoginError('');
    setCountryError('');
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 bg-black border border-white/10 text-white rounded-lg">
        <DialogTitle className="text-xl font-bold mb-4">
          {view === 'login' ? 'Login to Solo Rising' : 'Create your Account'}
        </DialogTitle>
        
        {loginError && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-md mb-4 text-sm">
            {loginError}
          </div>
        )}
        
        <form onSubmit={view === 'login' ? handleLogin : handleSignUp} className="space-y-4">
          {view === 'signup' && (
            <>
              <div className="space-y-2">
                <label htmlFor="warriorName" className="block text-sm font-medium text-white/90">
                  Warrior Name
                </label>
                <Input
                  id="warriorName"
                  placeholder="Enter your warrior name"
                  value={warriorName}
                  onChange={(e) => setWarriorName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-white/90">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCountryError('');
                  }}
                  required
                  className={`w-full p-2 rounded-md bg-white/5 border ${
                    countryError ? 'border-red-500' : 'border-white/10'
                  } text-white`}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                {countryError && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <Info size={12} />
                    {countryError}
                  </p>
                )}
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white/90">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 focus:outline-none"
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${
                character === 'goku' ? 'bg-goku-primary hover:bg-goku-primary/80' :
                character === 'saitama' ? 'bg-saitama-primary hover:bg-saitama-primary/80' :
                character === 'jin-woo' ? 'bg-jin-woo-primary hover:bg-jin-woo-primary/80' :
                'bg-white/10 hover:bg-white/20'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : view === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-sm text-white/60">
          {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleView}
            className="text-white hover:underline focus:outline-none"
          >
            {view === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
