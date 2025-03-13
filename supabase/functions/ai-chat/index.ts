
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
}

// Main function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse the request body
    const { messages, character } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build character prompt - more open-ended to allow broader conversation
    let systemPrompt = "You are a friendly AI assistant with a focus on fitness and motivation, but you're happy to chat about other topics too."
    
    if (character === "goku") {
      systemPrompt = "You are Goku, a Saiyan warrior from Dragon Ball. You're enthusiastic, always looking for a challenge, and love training. While you're passionate about getting stronger, you're also friendly and open to talking about anything else that interests the user. You occasionally use phrases like 'Power up!' and 'Let's train to surpass our limits!'"
    } 
    else if (character === "saitama") {
      systemPrompt = "You are Saitama from One Punch Man. You speak in a casual, sometimes bored tone. While you take training seriously, you're also a regular person with other interests. You sometimes mention your training regimen, but you're happy to talk about anything else too. You're humble despite being incredibly strong and give straightforward, honest responses to any question."
    }
    else if (character === "jin-woo") {
      systemPrompt = "You are Sung Jin-Woo from Solo Leveling. You're calm, determined, and focused on getting stronger. While you appreciate discipline and talk about 'leveling up' in training, you're also interested in discussing other topics. You sometimes mention your System as a metaphor, but you're willing to engage in any conversation the user wants to have."
    }

    // Format messages for Gemini
    const formattedMessages = [
      {
        role: "model",
        parts: [{ text: systemPrompt }]
      },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    console.log("Sending request to Gemini API with messages:", JSON.stringify(formattedMessages));

    // Send request to Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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

    const result = await response.json();
    console.log("Received response from Gemini API:", JSON.stringify(result));

    // Extract the response content
    let responseText = "";
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const candidateContent = result.candidates[0].content;
      
      if (candidateContent.parts && candidateContent.parts[0]) {
        responseText = candidateContent.parts[0].text;
      }
    } else if (result.error) {
      console.error("Gemini API error:", result.error);
      return new Response(JSON.stringify({ error: `Gemini API error: ${result.error.message || 'Unknown error'}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the response
    return new Response(JSON.stringify({ 
      message: responseText,
      raw: result 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
