
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
import CharacterCard from './CharacterCard';
import CharacterCreationForm from './CharacterCreationForm';
// Import the CharacterSelectionStep component that we'll be using
import CharacterSelectionStep from './CharacterSelectionStep';

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
    
    const audio = new Audio(`/${character}.mp3`);
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
        <CharacterSelectionStep 
          characterCounts={characterCounts}
          selectedCharacter={selectedCharacter}
          onCharacterSelect={handleCharacterSelect}
        />
      ) : (
        <CharacterCreationForm
          selectedCharacter={selectedCharacter}
          name={name}
          setName={setName}
          country={country}
          setCountry={setCountry}
          loading={loading}
          onBack={() => setStep(1)}
          onContinue={handleContinue}
          userId={userId}
        />
      )}
    </div>
  );
};

export default CharacterSelection;
