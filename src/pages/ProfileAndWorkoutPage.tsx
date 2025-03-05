import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Footer from '@/components/ui/Footer';

const ProfileAndWorkoutPage = () => {
  const { userName, character, xp, level, coins, updateUserProfile, updateCharacter } = useUser();
  const [newName, setNewName] = useState(userName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(character);
  const [isCharacterUpdating, setIsCharacterUpdating] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (userName) {
      setNewName(userName);
    }
  }, [userName]);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === userName) return;

    setIsUpdating(true);

    try {
      const success = await updateUserProfile(newName);
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your warrior name has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCharacterSelect = async (newCharacter: string) => {
    setSelectedCharacter(newCharacter);
    setIsCharacterUpdating(true);

    try {
      const success = await updateCharacter(newCharacter);
      if (success) {
        toast({
          title: "Character Updated",
          description: `Your character has been updated to ${newCharacter}.`,
        });
      }
    } catch (error) {
      console.error("Error updating character:", error);
      toast({
        title: "Character Update Failed",
        description: "Failed to update your character. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCharacterUpdating(false);
    }
  };

  const characterImages = {
    'goku': 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997a76c7d1039373b5a62359ca63_full.jpg',
    'saitama': 'https://i.pinimg.com/736x/3e/3c/95/3e3c959d20414905a3863f8c1895a958.jpg',
    'jin-woo': 'https://pbs.twimg.com/media/F8ipR0kWwAAjqoz.jpg'
  };

  const getCharacterColor = () => {
    switch (character) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const calculateLevelProgress = () => {
    const xpForCurrentLevel = level * 100;
    const xpForNextLevel = (level + 1) * 100;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
    return progress;
  };

  const progress = calculateLevelProgress();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile & Workout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warriorName">Warrior Name</Label>
              <Input
                id="warriorName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <AnimatedButton
              onClick={handleUpdateName}
              disabled={isUpdating || !newName.trim() || newName === userName}
              character={character || undefined}
            >
              {isUpdating ? 'Updating...' : 'Update Name'}
            </AnimatedButton>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Character</h2>

          <div className="flex items-center justify-center mb-4">
            <Avatar className={`w-32 h-32 border-4 ${getCharacterColor()}`}>
              <AvatarImage src={characterImages[selectedCharacter] || ''} alt={selectedCharacter} />
              <AvatarFallback>{selectedCharacter?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {Object.keys(characterImages).map((char) => (
              <AnimatedButton
                key={char}
                onClick={() => handleCharacterSelect(char)}
                disabled={isCharacterUpdating || char === selectedCharacter}
                className={`w-full ${char === selectedCharacter ? 'ring-2 ring-white' : ''}`}
                style={{ padding: '0.5rem' }}
              >
                {char.charAt(0).toUpperCase() + char.slice(1)}
              </AnimatedButton>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold">Level</div>
              <div className="text-2xl">{level}</div>
            </div>
            <div>
              <div className="text-sm font-bold">XP</div>
              <Progress value={progress} className="h-4" />
              <div className="text-sm text-white/70 mt-1">{xp} / {(level + 1) * 100}</div>
            </div>
            <div>
              <div className="text-sm font-bold">Coins</div>
              <div className="text-2xl">{coins}</div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Workout Calendar</h2>
          <Popover>
            <PopoverTrigger asChild>
              <AnimatedButton
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </AnimatedButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("2023-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </AnimatedCard>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileAndWorkoutPage;
