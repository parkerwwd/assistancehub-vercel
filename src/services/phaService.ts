
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface FetchPHADataResult {
  data: PHAAgency[];
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

  // Return data as-is, using the coordinates from the database
  return {
    data: data || [],
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

  // Return data as-is, using the coordinates from the database
  return {
    data: data || [],
    count: count || 0
  };
};
