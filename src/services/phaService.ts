
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface FetchPHADataResult {
  data: PHAAgency[];
  count: number;
}

export const fetchAllPHAData = async (): Promise<FetchPHADataResult> => {
  // Supabase has a default limit of 1000 rows, we need to fetch all
  // First get the total count
  const { count: totalCount, error: countError } = await supabase
    .from('pha_agencies')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw countError;
  }

  // Fetch all records in batches of 1000
  const batchSize = 1000;
  const allData: PHAAgency[] = [];
  const totalBatches = Math.ceil((totalCount || 0) / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const from = i * batchSize;
    const to = from + batchSize - 1;

    const { data, error: fetchError } = await supabase
      .from('pha_agencies')
      .select('*')
      .order('name')
      .range(from, to);

    if (fetchError) {
      throw fetchError;
    }

    if (data) {
      allData.push(...data);
    }
  }

  console.log(`✅ Fetched all ${allData.length} PHAs from database`);

  // Debug: Check how many PHAs have coordinates
  const phasWithCoords = allData.filter(pha => pha.latitude && pha.longitude);
  console.log(`📍 PHAs with coordinates: ${phasWithCoords.length}/${allData.length} (${Math.round(phasWithCoords.length/allData.length * 100)}%)`);
  if (phasWithCoords.length < allData.length * 0.5) {
    console.warn('⚠️ Less than 50% of PHAs have coordinates! This will affect map display.');
  }

  // Return data as-is, using the coordinates from the database
  return {
    data: allData,
    count: totalCount || 0
  };
};

export const fetchPHAData = async (page = 1, itemsPerPage = 20): Promise<FetchPHADataResult> => {
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, error: fetchError, count } = await supabase
    .from('pha_agencies')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to);

  if (fetchError) {
    throw fetchError;
  }

  // Return data as-is, using the coordinates from the database
  return {
    data: data || [],
    count: count || 0
  };
};
