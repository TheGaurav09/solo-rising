
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

  useEffect(() => {
    const fetchCharacterCounts = async () => {
      try {
        const { data: countData, error: countError } = await supabase
          .from('character_counts')
          .select('character_type, count');
        
        if (countError) {
          console.error("Error fetching character counts:", countError);
          return;
        }
        
        if (countData) {
          const counts: {[key: string]: number} = {
            goku: 0,
            saitama: 0,
            'jin-woo': 0
          };
          
          countData.forEach((item) => {
            counts[item.character_type] = item.count;
          });
          
          setCharacterCounts(counts);
        }
      } catch (error) {
        console.error("Error in fetchCharacterCounts:", error);
      }
    };
    
    fetchCharacterCounts();
    
    const subscription = supabase
      .channel('character_counts_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'character_counts'
        }, 
        (payload: any) => {
          if (payload.new) {
            setCharacterCounts(prev => ({
              ...prev,
              [payload.new.character_type]: payload.new.count
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Auto-move to signup when a character is selected
  useEffect(() => {
    if (selectedCharacter && onSignupClick) {
      onSignupClick();
    }
  }, [selectedCharacter, onSignupClick]);

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
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

  const howToUseSteps = [
    {
      title: "Create Your Account",
      description: "Sign up with your email and password to start your fitness journey.",
      icon: <User className="w-8 h-8 text-blue-400" />
    },
    {
      title: "Choose Your Character",
      description: "Select from Goku, Saitama, or Sung Jin-Woo to define your training style.",
      icon: <Heart className="w-8 h-8 text-red-400" />
    },
    {
      title: "Log Your Workouts",
      description: "Record your exercises, reps, and duration to earn points and track progress.",
      icon: <Dumbbell className="w-8 h-8 text-green-400" />
    },
    {
      title: "Complete Challenges",
      description: "Take on special challenges to earn extra points and unlock achievements.",
      icon: <Trophy className="w-8 h-8 text-yellow-400" />
    },
    {
      title: "Check the Leaderboard",
      description: "See how you rank against other warriors globally or in your country.",
      icon: <Users className="w-8 h-8 text-purple-400" />
    },
    {
      title: "Visit the Store",
      description: "Spend your earned coins on items to customize your experience.",
      icon: <ShieldCheck className="w-8 h-8 text-orange-400" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-6xl mx-auto px-4 py-10 min-h-screen flex flex-col justify-center">
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">SOLO RISING</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Choose your character to begin your journey to the top of the global leaderboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <CharacterCard
            name="Goku"
            label="Saiyans"
            description="Train like a Saiyan with incredible strength and endurance. Perfect for high-intensity workouts."
            character="goku"
            selected={selectedCharacter === 'goku'}
            onClick={() => handleCharacterClick('goku')}
            animationDelay="0.2s"
            count={characterCounts.goku}
            onCountClick={() => handleWarriorCountClick('goku')}
            imagePath="/goku.png"
          />
          
          <CharacterCard
            name="Saitama"
            label="Heroes"
            description="Follow the One Punch Man routine to achieve overwhelming power through consistent training."
            character="saitama"
            selected={selectedCharacter === 'saitama'}
            onClick={() => handleCharacterClick('saitama')}
            animationDelay="0.3s"
            count={characterCounts.saitama}
            onCountClick={() => handleWarriorCountClick('saitama')}
            imagePath="/saitama.png"
          />
          
          <CharacterCard
            name="Sung Jin-Woo"
            label="Hunters"
            description="Level up methodically like the Shadow Monarch, constantly pushing your limits to evolve."
            character="jin-woo"
            selected={selectedCharacter === 'jin-woo'}
            onClick={() => handleCharacterClick('jin-woo')}
            animationDelay="0.4s"
            count={characterCounts['jin-woo']}
            onCountClick={() => handleWarriorCountClick('jin-woo')}
            imagePath="/jin-woo.png"
          />
        </div>

        <div className="max-w-md mx-auto w-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <AnimatedButton
            onClick={() => {}}
            disabled={!selectedCharacter}
            character={selectedCharacter}
            className="w-full py-3 hover:scale-105 transition-transform duration-300"
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

        <div className="py-8 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">How to Use Solo Rising</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Follow these simple steps to get started on your anime-inspired fitness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howToUseSteps.map((step, index) => (
              <AnimatedCard key={index} className="p-6 border border-white/10 animated-border">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-white/10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">Step {index + 1}: {step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
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
  label: string;
  description: string;
  character: 'goku' | 'saitama' | 'jin-woo';
  selected: boolean;
  onClick: () => void;
  animationDelay: string;
  count: number;
  onCountClick: () => void;
  imagePath: string;
}

const CharacterCard = ({
  name,
  label,
  description,
  character,
  selected,
  onClick,
  animationDelay,
  count,
  onCountClick,
  imagePath
}: CharacterCardProps) => {
  const gradientClass = `${character}-gradient`;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay }}>
      <AnimatedCard
        active={selected}
        onClick={onClick}
        hoverEffect="glow"
        className={`h-full transition-all duration-300 hover:border hover:border-white/30 animated-border ${selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
      >
        <div className={`h-48 rounded-t-xl overflow-hidden flex items-center justify-center relative`}>
          <img 
            src={imagePath} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className={`text-6xl font-bold text-gradient ${gradientClass}`}>
              {name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-xl font-bold text-gradient ${gradientClass}`}>{name}</h3>
            <div 
              className="flex items-center text-sm cursor-pointer hover:text-white transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onCountClick();
              }}
            >
              <Users size={16} className="mr-1 text-white/60" />
              <span>{count} {label}</span>
            </div>
          </div>
          <p className="text-white/70 text-sm">{description}</p>
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {character === 'goku' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-goku-primary/20 text-goku-primary transition-colors duration-300 hover:bg-goku-primary/30 hover:scale-105">Strength</span>
                <span className="px-2 py-1 text-xs rounded-full bg-goku-secondary/20 text-goku-secondary transition-colors duration-300 hover:bg-goku-secondary/30 hover:scale-105">Endurance</span>
              </>
            )}
            
            {character === 'saitama' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-saitama-primary/20 text-saitama-primary transition-colors duration-300 hover:bg-saitama-primary/30 hover:scale-105">Consistency</span>
                <span className="px-2 py-1 text-xs rounded-full bg-saitama-secondary/20 text-saitama-secondary transition-colors duration-300 hover:bg-saitama-secondary/30 hover:scale-105">Power</span>
              </>
            )}
            
            {character === 'jin-woo' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-jin-woo-primary/20 text-jin-woo-primary transition-colors duration-300 hover:bg-jin-woo-primary/30 hover:scale-105">Leveling</span>
                <span className="px-2 py-1 text-xs rounded-full bg-jin-woo-secondary/20 text-jin-woo-accent transition-colors duration-300 hover:bg-jin-woo-secondary/30 hover:scale-105">Progression</span>
              </>
            )}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default CharacterSelection;
