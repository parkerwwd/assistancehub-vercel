import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const mapboxToken = process.env.VITE_MAPBOX_TOKEN;

if (!supabaseUrl || !supabaseKey || !mapboxToken) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1&country=US&types=address,poi`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

async function geocodeSpecificPHAs(searchTerm) {
  try {
    // Find PHAs without coordinates matching the search term
    const { data: phas, error } = await supabase
      .from('pha_agencies')
      .select('*')
      .or('latitude.is.null,longitude.is.null')
      .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('Error fetching PHAs:', error);
      return;
    }

    // Filter to only those without coordinates
    const phasToGeocode = phas.filter(pha => !pha.latitude || !pha.longitude);
    
    if (phasToGeocode.length === 0) {
      console.log(`✅ All PHAs matching "${searchTerm}" already have coordinates!`);
      return;
    }

    console.log(`\n🗺️  Found ${phasToGeocode.length} PHAs matching "${searchTerm}" that need geocoding\n`);
    
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < phasToGeocode.length; i++) {
      const pha = phasToGeocode[i];
      console.log(`📍 [${i + 1}/${phasToGeocode.length}] Geocoding: ${pha.name}`);
      
      if (!pha.address) {
        console.log('   ❌ No address available');
        failed++;
        continue;
      }
      
      // Build full address for better results
      let fullAddress = pha.address;
      if (pha.city && pha.state) {
        fullAddress = `${pha.address}, ${pha.city}, ${pha.state}`;
      }
      
      console.log(`   Address: ${fullAddress}`);
      
      const coords = await geocodeAddress(fullAddress);
      
      if (coords) {
        // Update the PHA with coordinates
        const { error: updateError } = await supabase
          .from('pha_agencies')
          .update({ 
            latitude: coords.latitude,
            longitude: coords.longitude
          })
          .eq('id', pha.id);
        
        if (updateError) {
          console.log(`   ❌ Failed to update: ${updateError.message}`);
          failed++;
        } else {
          console.log(`   ✅ Success! Coordinates: (${coords.latitude}, ${coords.longitude})`);
          successful++;
        }
      } else {
        console.log('   ❌ Could not geocode address');
        failed++;
      }
      
      // Rate limiting - pause every 10 requests
      if ((i + 1) % 10 === 0 && i < phasToGeocode.length - 1) {
        console.log('\n⏳ Pausing for rate limit...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully geocoded: ${successful}`);
    console.log(`❌ Failed to geocode: ${failed}`);
    console.log(`📊 Total processed: ${phasToGeocode.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get search term from command line argument
const searchTerm = process.argv[2];
if (!searchTerm) {
  console.log('Usage: node geocode-specific-phas.js <search-term>');
  console.log('Example: node geocode-specific-phas.js Appleton');
  console.log('Example: node geocode-specific-phas.js "WI"');
  process.exit(1);
}

geocodeSpecificPHAs(searchTerm); 