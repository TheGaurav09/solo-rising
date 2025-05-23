
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  
  const faqs = [
    {
      id: 'what-is-solorising',
      question: 'What is Solo Rising?',
      answer: 'Solo Rising is an anime-inspired fitness tracking app that helps you stay motivated through character roleplay, daily challenges, leaderboards, and a unique progression system.'
    },
    {
      id: 'how-earn-points',
      question: 'How do I earn points?',
      answer: 'You earn points by completing workouts and daily challenges. More difficult workouts and longer streaks earn more points, boosting your position on the global leaderboard.'
    },
    {
      id: 'change-character',
      question: 'Can I change my character after selection?',
      answer: 'Currently, character selection is permanent. We recommend choosing a character that aligns with your fitness goals and personality.'
    },
    {
      id: 'coins-use',
      question: 'What do coins do?',
      answer: 'Coins are earned through workouts and can be spent in the Store to unlock special items, custom themes, and bonus training features.'
    },
    {
      id: 'streak-system',
      question: 'How does the streak system work?',
      answer: 'Complete at least one workout every day to maintain your streak. Missing a day resets your streak to zero and deducts 50 points from your total score.'
    },
    {
      id: 'workouts-limit',
      question: 'Is there a limit to how many workouts I can log per day?',
      answer: 'You can log up to 3 workouts per day that count toward your points total. This encourages consistency rather than overtraining.'
    },
    {
      id: 'compete',
      question: 'How do I compete with others?',
      answer: 'Your completed workouts automatically add points to your total score, which determines your position on the global and character-specific leaderboards.'
    }
  ];
  
  const toggleItem = (id: string) => {
    if (openItem === id) {
      setOpenItem(null);
    } else {
      setOpenItem(id);
    }
  };

  return (
    <div className="space-y-3 border border-white/10 rounded-xl p-4 backdrop-blur-sm bg-black/20">
      <h2 className="text-xl font-bold text-white mb-4">FAQ</h2>
      
      {faqs.map((faq) => (
        <div 
          key={faq.id}
          className="border-b border-white/10 last:border-none"
        >
          <button
            className="w-full py-3 text-left flex justify-between items-center"
            onClick={() => toggleItem(faq.id)}
          >
            <span className="font-medium text-white">{faq.question}</span>
            <motion.div
              animate={{ rotate: openItem === faq.id ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={18} className="text-white/60" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openItem === faq.id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pb-3 text-white/70 text-sm">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default FAQs;
