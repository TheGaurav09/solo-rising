
import React, { useState } from 'react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';

const CharacterSelection = () => {
  const { setCharacter, setUserName } = useUser();
  const [selectedCharacter, setSelectedCharacter] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const [name, setName] = useState('');
  const [isNameError, setIsNameError] = useState(false);

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setIsNameError(true);
      return;
    }

    if (!selectedCharacter) {
      return;
    }

    setUserName(name);
    setCharacter(selectedCharacter);
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
        />
        
        <CharacterCard
          name="Saitama"
          description="Follow the One Punch Man routine to achieve overwhelming power through consistent training."
          character="saitama"
          selected={selectedCharacter === 'saitama'}
          onClick={() => handleCharacterClick('saitama')}
          animationDelay="0.3s"
        />
        
        <CharacterCard
          name="Sung Jin-Woo"
          description="Level up methodically like the Shadow Monarch, constantly pushing your limits to evolve."
          character="jin-woo"
          selected={selectedCharacter === 'jin-woo'}
          onClick={() => handleCharacterClick('jin-woo')}
          animationDelay="0.4s"
        />
      </div>

      <div className="max-w-md mx-auto w-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/80">
            Enter Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsNameError(false);
            }}
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              isNameError ? 'border-red-500' : 'border-white/10'
            } focus:border-white/30 focus:outline-none transition-colors`}
            placeholder="Your warrior name"
          />
          {isNameError && (
            <p className="mt-1 text-sm text-red-500">Please enter your name</p>
          )}
        </div>

        <AnimatedButton
          onClick={handleSubmit}
          disabled={!selectedCharacter}
          character={selectedCharacter}
          className="w-full py-3"
        >
          Begin Your Journey
        </AnimatedButton>
      </div>
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
}

const CharacterCard = ({
  name,
  description,
  character,
  selected,
  onClick,
  animationDelay
}: CharacterCardProps) => {
  const gradientClass = `${character}-gradient`;
  const backgroundClass = `bg-${character}`;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay }}>
      <AnimatedCard
        active={selected}
        onClick={onClick}
        hoverEffect="glow"
        className={`h-full ${selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
      >
        <div className={`h-48 rounded-t-xl ${backgroundClass} animated-grid flex items-center justify-center`}>
          <div className={`text-6xl font-bold text-gradient ${gradientClass}`}>
            {name.charAt(0)}
          </div>
        </div>
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-2 text-gradient ${gradientClass}`}>{name}</h3>
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
