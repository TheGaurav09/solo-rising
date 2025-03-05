
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import AuthModal from './AuthModal';
import { Award, User, Users, ChevronDown, Dumbbell, Trophy, ShieldCheck, BarChart2, HelpCircle, Heart, ArrowDown } from 'lucide-react';
import UsersList from './UsersList';
import { useNavigate } from 'react-router-dom';
import Footer from './ui/Footer';

const CharacterSelection = () => {
  const { setCharacter, setUserName } = useUser();
  const [selectedCharacter, setSelectedCharacter] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [characterCounts, setCharacterCounts] = useState<{[key: string]: number}>({
    goku: 0,
    saitama: 0,
    'jin-woo': 0
  });
  const [showUsersList, setShowUsersList] = useState<'goku' | 'saitama' | 'jin-woo' | null>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch character selection counts from the new table
    const fetchCharacterCounts = async () => {
      const { data, error } = await supabase
        .from('character_counts')
        .select('character_type, count');
      
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
      } else if (error) {
        console.error("Error fetching character counts:", error);
      }
    };
    
    fetchCharacterCounts();
    
    // Set up a subscription to real-time updates for character counts
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

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
  };

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (selectedCharacter) {
      setCharacter(selectedCharacter);
      // UserName will be set by the user context after login
      
      // Store in localStorage for faster loading next time
      localStorage.setItem('character', selectedCharacter);
      
      // Navigate to workouts page
      navigate('/workout');
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

  const features = [
    {
      title: "Personalized Workouts",
      description: "Train like your favorite anime character with tailored workout plans.",
      icon: <Dumbbell className="w-8 h-8 text-white/70" />
    },
    {
      title: "Global Leaderboard",
      description: "Compete with other warriors around the world and climb the ranks.",
      icon: <Trophy className="w-8 h-8 text-white/70" />
    },
    {
      title: "Achievement System",
      description: "Unlock achievements as you progress and showcase your milestones.",
      icon: <Award className="w-8 h-8 text-white/70" />
    },
    {
      title: "Streak Tracking",
      description: "Build and maintain workout streaks to boost your motivation.",
      icon: <BarChart2 className="w-8 h-8 text-white/70" />
    },
    {
      title: "In-App Store",
      description: "Earn coins and spend them on special items and power-ups.",
      icon: <ShieldCheck className="w-8 h-8 text-white/70" />
    },
    {
      title: "Community",
      description: "Connect with other fitness enthusiasts who share your passion.",
      icon: <Users className="w-8 h-8 text-white/70" />
    }
  ];

  const testimonials = [
    {
      name: "Alex K.",
      character: "goku",
      text: "Workout Wars transformed my fitness journey. Training like Goku has pushed me beyond my limits!"
    },
    {
      name: "Sarah J.",
      character: "saitama",
      text: "The Saitama routine is simple but effective. I've seen more progress in 3 months than my previous year at the gym."
    },
    {
      name: "Mike T.",
      character: "jin-woo",
      text: "I love how the app lets me level up methodically like Jin-Woo. The achievement system keeps me motivated every day."
    }
  ];

  const faqs = [
    {
      question: "How do I get started?",
      answer: "Choose your character, create an account, and start logging your workouts. The app will guide you through character-specific training programs."
    },
    {
      question: "Do I need gym equipment?",
      answer: "Not necessarily. Each character has bodyweight workout options that can be done at home with minimal equipment."
    },
    {
      question: "How does the leaderboard system work?",
      answer: "You earn points for completed workouts. Points are calculated based on workout intensity, duration, and consistency."
    },
    {
      question: "Can I change my character later?",
      answer: "Currently, character selection is permanent. We're working on a feature to allow character switching in the future."
    },
    {
      question: "What are coins used for?",
      answer: "Coins can be spent in the store to purchase boosts, cosmetic items, and special power-ups for your character."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-6xl mx-auto px-4 py-10 min-h-screen flex flex-col justify-center">
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">WORKOUT WARS</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Choose your character to begin your journey to the top of the global leaderboard
          </p>
          
          <button 
            onClick={scrollToFeatures} 
            className="mt-6 animate-bounce flex flex-col items-center text-white/50 hover:text-white transition-colors"
          >
            <span className="mb-1 text-sm">Discover More</span>
            <ArrowDown size={20} />
          </button>
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
            onClick={() => setShowAuthModal(true)}
            disabled={!selectedCharacter}
            character={selectedCharacter}
            className="w-full py-3 hover:scale-105 transition-transform duration-300"
          >
            Begin Your Journey
          </AnimatedButton>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">App Features</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Workout Wars combines fitness with anime-inspired training to make your workout journey exciting and rewarding
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <AnimatedCard key={index} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div ref={testimonialRef} className="py-16 bg-white/5 rounded-2xl p-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Warrior Testimonials</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Hear from other warriors who have transformed their fitness journey with Workout Wars
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="italic text-white/80 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${testimonial.character}-primary/20 mr-3`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className={`text-sm text-${testimonial.character}-primary`}>
                      {testimonial.character === 'goku' ? 'Saiyan Warrior' : 
                       testimonial.character === 'saitama' ? 'Caped Baldy' : 
                       'Shadow Monarch'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ Section */}
        <div ref={faqRef} className="py-16 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Got questions? We've got answers to help you get started
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <AnimatedCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-white/10 mt-1">
                      <HelpCircle size={16} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                      <p className="text-white/70">{faq.answer}</p>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {showAuthModal && selectedCharacter && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)} 
          initialView="signup"
        />
      )}

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
        className={`h-full transition-all duration-300 hover:border hover:border-white/30 ${selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
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
