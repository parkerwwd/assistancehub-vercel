
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { geocodePHAs, GeocodedPHA } from "./geocodingService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface FetchPHADataResult {
  data: GeocodedPHA[];
  count: number;
}

export const fetchAllPHAData = async (): Promise<FetchPHADataResult> => {
  const { data, error: fetchError, count } = await supabase
    .from('pha_agencies')
    .select('*', { count: 'exact' })
    .order('name');

  if (fetchError) {
    throw fetchError;
  }

  console.log('✅ fetchAllPHAData successful:', {
    dataLength: data?.length || 0,
    totalCount: count,
    sampleRecord: data?.[0]
  });

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedData = await geocodePHAs(data || []);

  return {
    data: geocodedData,
    count: count || 0
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

  console.log('✅ fetchPHAData successful:', {
    dataLength: data?.length || 0,
    totalCount: count,
    sampleRecord: data?.[0]
  });

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedData = await geocodePHAs(data || []);

  return {
    data: geocodedData,
    count: count || 0
  };
};
