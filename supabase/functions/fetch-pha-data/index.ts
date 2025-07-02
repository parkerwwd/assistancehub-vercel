
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HUDPHARecord {
  pha_code: string;
  pha_name: string;
  pha_address: string;
  pha_city: string;
  pha_state: string;
  pha_zip: string;
  pha_phone: string;
  pha_email: string;
  pha_website: string;
  hcv_flag: string;
  // Add other fields as needed from HUD API
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const hudApiKey = Deno.env.get('HUD_API_KEY')
    if (!hudApiKey) {
      throw new Error('HUD API key not configured')
    }

    // Fetch PHA data from HUD API
    const hudResponse = await fetch(
      `https://data.hud.gov/data_catalog/PHA_Contact_Information.json?$top=5000&api_key=${hudApiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!hudResponse.ok) {
      throw new Error(`HUD API request failed: ${hudResponse.status}`)
    }

    const hudData = await hudResponse.json()
    console.log(`Fetched ${hudData.length} PHA records from HUD API`)

    // Process and insert/update PHA data
    let processedCount = 0
    let errorCount = 0

    for (const record of hudData) {
      try {
        // Normalize and clean the data
        const phaData = {
          pha_code: record.pha_code?.trim() || null,
          name: record.pha_name?.trim() || 'Unknown PHA',
          address: record.pha_address?.trim() || null,
          city: record.pha_city?.trim() || null,
          state: record.pha_state?.trim()?.substring(0, 2) || null,
          zip: record.pha_zip?.trim()?.substring(0, 10) || null,
          phone: record.pha_phone?.trim() || null,
          email: record.pha_email?.trim() || null,
          website: record.pha_website?.trim() || null,
          supports_hcv: record.hcv_flag === 'Y' || record.hcv_flag === 'YES',
          waitlist_status: 'Unknown', // Will be updated from other sources
          last_updated: new Date().toISOString()
        }

        // Upsert the record (insert or update if exists)
        const { error } = await supabaseClient
          .from('pha_agencies')
          .upsert(phaData, { 
            onConflict: 'pha_code',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error('Error upserting PHA record:', error)
          errorCount++
        } else {
          processedCount++
        }
      } catch (recordError) {
        console.error('Error processing PHA record:', recordError)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} PHA records, ${errorCount} errors`,
        processedCount,
        errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in fetch-pha-data function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
