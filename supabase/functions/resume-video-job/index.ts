import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the job record to get sora_job_id
    const { data: job, error: jobError } = await supabase
      .from('video_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('❌ Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!job.sora_job_id) {
      console.error('❌ No sora_job_id found for job:', jobId);
      return new Response(
        JSON.stringify({ error: 'No Sora job ID found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Resuming polling for Sora job: ${job.sora_job_id}`);

    // Start background polling task
    const backgroundTask = async () => {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
      const maxPollingTime = 900000; // 15 minutes
      const pollInterval = 5000; // 5 seconds
      const startTime = Date.now();
      let pollAttempts = job.poll_attempts || 0;

      while (Date.now() - startTime < maxPollingTime) {
        pollAttempts++;

        try {
          // Check Sora job status
          const statusResponse = await fetch(`https://api.openai.com/v1/videos/${job.sora_job_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
          });

          const statusData = await statusResponse.json();
          console.log(`🔄 Resume poll attempt ${pollAttempts}: ${statusData.status}`);

          // Update database with current status
          await supabase
            .from('video_generation_jobs')
            .update({ 
              poll_attempts: pollAttempts,
              sora_status: statusData.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', jobId);

          if (statusData.status === 'completed' && statusData.output?.url) {
            console.log('✅ Sora generation completed, fetching video...');

            // Fetch the video
            const videoResponse = await fetch(statusData.output.url);
            const videoBlob = await videoResponse.arrayBuffer();
            const base64Video = btoa(String.fromCharCode(...new Uint8Array(videoBlob)));

            // Upload to storage
            const fileName = `${job.retrieval_code}.mp4`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('generated-videos')
              .upload(fileName, videoBlob, {
                contentType: 'video/mp4',
                upsert: true
              });

            if (uploadError) {
              console.error('❌ Upload error:', uploadError);
              await supabase
                .from('video_generation_jobs')
                .update({ 
                  status: 'failed',
                  error_message: `Upload failed: ${uploadError.message}`
                })
                .eq('id', jobId);
              return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('generated-videos')
              .getPublicUrl(fileName);

            console.log('✅ Video uploaded successfully:', publicUrl);

            // Update job as completed
            await supabase
              .from('video_generation_jobs')
              .update({ 
                status: 'completed',
                video_url: publicUrl,
                poll_attempts: pollAttempts,
                sora_status: 'completed'
              })
              .eq('id', jobId);

            return;
          } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
            console.error(`❌ Sora job ${statusData.status}`);
            await supabase
              .from('video_generation_jobs')
              .update({ 
                status: 'failed',
                error_message: `Sora job ${statusData.status}`,
                poll_attempts: pollAttempts,
                sora_status: statusData.status
              })
              .eq('id', jobId);
            return;
          }

          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error: any) {
          console.error('❌ Resume polling error:', error);
          await supabase
            .from('video_generation_jobs')
            .update({ 
              poll_attempts: pollAttempts,
              error_message: `Resume polling error: ${error.message}`
            })
            .eq('id', jobId);
        }
      }

      // Timeout
      console.error('⏱️ Resume polling timeout reached');
      await supabase
        .from('video_generation_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Resume polling timeout after 15 minutes',
          poll_attempts: pollAttempts
        })
        .eq('id', jobId);
    };

    // Start background task
    EdgeRuntime.waitUntil(backgroundTask());

    // Return immediately
    return new Response(
      JSON.stringify({ success: true, message: 'Resume polling started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Resume function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
