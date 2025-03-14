
import React from 'react';
import { CharacterType } from '@/context/UserContext';
import { ArrowRight, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InfoTooltip from './ui/InfoTooltip';

interface CharacterCreationFormProps {
  selectedCharacter: CharacterType | null;
  name: string;
  setName: (name: string) => void;
  country: string;
  setCountry: (country: string) => void;
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
  userId: string | null;
}

const CharacterCreationForm = ({
  selectedCharacter,
  name,
  setName,
  country,
  setCountry,
  loading,
  onBack,
  onContinue,
  userId
}: CharacterCreationFormProps) => {
  const getCharacterName = () => {
    if (selectedCharacter === 'goku') return 'Goku';
    if (selectedCharacter === 'saitama') return 'Saitama';
    return 'Sung Jin-Woo';
  };
  
  const getCharacterTitle = () => {
    if (selectedCharacter === 'goku') return 'Saiyan Warrior';
    if (selectedCharacter === 'saitama') return 'One-Punch Man';
    return 'Shadow Monarch';
  };

  return (
    <div className="max-w-md mx-auto bg-black/40 p-8 rounded-lg border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white">Create Your Warrior</h2>
      
      {selectedCharacter && (
        <div className="flex items-center mb-6">
          <img 
            src={`/${selectedCharacter}.jpeg`} 
            alt={getCharacterName()} 
            className="w-16 h-16 object-cover rounded-full mr-4"
          />
          <div>
            <div className="text-lg font-bold text-white">{getCharacterName()}</div>
            <div className="text-white/70">{getCharacterTitle()}</div>
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
          onClick={onBack}
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
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
  );
};

export default CharacterCreationForm;
