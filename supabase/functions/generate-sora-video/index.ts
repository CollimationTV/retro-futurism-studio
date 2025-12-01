import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate unique retrieval code (BW-XXXX format)
function generateRetrievalCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BW-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Convert base64 video to blob for storage upload
async function uploadVideoToStorage(
  supabase: any,
  base64Data: string,
  retrievalCode: string
): Promise<string> {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:video\/mp4;base64,/, '');
  
  // Convert base64 to Uint8Array
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Upload to storage
  const fileName = `${retrievalCode}.mp4`;
  const { data, error } = await supabase.storage
    .from('generated-videos')
    .upload(fileName, bytes, {
      contentType: 'video/mp4',
      upsert: true
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('generated-videos')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metadata, apiKey, userEmail } = await req.json();

    if (!metadata || !Array.isArray(metadata) || metadata.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Metadata array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate unique retrieval code
    const retrievalCode = generateRetrievalCode();

    // Simplified prompt - take first 2 metadata tags
    const tags = metadata.slice(0, 2).join(', ');
    const prompt = `A cinematic 8-second video featuring: ${tags}. Retro-futuristic style, smooth motion, hopeful atmosphere.`;

    // Create job record in database
    const { data: job, error: insertError } = await supabase
      .from('video_generation_jobs')
      .insert({
        metadata,
        status: 'processing',
        retrieval_code: retrievalCode,
        user_email: userEmail || null,
        prompt_used: prompt,
        max_attempts: 180, // 15 minutes (180 × 5 seconds)
        poll_attempts: 0
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`🎬 Starting video generation for job ${job.id} with code ${retrievalCode}`);

    // Background task for video generation
    const backgroundTask = async () => {
      try {
        console.log(`📤 Calling Sora API with prompt: "${prompt}"`);

        // Call Sora API
        const soraResponse = await fetch('https://api.openai.com/v1/videos', {
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

        if (!soraResponse.ok) {
          const errorText = await soraResponse.text();
          throw new Error(`Sora API error: ${soraResponse.status} - ${errorText}`);
        }

        const soraData = await soraResponse.json();
        const jobId = soraData.id;

        console.log(`✅ Sora job created: ${jobId}`);

        // Update job with Sora job ID
        await supabase
          .from('video_generation_jobs')
          .update({ sora_job_id: jobId })
          .eq('id', job.id);

        // Poll for completion (15 minutes = 180 attempts × 5 seconds)
        let pollAttempts = 0;
        const maxAttempts = 180;
        let videoUrl = null;

        while (pollAttempts < maxAttempts && !videoUrl) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          pollAttempts++;

          console.log(`🔄 Polling attempt ${pollAttempts}/${maxAttempts} for job ${jobId}`);

          const statusResponse = await fetch(
            `https://api.openai.com/v1/videos/${jobId}`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );

          if (!statusResponse.ok) {
            console.error(`❌ Status check failed: ${statusResponse.status}`);
            continue;
          }

          const statusData = await statusResponse.json();
          
          // Update poll count and status in DB
          await supabase
            .from('video_generation_jobs')
            .update({ 
              poll_attempts: pollAttempts,
              sora_status: statusData.status 
            })
            .eq('id', job.id);

          if (statusData.status === 'completed') {
            console.log(`✅ Video generation complete!`);
            
            // Fetch video content
            const contentResponse = await fetch(
              `https://api.openai.com/v1/videos/${jobId}/content`,
              {
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                },
              }
            );

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
            
            const base64Video = `data:video/mp4;base64,${btoa(base64)}`;
            
            // Upload to storage
            const publicUrl = await uploadVideoToStorage(
              supabase,
              base64Video,
              retrievalCode
            );
            
            videoUrl = publicUrl;

            await supabase
              .from('video_generation_jobs')
              .update({
                status: 'completed',
                video_url: videoUrl,
                sora_status: 'completed'
              })
              .eq('id', job.id);

            console.log(`🎉 Video uploaded to storage: ${retrievalCode}.mp4`);
            break;
          } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
            throw new Error(`Sora job failed: ${statusData.error || 'Unknown error'}`);
          }
        }

        if (!videoUrl) {
          throw new Error(`Video generation timed out after 15 minutes (${pollAttempts} attempts)`);
        }

      } catch (error: any) {
        console.error('❌ Background task error:', error);
        await supabase
          .from('video_generation_jobs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', job.id);
      }
    };

    // Start background task
    (globalThis as any).EdgeRuntime?.waitUntil(backgroundTask());

    // Return immediately with job ID and retrieval code
    return new Response(
      JSON.stringify({ 
        jobId: job.id,
        retrievalCode: retrievalCode,
        message: 'Video generation started in background' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in generate-sora-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
