
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Award, User, Users, Dumbbell, Trophy, ShieldCheck, Heart } from 'lucide-react';
import UsersList from './UsersList';
import { useNavigate } from 'react-router-dom';
import Footer from './ui/Footer';
import { useMediaQuery } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';
import HowToUseCarousel from './ui/HowToUseCarousel';
import FAQs from './FAQs';

const CharacterSelection = ({ onLoginClick, onSignupClick, userId }: { 
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  userId?: string | null;
}) => {
  const { setCharacter } = useUser();
  const [selectedCharacter, setSelectedCharacter] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const [characterCounts, setCharacterCounts] = useState<{[key: string]: number}>({
    goku: 0,
    saitama: 0,
    'jin-woo': 0
  });
  const [showUsersList, setShowUsersList] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacterCounts = async () => {
      try {
        const { data: gokuCount, error: gokuError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('character_type', 'goku');
        
        const { data: saitamaCount, error: saitamaError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('character_type', 'saitama');
        
        const { data: jinWooCount, error: jinWooError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('character_type', 'jin-woo');
        
        if (gokuError || saitamaError || jinWooError) {
          console.error("Error fetching character counts:", gokuError || saitamaError || jinWooError);
          return;
        }
        
        setCharacterCounts({
          goku: gokuCount?.length || 0,
          saitama: saitamaCount?.length || 0,
          'jin-woo': jinWooCount?.length || 0
        });
      } catch (error) {
        console.error("Error in fetchCharacterCounts:", error);
      }
    };
    
    fetchCharacterCounts();
    
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users'
        }, 
        () => {
          fetchCharacterCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
    setCharacter(character);
  };

  const handleBeginJourney = () => {
    if (!selectedCharacter) {
      toast({
        title: "No Character Selected",
        description: "Please select a character to begin your journey",
        variant: "destructive",
      });
      return;
    }
    
    if (onSignupClick) {
      onSignupClick();
    }
  };

  const getCharacterLabel = (character: 'goku' | 'saitama' | 'jin-woo') => {
    switch (character) {
      case 'goku': return 'Saiyans';
      case 'saitama': return 'Heroes';
      case 'jin-woo': return 'Hunters';
      default: return '';
    }
  };

  const handleWarriorCountClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setShowUsersList(character);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#FF6B00]">SOLO RISING</h1>
          <p className="text-white/70 mt-2">
            Choose your character to begin your journey to the top of the global leaderboard
          </p>
        </div>

        <div className={`grid ${!isMobile ? 'grid-cols-3 gap-6' : 'grid-cols-1 gap-4'} mb-6`}>
          <CharacterCard
            name="Goku"
            description="Train like a Saiyan with incredible strength and endurance. Perfect for high-intensity workouts."
            character="goku"
            selected={selectedCharacter === 'goku'}
            onClick={() => handleCharacterClick('goku')}
            count={characterCounts.goku}
            onCountClick={() => handleWarriorCountClick('goku')}
            isMobile={isMobile}
          />
          
          <CharacterCard
            name="Saitama"
            description="Follow the One Punch Man routine to achieve overwhelming power through consistent training."
            character="saitama"
            selected={selectedCharacter === 'saitama'}
            onClick={() => handleCharacterClick('saitama')}
            count={characterCounts.saitama}
            onCountClick={() => handleWarriorCountClick('saitama')}
            isMobile={isMobile}
          />
          
          <CharacterCard
            name="Sung Jin-Woo"
            description="Level up methodically like the Shadow Monarch, constantly pushing your limits to evolve."
            character="jin-woo"
            selected={selectedCharacter === 'jin-woo'}
            onClick={() => handleCharacterClick('jin-woo')}
            count={characterCounts['jin-woo']}
            onCountClick={() => handleWarriorCountClick('jin-woo')}
            isMobile={isMobile}
          />
        </div>

        <div className="mt-4 mb-6">
          <AnimatedButton
            onClick={handleBeginJourney}
            disabled={!selectedCharacter}
            character={selectedCharacter}
            className="w-full py-3 bg-[#F97316] text-white"
          >
            Begin Your Journey
          </AnimatedButton>
          
          <div className="mt-4 text-center">
            <button 
              onClick={onLoginClick} 
              className="text-white/70 hover:text-white transition-colors"
            >
              Already have an account? Login
            </button>
          </div>
        </div>

        <div className="mt-10">
          <FeaturesCarousel />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white mb-4">How To Use</h2>
          <HowToUseCarousel />
        </div>
        
        <div className="mt-10">
          <FAQs />
        </div>
      </div>

      <Footer />

      {showUsersList && (
        <UsersList 
          character={showUsersList} 
          onClose={() => setShowUsersList(null)}
          label={getCharacterLabel(showUsersList)}
        />
      )}
    </div>
  );
};

interface CharacterCardProps {
  name: string;
  description: string;
  character: 'goku' | 'saitama' | 'jin-woo';
  selected: boolean;
  onClick: () => void;
  count: number;
  onCountClick: () => void;
  isMobile: boolean;
}

const CharacterCard = ({
  name,
  description,
  character,
  selected,
  onClick,
  count,
  onCountClick,
  isMobile
}: CharacterCardProps) => {
  const getCharacterGradient = () => {
    switch (character) {
      case 'goku':
        return 'from-orange-500 to-blue-600';
      case 'saitama':
        return 'from-yellow-500 to-red-600';
      case 'jin-woo':
        return 'from-purple-500 to-indigo-800';
      default:
        return 'from-gray-500 to-gray-800';
    }
  };

  const getCharacterLabel = () => {
    switch (character) {
      case 'goku': return 'Saiyans';
      case 'saitama': return 'Heroes';
      case 'jin-woo': return 'Hunters';
      default: return '';
    }
  };

  if (isMobile) {
    // Mobile character card design
    return (
      <div 
        className={`rounded-xl overflow-hidden border ${selected ? 'border-white' : 'border-white/20'} transition-all duration-300 animate-fade-in`}
        onClick={onClick}
      >
        <div className="flex">
          <div className={`w-20 h-20 flex items-center justify-center bg-gradient-to-br ${getCharacterGradient()} relative overflow-hidden`}>
            <img 
              src={`/${character}.jpeg`} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            <span className="text-4xl font-bold text-white relative z-10">{name.charAt(0)}</span>
          </div>
          <div className="p-3 flex-1">
            <div className="flex justify-between">
              <h3 className="font-bold text-white">{name}</h3>
              <div 
                className="text-xs text-white/60 flex items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onCountClick();
                }}
              >
                <Users size={12} className="mr-1" />
                <span>{count}</span>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-1">{description}</p>
            <div className="flex space-x-2 mt-2">
              <button className={`text-xs px-2 py-0.5 rounded-full ${character === 'goku' ? 'bg-orange-500/20 text-orange-400' : character === 'saitama' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {character === 'goku' ? 'Strength' : character === 'saitama' ? 'Consistency' : 'Progression'}
              </button>
              <button className={`text-xs px-2 py-0.5 rounded-full ${character === 'goku' ? 'bg-blue-500/20 text-blue-400' : character === 'saitama' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {character === 'goku' ? 'Power' : character === 'saitama' ? 'Power' : 'Leveling'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop/tablet character card design (bigger cards)
  return (
    <AnimatedCard 
      className={`rounded-xl overflow-hidden border ${selected ? 'border-white' : 'border-white/20'} transition-all duration-300 cursor-pointer h-full hover:scale-[1.02]`}
      onClick={onClick}
    >
      <div className="p-0">
        <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${getCharacterGradient()}`}>
          <img 
            src={`/${character}.jpeg`} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white drop-shadow-lg">{name.charAt(0)}</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <div 
              className="text-sm text-white/70 flex items-center cursor-pointer hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCountClick();
              }}
            >
              <Users size={14} className="mr-1" />
              <span>{count}</span>
            </div>
          </div>
          
          <p className="text-sm text-white/70 mb-4">{description}</p>
          
          <div className="flex space-x-2">
            <span className={`text-xs px-3 py-1 rounded-full ${character === 'goku' ? 'bg-orange-500/20 text-orange-400' : character === 'saitama' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
              {character === 'goku' ? 'Strength' : character === 'saitama' ? 'Consistency' : 'Progression'}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full ${character === 'goku' ? 'bg-blue-500/20 text-blue-400' : character === 'saitama' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {character === 'goku' ? 'Power' : character === 'saitama' ? 'Power' : 'Leveling'}
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default CharacterSelection;
