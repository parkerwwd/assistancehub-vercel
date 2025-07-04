
import { PHAAgency } from "@/types/phaOffice";

export interface FetchPHADataResult {
  data: PHAAgency[];
  count: number;
}

export const fetchAllPHAData = async (): Promise<FetchPHADataResult> => {
  console.log('⚠️ Database tables removed - returning empty data');
  
  return {
    data: [],
    count: 0
  };
};

export const fetchPHAData = async (page = 1, itemsPerPage = 20): Promise<FetchPHADataResult> => {
  console.log('⚠️ Database tables removed - returning empty data');
  
  return {
    data: [],
    count: 0
  };
};
