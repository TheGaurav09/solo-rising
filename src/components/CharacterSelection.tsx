import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';
import { useUser } from '@/context/UserContext';
import { Award, User, Users, ChevronDown, ChevronUp, Dumbbell, Trophy, ShieldCheck, BarChart2, Heart, ArrowRight, ArrowLeft, Circle, CircleDot } from 'lucide-react';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const sections = [
    { id: 'howToUse', title: 'How to Use Solo Prove' },
    { id: 'features', title: 'App Features' },
    { id: 'testimonials', title: 'Warrior Testimonials' }
  ];

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

  const handleCharacterClick = (character: 'goku' | 'saitama' | 'jin-woo') => {
    setSelectedCharacter(character);
  };

  const handleAuthClick = () => {
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

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const nextSection = () => {
    setCurrentSection((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
  };

  const prevSection = () => {
    setCurrentSection((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
  };

  const features = [
    {
      title: "Personalized Workouts",
      description: "Train like your favorite anime character with tailored workout plans.",
      icon: <Dumbbell className="w-8 h-8 text-white/70" />,
      color: "blue"
    },
    {
      title: "Global Leaderboard",
      description: "Compete with other warriors around the world and climb the ranks.",
      icon: <Trophy className="w-8 h-8 text-white/70" />,
      color: "yellow"
    },
    {
      title: "Achievement System",
      description: "Unlock achievements as you progress and showcase your milestones.",
      icon: <Award className="w-8 h-8 text-white/70" />,
      color: "purple"
    },
    {
      title: "Streak Tracking",
      description: "Build and maintain workout streaks to boost your motivation.",
      icon: <BarChart2 className="w-8 h-8 text-white/70" />,
      color: "green"
    },
    {
      title: "In-App Store",
      description: "Earn coins and spend them on special items and power-ups.",
      icon: <ShieldCheck className="w-8 h-8 text-white/70" />,
      color: "orange"
    },
    {
      title: "Community",
      description: "Connect with other fitness enthusiasts who share your passion.",
      icon: <Users className="w-8 h-8 text-white/70" />,
      color: "pink"
    }
  ];

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

  const testimonials = [
    {
      name: "Alex K.",
      character: "goku",
      text: "Solo Prove transformed my fitness journey. Training like Goku has pushed me beyond my limits!"
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
    },
    {
      question: "How do I track my progress?",
      answer: "Your progress is tracked automatically as you log workouts. You can view your history, achievements, and stats on your profile page."
    },
    {
      question: "Can I compete with my friends?",
      answer: "Yes! You can share your profile with friends and compare rankings on the global or country-specific leaderboards."
    }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">How to Use Solo Prove</h2>
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
        );
      case 1:
        return (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">App Features</h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Solo Prove combines fitness with anime-inspired training to make your workout journey exciting and rewarding
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <AnimatedCard key={index} className="p-6 border border-white/10 animated-border">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 p-3 rounded-full bg-${feature.color}-500/20`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="py-8 bg-white/5 rounded-2xl p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Warrior Testimonials</h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Hear from other warriors who have transformed their fitness journey with Solo Prove
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10 animated-border">
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-6xl mx-auto px-4 py-10 min-h-screen flex flex-col justify-center">
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">SOLO PROVE</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Choose your character to begin your journey to the top of the global leaderboard
          </p>
          
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} 
            className="mt-10 animate-bounce flex flex-col items-center text-white/50 hover:text-white transition-colors"
          >
            <span className="mb-1 text-sm">Learn More</span>
            <ArrowDown width={20} height={20} />
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
            onClick={handleAuthClick}
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

        <div className="mt-16 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{sections[currentSection].title}</h2>
            {!isMobile && (
              <div className="flex space-x-4">
                <button 
                  onClick={prevSection}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous section"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={nextSection}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next section"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
          
          <div className="overflow-hidden">
            <div 
              className="transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentSection * 100}%)` }}
            >
              {renderCurrentSection()}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-2">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className="focus:outline-none"
                aria-label={`Go to section ${index + 1}`}
              >
                {currentSection === index ? (
                  <CircleDot size={16} className="text-white" />
                ) : (
                  <Circle size={16} className="text-white/40" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="py-10 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Got questions? We've got answers to help you get started
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-2">
                <AnimatedCard 
                  className={`p-4 border ${openFaqIndex === index ? 'border-white/30' : 'border-white/10'} hover:border-white/20 transition-colors duration-300 animated-border`}
                >
                  <button 
                    onClick={() => toggleFaq(index)} 
                    className="flex items-start justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-bold">{faq.question}</h3>
                    <div className="ml-4 flex-shrink-0 mt-1">
                      {openFaqIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {openFaqIndex === index && (
                    <p className="text-white/70 mt-2 pt-2 border-t border-white/10">{faq.answer}</p>
                  )}
                </AnimatedCard>
              </div>
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

const ArrowDown = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || 24}
      height={props.height || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
};

export default CharacterSelection;
