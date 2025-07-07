import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGeocodingStatus(searchTerm) {
  try {
    // Search for PHAs by name, city, or address containing the search term
    const { data: phas, error } = await supabase
      .from('pha_agencies')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('Error fetching PHAs:', error);
      return;
    }

    console.log(`\n📍 Geocoding Status for PHAs matching "${searchTerm}":`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let withCoords = 0;
    let withoutCoords = 0;
    
    phas.forEach(pha => {
      const hasCoords = !!(pha.latitude && pha.longitude);
      const status = hasCoords ? '✅' : '❌';
      const coords = hasCoords ? `(${pha.latitude}, ${pha.longitude})` : 'NO COORDINATES';
      
      console.log(`${status} ${pha.name}`);
      console.log(`   City: ${pha.city || 'Unknown'}, State: ${pha.state || 'Unknown'}`);
      console.log(`   Address: ${pha.address || 'No address'}`);
      console.log(`   Coordinates: ${coords}`);
      console.log('');
      
      if (hasCoords) withCoords++;
      else withoutCoords++;
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Summary: ${withCoords} with coordinates, ${withoutCoords} without coordinates`);
    console.log(`Total PHAs found: ${phas.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get search term from command line argument
const searchTerm = process.argv[2] || 'Appleton';
checkGeocodingStatus(searchTerm); 