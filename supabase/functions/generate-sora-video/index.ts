import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metadata } = await req.json();

    if (!metadata || !Array.isArray(metadata) || metadata.length === 0) {
      console.error('❌ No metadata provided');
      return new Response(
        JSON.stringify({ error: 'Metadata tags are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎬 Generating Sora video with metadata:', metadata);

    // Create a cinematic prompt from the metadata tags
    const prompt = `Create a cinematic, futuristic video that seamlessly blends the following themes: ${metadata.join(', ')}. The video should have a retro-futuristic aesthetic with clean, minimalist visuals. Include smooth transitions, ambient lighting, and a sense of hope for a sustainable future. Style: cinematic, 4K, professional color grading.`;

    console.log('📝 Sora prompt:', prompt);

    // Call OpenAI Sora API to generate video
    const response = await fetch('https://api.openai.com/v1/video/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora-2025-02-01',
        prompt: prompt,
        duration: 5, // 5 second video
        resolution: '1920x1080',
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sora API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Sora API error: ${response.status}`, details: errorText }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ Sora video generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        videoUrl: data.data?.[0]?.url || null,
        metadata: metadata 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-sora-video function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
