
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const faqItems = [
    {
      question: "What is Solo Rising?",
      answer: "Solo Rising is an anime-inspired fitness app that helps you track your workouts, earn points, and compete on global leaderboards. You can choose a character from popular anime to represent your training style."
    },
    {
      question: "How do I earn points?",
      answer: "Points are earned by logging workouts, maintaining streaks, completing challenges, and achieving specific milestones. The more consistently you work out, the more points you'll accumulate."
    },
    {
      question: "Can I change my character after selecting one?",
      answer: "No, once you've selected a character, it becomes a permanent part of your profile. This choice represents your fitness journey and training style."
    },
    {
      question: "What do coins do?",
      answer: "Coins can be spent in the in-app store to purchase special items, unlock cosmetic features, and customize your experience within Solo Rising."
    },
    {
      question: "How does the streak system work?",
      answer: "You earn streak points by logging workouts on consecutive days. The longer your streak, the more bonus points you'll receive. Missing a day will reset your streak."
    },
    {
      question: "Is there a limit to how many workouts I can log per day?",
      answer: "You can log multiple workouts per day, but there's a cooldown period of 3 hours between workouts to ensure balanced training and prevent misuse."
    },
    {
      question: "How do I compete with others?",
      answer: "Your points automatically place you on the global and country leaderboards. Check the Leaderboard page to see your rank compared to other users worldwide or in your country."
    }
  ];

  return (
    <div className="py-8 px-4 md:px-0">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-white/70 max-w-xl mx-auto">
          Everything you need to know about Solo Rising
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10">
              <AccordionTrigger className="text-left text-lg hover:text-white/90 py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/70 pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQs;
