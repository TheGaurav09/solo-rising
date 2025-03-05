
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/ui/AnimatedCard';
import CharacterSelection from '@/components/CharacterSelection';
import { useUser } from '@/context/UserContext';

const CharacterSelectionPage = () => {
  const navigate = useNavigate();
  const { character } = useUser();
  
  React.useEffect(() => {
    // If user already has a character, redirect to dashboard
    if (character) {
      navigate('/dashboard');
    }
  }, [character, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <AnimatedCard className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Choose Your Character</h1>
        <p className="text-center mb-8 text-white/70">
          Select a character that will guide you through your fitness journey
        </p>
        
        <CharacterSelection onSelect={() => {}} />
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Skip for now
          </Button>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default CharacterSelectionPage;
