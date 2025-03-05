
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Send, User, Bot, MoreVertical, Sparkles, Brain, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestionTopic {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const AIChatPage: React.FC = () => {
  const { character, userName } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate welcome message based on character
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant' as const,
      content: getWelcomeMessage(),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [character, userName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getWelcomeMessage = () => {
    const name = userName || 'Warrior';
    
    switch(character) {
      case 'goku':
        return `Hey ${name}! I'm your Saiyan AI training assistant! Ready to push your limits and reach new power levels? Ask me anything about your training, or let me know how I can help you become stronger!`;
      case 'saitama':
        return `Oh, hey ${name}. I'm your One Punch AI assistant. Training is pretty simple actually - 100 push-ups, 100 sit-ups, 100 squats, and a 10km run. EVERY. SINGLE. DAY. But uh, what do you want to know?`;
      case 'jin-woo':
        return `Greetings, ${name}. I am your Shadow Monarch's AI assistant. Your journey to becoming the strongest hunter has begun. Ask me anything about leveling up your abilities or how to harness your true potential.`;
      default:
        return `Hello ${name}! I'm your AI training assistant. How can I help with your fitness journey today?`;
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      console.log("Sending message to AI chat function");
      
      // Call the Supabase Edge Function that uses Gemini API
      const response = await fetch('https://xppaofqmxtaikkacvvzt.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          character: character,
          previousMessages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });
      
      if (!response.ok) {
        console.error("AI response failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        throw new Error('AI response failed');
      }
      
      const data = await response.json();
      console.log("AI response received:", data);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message || "I'm sorry, I couldn't process that request right now. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: 'AI Error',
        description: 'There was an error communicating with the AI. Please try again.',
        variant: 'destructive'
      });
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const getCharacterColor = () => {
    switch(character) {
      case 'goku': return 'bg-goku-primary/20 text-goku-primary';
      case 'saitama': return 'bg-saitama-primary/20 text-saitama-primary';
      case 'jin-woo': return 'bg-jin-woo-primary/20 text-jin-woo-primary';
      default: return 'bg-primary/20 text-primary';
    }
  };
  
  // Suggestion topics
  const suggestionTopics: SuggestionTopic[] = [
    {
      icon: <Sparkles className={character === 'goku' ? 'text-goku-primary' : character === 'saitama' ? 'text-saitama-primary' : character === 'jin-woo' ? 'text-jin-woo-primary' : 'text-primary'} />,
      title: "Workout Optimization",
      subtitle: "Training Tips"
    },
    {
      icon: <Brain className={character === 'goku' ? 'text-goku-primary' : character === 'saitama' ? 'text-saitama-primary' : character === 'jin-woo' ? 'text-jin-woo-primary' : 'text-primary'} />,
      title: "Nutrition Advice",
      subtitle: "Power Foods"
    },
    {
      icon: <Target className={character === 'goku' ? 'text-goku-primary' : character === 'saitama' ? 'text-saitama-primary' : character === 'jin-woo' ? 'text-jin-woo-primary' : 'text-primary'} />,
      title: "Goal Setting",
      subtitle: "Achievement Plans"
    }
  ];
  
  // Handle suggestion click
  const handleSuggestionClick = (topic: string) => {
    const suggestions = {
      "Workout Optimization": "What's the best workout routine for building strength?",
      "Nutrition Advice": "What should I eat to maximize my training results?",
      "Goal Setting": "How can I set effective fitness goals?"
    };
    
    setInput(suggestions[topic as keyof typeof suggestions] || "");
    // Focus on input
    document.getElementById('chat-input')?.focus();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <div className="max-w-5xl mx-auto w-full">
        <AnimatedCard className="relative min-h-[80vh] p-0 overflow-hidden w-full">
          {/* Header */}
          <div className={`p-4 border-b border-white/10 ${character === 'goku' ? 'bg-goku-primary/10' : character === 'saitama' ? 'bg-saitama-primary/10' : character === 'jin-woo' ? 'bg-jin-woo-primary/10' : 'bg-primary/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCharacterColor()}`}>
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{character === 'goku' ? 'Saiyan AI' : character === 'saitama' ? 'Hero AI' : character === 'jin-woo' ? 'Shadow AI' : 'Training AI'}</h2>
                  <p className="text-sm text-white/60">Your personal training assistant</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-white/10">
                <MoreVertical size={20} className="text-white/60" />
              </button>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${getCharacterColor()}`}>
                        <Bot size={16} />
                      </div>
                    )}
                    <div>
                      <div 
                        className={`p-3 rounded-lg ${
                          message.role === 'user' 
                            ? `${character === 'goku' ? 'bg-goku-primary/20' : character === 'saitama' ? 'bg-saitama-primary/20' : character === 'jin-woo' ? 'bg-jin-woo-primary/20' : 'bg-primary/20'}`
                            : 'bg-white/10'
                        }`}
                      >
                        <p className="text-white">{message.content}</p>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white/20">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${getCharacterColor()}`}>
                      <Bot size={16} />
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestion cards - shown when no messages or at the beginning */}
          {messages.length <= 1 && (
            <div className="px-4 pb-4">
              <h3 className="text-white/70 text-sm mb-3">Suggested Topics:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestionTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-white/30 cursor-pointer transition-all hover-lift animated-border"
                    onClick={() => handleSuggestionClick(topic.title)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${character === 'goku' ? 'bg-goku-primary/20' : character === 'saitama' ? 'bg-saitama-primary/20' : character === 'jin-woo' ? 'bg-jin-woo-primary/20' : 'bg-primary/20'}`}>
                        {topic.icon}
                      </div>
                      <div>
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-xs text-white/60">{topic.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="border-t border-white/10 p-4 bg-black/20">
            <div className="flex items-center gap-2">
              <textarea
                id="chat-input"
                className="flex-1 bg-white/5 border border-white/20 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-white/30 min-h-[50px] max-h-[150px]"
                placeholder="Ask your training assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <button
                className={`p-3 rounded-full ${
                  character === 'goku' ? 'bg-goku-primary hover:bg-goku-primary/80' :
                  character === 'saitama' ? 'bg-saitama-primary hover:bg-saitama-primary/80' :
                  character === 'jin-woo' ? 'bg-jin-woo-primary hover:bg-jin-woo-primary/80' :
                  'bg-primary hover:bg-primary/80'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
            <div className="mt-2 text-xs text-white/40 text-center">
              Powered by {character === 'goku' ? 'Saiyan' : character === 'saitama' ? 'Hero' : character === 'jin-woo' ? 'Shadow' : 'Training'} AI Assistant
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default AIChatPage;
