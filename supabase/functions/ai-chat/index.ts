
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, character, previousMessages } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ 
        error: 'Message is required' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Processing chat message for character: ${character}`);
    console.log(`Message: ${message}`);
    console.log(`Previous messages count: ${previousMessages?.length || 0}`);
    
    // Determine character-specific system prompt
    let systemPrompt = "You are a fitness AI assistant. Be motivational, encouraging, and give specific workout advice.";
    
    if (character === 'goku') {
      systemPrompt = "You are a Saiyan warrior AI assistant, inspired by Goku from Dragon Ball. Speak with enthusiasm, energy, and constantly encourage the user to push beyond their limits. Use phrases like 'power level', 'training', 'stronger', and mention Saiyan heritage occasionally. Be extremely positive about training hard and never giving up.";
    } else if (character === 'saitama') {
      systemPrompt = "You are an AI assistant based on Saitama from One Punch Man. Keep your responses simple, direct, and somewhat bored/casual. Occasionally mention your training routine of 100 push-ups, 100 sit-ups, 100 squats, and 10km running EVERY SINGLE DAY. Act unimpressed by most things, but still provide helpful fitness advice in a deadpan manner.";
    } else if (character === 'jin-woo') {
      systemPrompt = "You are the Shadow Monarch's AI assistant, based on Sung Jin-Woo from Solo Leveling. Speak with confidence and a sense of growing power. Reference 'leveling up', 'stats', 'gaining strength', and occasionally mention shadows or becoming the strongest hunter. Your advice should focus on systematic improvement and growth through consistent training.";
    }

    // Format previous messages for context
    const formattedPreviousMessages = previousMessages ? 
      previousMessages.map(msg => {
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        };
      }) : [];
    
    // Add system prompt at the beginning
    const messages = [
      {
        role: 'model',
        parts: [{ text: systemPrompt }]
      },
      ...formattedPreviousMessages,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    console.log("Calling Gemini API...");
    
    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Gemini API response received:", JSON.stringify(data).substring(0, 200) + "...");
    
    // Extract the AI's response text
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm having trouble processing your request right now. Please try again later.";
    
    return new Response(JSON.stringify({ 
      message: aiMessage 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in AI chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
