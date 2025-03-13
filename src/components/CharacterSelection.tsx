import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, CharacterType } from '@/context/UserContext';
import { ArrowRight, Check, Info, Mail, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import InfoTooltip from './ui/InfoTooltip';
import SectionCarousel from './ui/SectionCarousel';
import HowToUseCarousel from './ui/HowToUseCarousel';
import FeaturesCarousel from './ui/FeaturesCarousel';

interface CharacterSelectionProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  userId: string | null;
}

const CharacterSelection = ({ onLoginClick, onSignupClick, userId }: CharacterSelectionProps) => {
  const { setCharacter } = useUser();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Global');
  const [loading, setLoading] = useState(false);
  const [characterCounts, setCharacterCounts] = useState<Record<string, number>>({
    goku: 0,
    saitama: 0,
    'jin-woo': 0
  });

  useEffect(() => {
    const fetchCharacterCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('character_selection_counts')
          .select('character_type, count');
          
        if (error) throw error;
        
        const counts: Record<string, number> = {
          goku: 0,
          saitama: 0,
          'jin-woo': 0
        };
        
        if (data) {
          data.forEach(item => {
            if (item.character_type && counts.hasOwnProperty(item.character_type)) {
              counts[item.character_type] = item.count || 0;
            }
          });
        }
        
        setCharacterCounts(counts);
      } catch (error) {
        console.error('Error fetching character counts:', error);
      }
    };
    
    fetchCharacterCounts();
  }, []);

  const handleCharacterSelect = (character: CharacterType) => {
    setSelectedCharacter(character);
    
    const audio = new Audio(`/${character}.mp3');
    audio.volume = 0.3;
    audio.play().catch(error => console.error('Error playing audio:', error));
    
    setStep(2);
  };

  const incrementCharacterCount = async (character: CharacterType) => {
    try {
      const { data, error } = await supabase
        .from('character_counts')
        .select('count')
        .eq('character_type', character)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking character count:', error);
        return;
      }
      
      if (data) {
        const { error: updateError } = await supabase
          .from('character_counts')
          .update({ count: data.count + 1, updated_at: new Date().toISOString() })
          .eq('character_type', character);
          
        if (updateError) {
          console.error('Error updating character count:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('character_counts')
          .insert({ character_type: character, count: 1 });
          
        if (insertError) {
          console.error('Error inserting character count:', insertError);
        }
      }
    } catch (error) {
      console.error('Error incrementing character count:', error);
    }
  };

  const handleContinue = async () => {
    if (!selectedCharacter) return;
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your warrior name.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (userId) {
        const { error } = await supabase
          .from('users')
          .update({
            warrior_name: name,
            character_type: selectedCharacter,
            country
          })
          .eq('id', userId);
          
        if (error) throw error;
        
        const userData = {
          id: userId,
          warrior_name: name,
          character_type: selectedCharacter,
          country,
          points: 0,
          streak: 0
        };
        localStorage.setItem('sb-auth-data', JSON.stringify(userData));
        
        await incrementCharacterCount(selectedCharacter);
        
        setCharacter(selectedCharacter);
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          description: "Please sign up or log in to continue.",
          variant: "default",
        });
        onSignupClick();
      }
    } catch (error) {
      console.error('Error saving character selection:', error);
      toast({
        title: "Error",
        description: "Failed to save your character selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-5xl font-bold mb-2 text-gradient">SOLO RISING</h1>
          <p className="text-white/60">Embark on your solo fitness journey</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onLoginClick}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Log In
          </Button>
          <Button 
            onClick={onSignupClick}
            className="bg-white text-black hover:bg-white/90"
          >
            Sign Up
          </Button>
        </div>
      </div>
      
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Choose Your Character</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div 
              className={`p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
                selectedCharacter === 'goku' ? 'ring-2 ring-white bg-black/30' : 'bg-black/20 hover:bg-black/30'
              }`}
              onClick={() => handleCharacterSelect('goku')}
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-sm text-white/70">
                <Trophy size={14} className="text-yellow-500" />
                <span>{characterCounts.goku}</span>
              </div>
              
              <img 
                src="/goku.jpeg" 
                alt="Goku" 
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-bold mb-1 text-white">Goku</h3>
              <p className="text-white mb-3">Saiyan Warrior</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">High Energy</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Determined</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Enthusiastic</span>
              </div>
            </div>
            
            <div 
              className={`p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
                selectedCharacter === 'saitama' ? 'ring-2 ring-white bg-black/30' : 'bg-black/20 hover:bg-black/30'
              }`}
              onClick={() => handleCharacterSelect('saitama')}
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-sm text-white/70">
                <Trophy size={14} className="text-yellow-500" />
                <span>{characterCounts.saitama}</span>
              </div>
              
              <img 
                src="/saitama.jpeg" 
                alt="Saitama" 
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-bold mb-1 text-white">Saitama</h3>
              <p className="text-white mb-3">One-Punch Man</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Casual</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Straight-forward</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Laid-back</span>
              </div>
            </div>
            
            <div 
              className={`p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
                selectedCharacter === 'jin-woo' ? 'ring-2 ring-white bg-black/30' : 'bg-black/20 hover:bg-black/30'
              }`}
              onClick={() => handleCharacterSelect('jin-woo')}
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-sm text-white/70">
                <Trophy size={14} className="text-yellow-500" />
                <span>{characterCounts['jin-woo']}</span>
              </div>
              
              <img 
                src="/jinwoo.jpeg" 
                alt="Sung Jin-Woo" 
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-bold mb-1 text-white">Sung Jin-Woo</h3>
              <p className="text-white mb-3">Shadow Monarch</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Analytical</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Focused</span>
                <span className="bg-black/30 text-xs px-2 py-1 rounded text-white">Strategic</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">How to Use Solo Rising</h2>
            <HowToUseCarousel />
          </div>
          
          <div className="max-w-4xl mx-auto mb-20">
            <SectionCarousel 
              title="For Saiyans Who Push Beyond Limits" 
              description="Goku's training philosophy focuses on constantly surpassing your current level"
              imageSrc="/goku.jpeg"
              color="text-white"
              children={[]}
            />
          </div>
          
          <div className="max-w-4xl mx-auto mb-20">
            <SectionCarousel 
              title="For Heroes Who Train Consistently" 
              description="Saitama's approach proves that simple, consistent training yields extraordinary results"
              imageSrc="/saitama.jpeg"
              color="text-white"
              children={[]}
            />
          </div>
          
          <div className="max-w-4xl mx-auto mb-20">
            <SectionCarousel 
              title="For Hunters Who Level Up Daily" 
              description="Jin-Woo's methodical approach to becoming stronger through daily challenges"
              imageSrc="/jinwoo.jpeg"
              color="text-white"
              children={[]}
            />
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Features</h2>
            <FeaturesCarousel />
          </div>
        </>
      ) : (
        <div className="max-w-md mx-auto bg-black/40 p-8 rounded-lg border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-white">Create Your Warrior</h2>
          
          {selectedCharacter && (
            <div className="flex items-center mb-6">
              <img 
                src={`/${selectedCharacter}.jpeg`} 
                alt={selectedCharacter} 
                className="w-16 h-16 object-cover rounded-full mr-4"
              />
              <div>
                <div className="text-lg font-bold text-white">{
                  selectedCharacter === 'goku' ? 'Goku' :
                  selectedCharacter === 'saitama' ? 'Saitama' :
                  'Sung Jin-Woo'
                }</div>
                <div className="text-white/70">{
                  selectedCharacter === 'goku' ? 'Saiyan Warrior' :
                  selectedCharacter === 'saitama' ? 'One-Punch Man' :
                  'Shadow Monarch'
                }</div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-white/80">
              Warrior Name
            </label>
            <Input 
              placeholder="Enter your name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/30 border-white/20 text-white"
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-white/80">
                Country (Optional)
              </label>
              <InfoTooltip content="Your country will be shown on the leaderboard" />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 rounded bg-black/30 border border-white/20 text-white"
            >
              <option value="Global">Global</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="India">India</option>
              <option value="Brazil">Brazil</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="p-4 rounded bg-white/5 border border-white/10 mb-6">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Info size={18} className="text-white/60" />
              <div>
                <p>By continuing, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setStep(1)}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
            <Button 
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
              disabled={loading}
            >
              {loading ? (
                <>Loading...</>
              ) : userId ? (
                <>
                  Continue <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Sign Up to Continue <Lock size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
