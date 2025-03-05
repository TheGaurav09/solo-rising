
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import AuthModal from './AuthModal';
import { Award, User, Users } from 'lucide-react';

const CharacterSelection = () => {
  const { setCharacter, setUserName } = useUser();
  const [selectedCharacter, setSelectedCharacter] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [characterCounts, setCharacterCounts] = useState<{[key: string]: number}>({
    goku: 0,
    saitama: 0,
    'jin-woo': 0
  });

  useEffect(() => {
    // Fetch character selection counts from the database
    const fetchCharacterCounts = async () => {
      const { data, error } = await supabase
        .from('character_selection_counts')
        .select('*');
      
      if (data && !error) {
        const counts: {[key: string]: number} = {
          goku: 0,
          saitama: 0,
          'jin-woo': 0
        };
        
        data.forEach((item) => {
          counts[item.character_type] = item.count;
        });
        
        setCharacterCounts(counts);
      }
    };
    
    fetchCharacterCounts();
  }, []);

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (selectedCharacter) {
      setCharacter(selectedCharacter);
      // UserName will be set by the user context after login
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">WORKOUT WARS</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Choose your character to begin your journey to the top of the global leaderboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <CharacterCard
          name="Goku"
          description="Train like a Saiyan with incredible strength and endurance. Perfect for high-intensity workouts."
          character="goku"
          selected={selectedCharacter === 'goku'}
          onClick={() => handleCharacterClick('goku')}
          animationDelay="0.2s"
          count={characterCounts.goku}
          imagePath="/saitama.jpg"
        />
        
        <CharacterCard
          name="Saitama"
          description="Follow the One Punch Man routine to achieve overwhelming power through consistent training."
          character="saitama"
          selected={selectedCharacter === 'saitama'}
          onClick={() => handleCharacterClick('saitama')}
          animationDelay="0.3s"
          count={characterCounts.saitama}
          imagePath="/goku.jpeg"
        />
        
        <CharacterCard
          name="Sung Jin-Woo"
          description="Level up methodically like the Shadow Monarch, constantly pushing your limits to evolve."
          character="jin-woo"
          selected={selectedCharacter === 'jin-woo'}
          onClick={() => handleCharacterClick('jin-woo')}
          animationDelay="0.4s"
          count={characterCounts['jin-woo']}
          imagePath="/jin-woo.png"
        />
      </div>

      <div className="max-w-md mx-auto w-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <AnimatedButton
          onClick={() => setShowAuthModal(true)}
          disabled={!selectedCharacter}
          character={selectedCharacter}
          className="w-full py-3"
        >
          Begin Your Journey
        </AnimatedButton>
      </div>

      {showAuthModal && selectedCharacter && (
        <AuthModal 
          character={selectedCharacter} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess}
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
  animationDelay: string;
  count: number;
  imagePath: string;
}

const CharacterCard = ({
  name,
  description,
  character,
  selected,
  onClick,
  animationDelay,
  count,
  imagePath
}: CharacterCardProps) => {
  const gradientClass = `${character}-gradient`;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay }}>
      <AnimatedCard
        active={selected}
        onClick={onClick}
        hoverEffect="glow"
        className={`h-full ${selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
      >
        <div className={`h-48 rounded-t-xl overflow-hidden flex items-center justify-center relative`}>
          <img 
            src={imagePath} 
            alt={name} 
            className="w-full h-full object-cover"
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
            <div className="flex items-center text-sm">
              <Users size={16} className="mr-1 text-white/60" />
              <span>{count} warriors</span>
            </div>
          </div>
          <p className="text-white/70 text-sm">{description}</p>
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {character === 'goku' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-goku-primary/20 text-goku-primary">Strength</span>
                <span className="px-2 py-1 text-xs rounded-full bg-goku-secondary/20 text-goku-secondary">Endurance</span>
              </>
            )}
            
            {character === 'saitama' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-saitama-primary/20 text-saitama-primary">Consistency</span>
                <span className="px-2 py-1 text-xs rounded-full bg-saitama-secondary/20 text-saitama-secondary">Power</span>
              </>
            )}
            
            {character === 'jin-woo' && (
              <>
                <span className="px-2 py-1 text-xs rounded-full bg-jin-woo-primary/20 text-jin-woo-primary">Leveling</span>
                <span className="px-2 py-1 text-xs rounded-full bg-jin-woo-secondary/20 text-jin-woo-accent">Progression</span>
              </>
            )}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default CharacterSelection;
