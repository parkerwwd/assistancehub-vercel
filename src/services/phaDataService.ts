
import { supabase } from "@/integrations/supabase/client";

export const deleteAllPHAData = async (): Promise<void> => {
  const { error } = await supabase
    .from('pha_agencies')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

  if (error) {
    console.error('Error deleting all PHA data:', error);
    throw new Error('Failed to delete all PHA data from database');
  }

  console.log('✅ All PHA data deleted from database');
};
