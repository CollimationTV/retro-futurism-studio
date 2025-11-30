import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Received request to generate-sora-video');

    const { metadata, apiKey } = await req.json();
    
    if (!apiKey) {
      console.error('❌ No API key provided in request');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required. Please set your API key in the application.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!metadata || !Array.isArray(metadata) || metadata.length === 0) {
      console.error('❌ No metadata provided');
      return new Response(
        JSON.stringify({ error: 'Metadata tags are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎬 Generating Sora video with metadata:', metadata);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from("video_generation_jobs")
      .insert({
        metadata: metadata,
        status: 'processing'
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('❌ Failed to create job record:', jobError);
      return new Response(
        JSON.stringify({ error: 'Failed to create job record' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Created job record:', job.id);

    // Start background task for video generation
    const backgroundTask = async () => {
      try {
        // Create a cinematic prompt from the metadata tags
        const prompt = `Create a cinematic, futuristic video that seamlessly blends the following themes: ${metadata.join(', ')}. The video should have a retro-futuristic aesthetic with clean, minimalist visuals. Include smooth transitions, ambient lighting, and a sense of hope for a sustainable future. Style: cinematic, 4K, professional color grading.`;

        console.log('📝 Sora prompt:', prompt);

        // Step 1: Start video generation job with Sora 2 Pro
        const createResponse = await fetch('https://api.openai.com/v1/videos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sora-2-pro',
            prompt: prompt,
            size: '1280x720',
            seconds: '8',
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('❌ Sora API create error:', createResponse.status, errorText);
          
          await supabase
            .from("video_generation_jobs")
            .update({
              status: 'failed',
              error_message: `Sora API error: ${createResponse.status} - ${errorText}`
            })
            .eq('id', job.id);
          
          return;
        }

        const createData = await createResponse.json();
        const videoId = createData.id;
        console.log('🎥 Video job started with ID:', videoId);

        // Update job with Sora job ID
        await supabase
          .from("video_generation_jobs")
          .update({ sora_job_id: videoId })
          .eq('id', job.id);

        // Step 2: Poll for completion
        const maxAttempts = 60;
        let attempts = 0;
        let videoUrl = null;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;

          const statusResponse = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });

          if (!statusResponse.ok) {
            console.error('❌ Status check error:', statusResponse.status);
            continue;
          }

          const statusData = await statusResponse.json();
          console.log(`📊 Status check ${attempts}/${maxAttempts}:`, statusData.status);

          if (statusData.status === 'completed') {
            // Fetch the video content
            const contentResponse = await fetch(`https://api.openai.com/v1/videos/${videoId}/content`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            });

            if (!contentResponse.ok) {
              throw new Error('Failed to fetch video content');
            }

            const videoBlob = await contentResponse.blob();
            const arrayBuffer = await videoBlob.arrayBuffer();
            
            const uint8Array = new Uint8Array(arrayBuffer);
            let base64 = '';
            const chunkSize = 0x8000;
            
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, i + chunkSize);
              base64 += String.fromCharCode.apply(null, Array.from(chunk));
            }
            
            videoUrl = `data:video/mp4;base64,${btoa(base64)}`;
            
            console.log('✅ Video generation completed');
            
            // Update job with completed video
            await supabase
              .from("video_generation_jobs")
              .update({
                status: 'completed',
                video_url: videoUrl
              })
              .eq('id', job.id);
            
            break;
          } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
            console.error('❌ Video generation failed:', statusData);
            
            await supabase
              .from("video_generation_jobs")
              .update({
                status: 'failed',
                error_message: `Video generation ${statusData.status}`
              })
              .eq('id', job.id);
            
            return;
          }
        }

        if (!videoUrl) {
          console.error('❌ Video generation timed out');
          await supabase
            .from("video_generation_jobs")
            .update({
              status: 'failed',
              error_message: 'Video generation timed out after 5 minutes'
            })
            .eq('id', job.id);
        }

      } catch (error) {
        console.error('❌ Background task error:', error);
        await supabase
          .from("video_generation_jobs")
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', job.id);
      }
    };

    // Start background task
    (globalThis as any).EdgeRuntime?.waitUntil(backgroundTask());

    // Return immediately with job ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Video generation started'
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-sora-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred during video generation.'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
