
import { useState, useEffect } from 'react';
import { Database } from "@/integrations/supabase/types";
import { fetchAllPHAData } from "@/services/phaService";
import { USLocation } from "@/data/usLocations";
import { filterPHAAgenciesByLocation } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const usePHAData = () => {
  const [allPHAAgencies, setAllPHAAgencies] = useState<PHAAgency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<PHAAgency[]>([]);
  const [phaAgencies, setPHAAgencies] = useState<PHAAgency[]>([]);
  const [filteredLocation, setFilteredLocation] = useState<USLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Debug filteredLocation changes
  useEffect(() => {
    // Only log significant changes, not every update
  }, [filteredLocation]);

  const handleFetchAllPHAData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchAllPHAData();

      // Store all agencies
      console.log('✅ Loaded', result.count, 'PHAs from database');
      setAllPHAAgencies(result.data);
      setTotalCount(result.count);

      // Apply current filter and pagination
      updateDisplayedAgencies(result.data, filteredLocation, currentPage);

    } catch (err) {
      console.error('❌ Error fetching all PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedAgencies = (
    allAgencies: PHAAgency[],
    location: USLocation | null,
    page: number
  ) => {
    // Step 1: Apply location filter if any
    const filtered = location
      ? filterPHAAgenciesByLocation(allAgencies, location)
      : allAgencies;

    setFilteredAgencies(filtered);

    // Step 2: Apply pagination to filtered results
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setPHAAgencies(paginated);
    
    // Log only when there's a significant change
    if (location) {
      console.log('📊 Location filter applied:', {
        location: location.name,
        filteredCount: filtered.length,
        totalCount: allAgencies.length
      });
    }
  };

  const applyLocationFilter = (location: USLocation | null) => {
    setFilteredLocation(location);
    setCurrentPage(1); // Reset to first page when filtering

    // Update displayed agencies with new filter
    updateDisplayedAgencies(allPHAAgencies, location, 1);
  };

  const clearLocationFilter = () => {
    applyLocationFilter(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);

    // Update displayed agencies with current filter and new page
    updateDisplayedAgencies(allPHAAgencies, filteredLocation, page);
  };

  useEffect(() => {
    handleFetchAllPHAData();
  }, []);

  // Calculate pagination based on filtered results, not total database count
  const filteredCount = filteredLocation ? filteredAgencies.length : totalCount;
  const totalPages = Math.ceil(filteredCount / itemsPerPage);

  return {
    phaAgencies,
    allPHAAgencies,
    filteredAgencies,
    filteredLocation,
    loading,
    error,
    currentPage,
    totalCount: filteredCount, // Return filtered count for pagination
    itemsPerPage,
    totalPages,
    refetch: () => handleFetchAllPHAData(),
    goToPage,
    applyLocationFilter,
    clearLocationFilter
  };
};
