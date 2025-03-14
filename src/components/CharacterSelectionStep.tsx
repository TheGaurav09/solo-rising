
import React from 'react';
import { CharacterType } from '@/context/UserContext';
import { Trophy } from 'lucide-react';
import SectionCarousel from './ui/SectionCarousel';
import HowToUseCarousel from './ui/HowToUseCarousel';
import FeaturesCarousel from './ui/FeaturesCarousel';
import CharacterCard from './CharacterCard';

interface CharacterSelectionStepProps {
  characterCounts: Record<string, number>;
  selectedCharacter: CharacterType | null;
  onCharacterSelect: (character: CharacterType) => void;
}

const CharacterSelectionStep = ({ 
  characterCounts, 
  selectedCharacter, 
  onCharacterSelect 
}: CharacterSelectionStepProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Choose Your Character</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <CharacterCard
          type="goku"
          name="Goku"
          title="Saiyan Warrior"
          count={characterCounts.goku}
          tags={['High Energy', 'Determined', 'Enthusiastic']}
          isSelected={selectedCharacter === 'goku'}
          onSelect={() => onCharacterSelect('goku')}
        />
        
        <CharacterCard
          type="saitama"
          name="Saitama"
          title="One-Punch Man"
          count={characterCounts.saitama}
          tags={['Casual', 'Straight-forward', 'Laid-back']}
          isSelected={selectedCharacter === 'saitama'}
          onSelect={() => onCharacterSelect('saitama')}
        />
        
        <CharacterCard
          type="jin-woo"
          name="Sung Jin-Woo"
          title="Shadow Monarch"
          count={characterCounts['jin-woo']}
          tags={['Analytical', 'Focused', 'Strategic']}
          isSelected={selectedCharacter === 'jin-woo'}
          onSelect={() => onCharacterSelect('jin-woo')}
        />
      </div>
      
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">How to Use Solo Rising</h2>
        <HowToUseCarousel />
      </div>
      
      <div className="max-w-4xl mx-auto mb-20">
        <SectionCarousel 
          title="For Saiyans Who Push Beyond Limits" 
          imageSrc="/goku.jpeg"
          color="text-white"
        >
          <p className="text-white/80">Goku's training philosophy focuses on constantly surpassing your current level</p>
        </SectionCarousel>
      </div>
      
      <div className="max-w-4xl mx-auto mb-20">
        <SectionCarousel 
          title="For Heroes Who Train Consistently" 
          imageSrc="/saitama.jpeg"
          color="text-white"
        >
          <p className="text-white/80">Saitama's approach proves that simple, consistent training yields extraordinary results</p>
        </SectionCarousel>
      </div>
      
      <div className="max-w-4xl mx-auto mb-20">
        <SectionCarousel 
          title="For Hunters Who Level Up Daily" 
          imageSrc="/jinwoo.jpeg"
          color="text-white"
        >
          <p className="text-white/80">Jin-Woo's methodical approach to becoming stronger through daily challenges</p>
        </SectionCarousel>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Features</h2>
        <FeaturesCarousel />
      </div>
    </>
  );
};

export default CharacterSelectionStep;
