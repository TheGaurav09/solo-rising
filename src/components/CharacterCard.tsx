
import React from 'react';
import { Trophy } from 'lucide-react';
import { CharacterType } from '@/context/UserContext';

interface CharacterCardProps {
  type: CharacterType;
  name: string;
  title: string;
  count: number;
  tags: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const CharacterCard = ({ 
  type, 
  name, 
  title, 
  count, 
  tags, 
  isSelected, 
  onSelect 
}: CharacterCardProps) => {
  return (
    <div 
      className={`p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
        isSelected ? 'ring-2 ring-white bg-black/30' : 'bg-black/20 hover:bg-black/30'
      }`}
      onClick={onSelect}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-sm text-white/70">
        <Trophy size={14} className="text-yellow-500" />
        <span>{count}</span>
      </div>
      
      <img 
        src={`/${type}.jpeg`} 
        alt={name} 
        className="w-full h-64 object-cover rounded mb-4"
      />
      <h3 className="text-xl font-bold mb-1 text-white">{name}</h3>
      <p className="text-white mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="bg-black/30 text-xs px-2 py-1 rounded text-white">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default CharacterCard;
