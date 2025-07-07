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

async function checkCoordinates() {
  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('pha_agencies')
      .select('*', { count: 'exact', head: true });

    // Get count without coordinates
    const { count: missingCount } = await supabase
      .from('pha_agencies')
      .select('*', { count: 'exact', head: true })
      .or('latitude.is.null,longitude.is.null');

    // Get count with coordinates
    const withCoordinates = (totalCount || 0) - (missingCount || 0);

    console.log('\n📊 PHA Coordinates Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total PHAs: ${totalCount || 0}`);
    console.log(`✅ With coordinates: ${withCoordinates}`);
    console.log(`❌ Missing coordinates: ${missingCount || 0}`);
    console.log(`Percentage geocoded: ${totalCount ? ((withCoordinates / totalCount) * 100).toFixed(1) : 0}%`);

    // Get some examples of PHAs without coordinates
    const { data: examples } = await supabase
      .from('pha_agencies')
      .select('name, address, city, state')
      .or('latitude.is.null,longitude.is.null')
      .limit(5);

    if (examples && examples.length > 0) {
      console.log('\n📍 Examples of PHAs needing geocoding:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      examples.forEach(pha => {
        console.log(`- ${pha.name} (${pha.city || 'Unknown'}, ${pha.state || 'Unknown'})`);
        console.log(`  Address: ${pha.address || 'No address'}`);
      });
    }

  } catch (error) {
    console.error('Error checking coordinates:', error);
  }
}

checkCoordinates(); 