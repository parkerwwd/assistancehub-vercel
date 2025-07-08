import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comprehensiveCities, USLocation } from "@/data/locations";

// Types
export interface SearchResult extends USLocation {
  zipCode?: string;
  mapboxId?: string;
  resultType: 'local' | 'mapbox' | 'zipcode';
  priority: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  showSuggestions: boolean;
  selectedIndex: number;
  hasSearched: boolean;
}

export interface SearchCache {
  [key: string]: {
    results: SearchResult[];
    timestamp: number;
  };
}

export interface UseUnifiedSearchOptions {
  onLocationSelect?: (location: USLocation) => void;
  autoNavigate?: boolean;
  debounceMs?: number;
  cacheExpiryMs?: number;
  maxResults?: number;
  enableZipSearch?: boolean;
  enableMapboxSearch?: boolean;
}

export interface UseUnifiedSearchReturn {
  // State
  searchState: SearchState;
  
  // Actions
  setQuery: (query: string) => void;
  clearSearch: () => void;
  selectResult: (result: SearchResult | number) => void;
  handleDirectSearch: (query: string) => Promise<void>;
  
  // Navigation
  navigateUp: () => void;
  navigateDown: () => void;
  selectCurrent: () => void;
  
  // Suggestions
  showSuggestions: () => void;
  hideSuggestions: () => void;
  
