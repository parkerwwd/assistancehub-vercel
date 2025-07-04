
import { useState, useEffect } from 'react';
import { PHAAgency } from "@/types/phaOffice";
import { fetchAllPHAData } from "@/services/phaService";
import { GeocodedPHA } from "@/services/geocodingService";
import { USLocation } from "@/data/usLocations";

export const usePHAData = () => {
  const [allPHAAgencies, setAllPHAAgencies] = useState<GeocodedPHA[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<GeocodedPHA[]>([]);
  const [phaAgencies, setPHAAgencies] = useState<GeocodedPHA[]>([]);
  const [filteredLocation, setFilteredLocation] = useState<USLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const handleFetchAllPHAData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('⚠️ Database tables removed - no PHA data available');
      const result = await fetchAllPHAData();

      setAllPHAAgencies(result.data);
      setTotalCount(result.count);
      updateDisplayedAgencies(result.data, filteredLocation, currentPage);

    } catch (err) {
      console.error('❌ Error fetching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedAgencies = (
    allAgencies: GeocodedPHA[],
    location: USLocation | null,
    page: number
  ) => {
    const filtered = allAgencies;
    setFilteredAgencies(filtered);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setPHAAgencies(paginated);
  };

  const applyLocationFilter = (location: USLocation | null) => {
    setFilteredLocation(location);
    setCurrentPage(1);
    updateDisplayedAgencies(allPHAAgencies, location, 1);
  };

  const clearLocationFilter = () => {
    applyLocationFilter(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    updateDisplayedAgencies(allPHAAgencies, filteredLocation, page);
  };

  useEffect(() => {
    handleFetchAllPHAData();
  }, []);

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
    totalCount: filteredCount,
    itemsPerPage,
    totalPages,
    refetch: () => handleFetchAllPHAData(),
    goToPage,
    applyLocationFilter,
    clearLocationFilter
  };
};
