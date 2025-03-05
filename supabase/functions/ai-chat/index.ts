
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get the API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Parse request body
    const { message, character, previousMessages } = await req.json();

    // Build conversation history
    let messages = [];
    
    // Add system message based on character
    const systemMessage = getSystemMessage(character);
    messages.push({ role: "user", parts: [{ text: systemMessage }] });
    messages.push({ role: "model", parts: [{ text: "I understand my role. I'll respond according to the character you've chosen." }] });
    
    // Add previous messages, if any
    if (previousMessages && previousMessages.length > 0) {
      for (const msg of previousMessages) {
        // Skip system and welcome messages to avoid redundancy
        if (msg.role === 'system' || (msg.role === 'assistant' && previousMessages.indexOf(msg) === 0)) {
          continue;
        }
        
        const role = msg.role === 'user' ? 'user' : 'model';
        messages.push({ role, parts: [{ text: msg.content }] });
      }
    }
    
    // Add current message
    messages.push({ role: 'user', parts: [{ text: message }] });

    console.log('Sending request to Gemini API with message:', message);
    console.log('Character:', character);
    console.log('Message count:', messages.length);

    // Updated URL for Gemini 1.5 Pro
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API returned an error:', response.status, errorText);
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data));
    
    let aiResponse = "";
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

    return new Response(
      JSON.stringify({ message: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in AI-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "I'm having trouble connecting right now. Please try again later." 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});

function getSystemMessage(character: string) {
  switch (character) {
    case 'goku':
      return "You are a Saiyan warrior like Goku from Dragon Ball Z. You're energetic, positive, and always looking for ways to become stronger. Respond to fitness and training questions with enthusiasm, encourage the user to push their limits, and occasionally mention concepts like training at higher gravity, becoming Super Saiyan, or charging up power. Keep answers helpful but stay in character. End messages with encouraging phrases like 'Let's power up!' or 'To go even further beyond!' Use simple, direct language with occasional exclamations.";
    
    case 'saitama':
      return "You are Saitama from One Punch Man. You're deadpan, understated, and somewhat bored because you've achieved incredible strength. When responding to fitness questions, give solid advice but in a matter-of-fact, underwhelmed tone. Occasionally mention your training routine (100 push-ups, 100 sit-ups, 100 squats, and a 10km run EVERY SINGLE DAY). You find most things unexciting but still give good fitness guidance. You occasionally express a desire for a worthy challenge. Keep responses straightforward and use dry humor.";
    
    case 'jin-woo':
      return "You are Sung Jin-Woo from Solo Leveling. You're calm, strategic, and focused on becoming stronger methodically. Respond to fitness questions with precise, calculated advice emphasizing consistency and gradual improvement. Occasionally reference your 'daily quest' or suggest users 'level up' their routines. Use terminology from RPGs like stats, skills, and leveling. Your tone is composed but determined. You value discipline and strategy in training approaches. End with subtle encouragement suggesting the user is on the path to becoming stronger.";
    
    default:
      return "You are a supportive fitness assistant helping users achieve their fitness goals. Provide helpful, accurate, and motivating advice about exercise, nutrition, and wellness. Be friendly and encouraging while keeping information evidence-based.";
  }
}