  // Cache
  clearCache: () => void;
  getCacheStats: () => { size: number; keys: string[] };
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_MS = 300;
const MAX_RESULTS = 10;

export const useUnifiedSearch = (options: UseUnifiedSearchOptions = {}): UseUnifiedSearchReturn => {
  const {
    onLocationSelect,
    autoNavigate = true,
    debounceMs = DEBOUNCE_MS,
    cacheExpiryMs = CACHE_EXPIRY_MS,
    maxResults = MAX_RESULTS,
    enableZipSearch = true,
    enableMapboxSearch = true
  } = options;

  const navigate = useNavigate();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchCache = useRef<SearchCache>({});
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    showSuggestions: false,
    selectedIndex: -1,
    hasSearched: false
  });

  // Clear debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Cache management
  const isValidCache = (timestamp: number): boolean => {
    return Date.now() - timestamp < cacheExpiryMs;
  };

  const getCachedResults = (query: string): SearchResult[] | null => {
    const cached = searchCache.current[query.toLowerCase()];
    return cached && isValidCache(cached.timestamp) ? cached.results : null;
  };

  const setCachedResults = (query: string, results: SearchResult[]): void => {
    searchCache.current[query.toLowerCase()] = {
      results,
      timestamp: Date.now()
    };
  };

  const clearCache = (): void => {
    searchCache.current = {};
  };

  const getCacheStats = (): { size: number; keys: string[] } => {
    return {
      size: Object.keys(searchCache.current).length,
      keys: Object.keys(searchCache.current)
    };
  };

  // Search functions
  const searchLocalCities = (query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    const localResults = comprehensiveCities
      .filter(city => 
        city.name.toLowerCase().includes(lowerQuery) ||
        city.state.toLowerCase().includes(lowerQuery) ||
        city.stateCode.toLowerCase().includes(lowerQuery)
      )
      .slice(0, maxResults)
      .map((city, index) => ({
        ...city,
        resultType: 'local' as const,
        priority: city.name.toLowerCase().startsWith(lowerQuery) ? index : index + 100
      }));

    return localResults;
  };

  const searchMapboxPlaces = async (query: string): Promise<SearchResult[]> => {
    if (!enableMapboxSearch || !mapboxToken || query.length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `country=US&` +
        `types=place&` +
        `limit=${maxResults}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.features
        .filter((feature: any) => feature.place_type.includes('place'))
        .map((feature: any, index: number) => {
          const stateContext = feature.context?.find((c: any) => c.id.startsWith('region'));
          const stateName = stateContext?.text || '';
          const stateCode = stateContext?.short_code?.replace('US-', '') || '';
          
          return {
            name: feature.text,
            state: stateName,
            stateCode: stateCode.toUpperCase(),
            latitude: feature.center[1],
            longitude: feature.center[0],
            type: 'city' as const,
            mapboxId: feature.id,
            resultType: 'mapbox' as const,
            priority: index + 200 // Lower priority than local results
          };
        });
    } catch (error) {
      console.error('Mapbox search error:', error);
      return [];
    }
  };

  const searchZipCode = async (zipCode: string): Promise<SearchResult[]> => {
    if (!enableZipSearch || !mapboxToken) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zipCode)}.json?` +
        `access_token=${mapboxToken}&` +
        `limit=1&` +
        `country=US&` +
        `types=postcode`
      );

      if (!response.ok) {
        throw new Error(`Mapbox ZIP search error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name || feature.text || zipCode;
        
        return [{
          name: placeName.split(',')[0] || `ZIP ${zipCode}`,
          type: 'city' as const,
          state: 'United States',
          stateCode: 'US',
          latitude: feature.center[1],
          longitude: feature.center[0],
          zipCode: zipCode,
          resultType: 'zipcode' as const,
          priority: 0 // Highest priority for exact ZIP matches
        }];
      }
    } catch (error) {
      console.error('ZIP code search error:', error);
    }
    
    return [];
  };

  const performSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    // Check cache first
    const cachedResults = getCachedResults(query);
    if (cachedResults) {
      return cachedResults;
    }

    // Check if it's a ZIP code
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    const isZipCode = zipCodeRegex.test(query.trim());

    let results: SearchResult[] = [];

    if (isZipCode) {
      // Handle ZIP code search
      results = await searchZipCode(query.trim());
    } else {
      // Handle city/state search
      const localResults = searchLocalCities(query);
      
      // If we have enough local results, use them
      if (localResults.length >= 5) {
        results = localResults;
      } else {
        // Otherwise, combine with Mapbox results
        const mapboxResults = await searchMapboxPlaces(query);
        
        // Combine and deduplicate results
        const combinedResults = [...localResults];
        mapboxResults.forEach(mapboxResult => {
          const isDuplicate = combinedResults.some(existing => 
            existing.name.toLowerCase() === mapboxResult.name.toLowerCase() && 
            existing.stateCode === mapboxResult.stateCode
          );
          if (!isDuplicate) {
            combinedResults.push(mapboxResult);
          }
        });
        
        results = combinedResults;
      }
    }

    // Sort by priority and limit results
    results.sort((a, b) => a.priority - b.priority);
    results = results.slice(0, maxResults);

    // Cache results
    setCachedResults(query, results);

    return results;
  };

  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Clear results immediately for empty queries
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        showSuggestions: false,
        selectedIndex: -1,
        error: null
      }));
      return;
    }

    // Set loading state
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    // Debounce the search
    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await performSearch(query);
        setSearchState(prev => ({
          ...prev,
          results,
          loading: false,
          showSuggestions: true,
          selectedIndex: -1,
          hasSearched: true
        }));
      } catch (error) {
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Search failed',
          results: [],
          showSuggestions: false
        }));
      }
    }, debounceMs);
  }, [debounceMs, maxResults]);

  const clearSearch = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setSearchState({
      query: '',
      results: [],
      loading: false,
      error: null,
      showSuggestions: false,
      selectedIndex: -1,
      hasSearched: false
    });
  }, []);

  const selectResult = useCallback((result: SearchResult | number) => {
    let selectedResult: SearchResult;
    
    if (typeof result === 'number') {
      // Select by index
      if (result < 0 || result >= searchState.results.length) {
        return;
      }
      selectedResult = searchState.results[result];
    } else {
      // Select by result object
      selectedResult = result;
    }

    console.log('🎯 useUnifiedSearch.selectResult - Selected:', {
      name: selectedResult.name,
      type: selectedResult.type,
      coordinates: [selectedResult.longitude, selectedResult.latitude],
      state: selectedResult.state,
      stateCode: selectedResult.stateCode,
      resultType: selectedResult.resultType
    });

    // Create location object
    const location: USLocation = {
      name: selectedResult.name,
      type: selectedResult.type,
      state: selectedResult.state,
      stateCode: selectedResult.stateCode,
      latitude: selectedResult.latitude,
      longitude: selectedResult.longitude
    };

    console.log('📍 Creating USLocation object:', location);

    // Update search state
    setSearchState(prev => ({
      ...prev,
      query: selectedResult.zipCode || `${selectedResult.name}, ${selectedResult.stateCode}`,
      showSuggestions: false,
      selectedIndex: -1
    }));

    // Handle selection
    if (onLocationSelect) {
      console.log('✅ Calling onLocationSelect callback');
      onLocationSelect(location);
    } else if (autoNavigate) {
      console.log('🚀 Auto-navigating to /section8');
      navigate('/section8', { state: { searchLocation: location } });
    }
  }, [searchState.results, onLocationSelect, autoNavigate, navigate]);

  const handleDirectSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await performSearch(query);
      
      if (results.length > 0) {
        // Auto-select first result
        selectResult(results[0]);
      } else {
        // No results found
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: `No results found for "${query}"`,
          results: [],
          showSuggestions: false
        }));
      }
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, [selectResult]);

  // Navigation functions
  const navigateUp = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : prev.results.length - 1
    }));
  }, []);

  const navigateDown = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex < prev.results.length - 1 ? prev.selectedIndex + 1 : 0
    }));
  }, []);

  const selectCurrent = useCallback(() => {
    if (searchState.selectedIndex >= 0 && searchState.selectedIndex < searchState.results.length) {
      selectResult(searchState.selectedIndex);
    } else if (searchState.query.trim()) {
      handleDirectSearch(searchState.query.trim());
    }
  }, [searchState.selectedIndex, searchState.results.length, searchState.query, selectResult, handleDirectSearch]);

  // Suggestion functions
  const showSuggestions = useCallback(() => {
    setSearchState(prev => ({ ...prev, showSuggestions: true }));
  }, []);

  const hideSuggestions = useCallback(() => {
    setSearchState(prev => ({ ...prev, showSuggestions: false, selectedIndex: -1 }));
  }, []);

  return {
    searchState,
    setQuery,
    clearSearch,
    selectResult,
    handleDirectSearch,
    navigateUp,
    navigateDown,
    selectCurrent,
    showSuggestions,
    hideSuggestions,
    clearCache,
    getCacheStats
  };
}; 