import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";
import { fetchAllPHAData } from "@/services/phaService";
import { filterPHAAgenciesByLocation } from "@/utils/mapUtils";
import { Property } from "@/types/property";
import { fetchAllProperties } from "@/services/propertyService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

// State interface
interface SearchMapState {
  // Data state
  allPHAAgencies: PHAAgency[];
  filteredAgencies: PHAAgency[];
  paginatedAgencies: PHAAgency[];
  allProperties: Property[];
  filteredProperties: Property[];
  loading: boolean;
  error: string | null;
  
  // Search state
  searchLocation: USLocation | null;
  searchQuery: string;
  
  // Selection state
  selectedOffice: PHAAgency | Property | null;
  selectedLocation: { lat: number; lng: number; name: string } | null;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  
  // Toggle state
  showPHAs: boolean;
  showProperties: boolean;
}

// Action types
type SearchMapAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ALL_AGENCIES'; payload: PHAAgency[] }
  | { type: 'SET_ALL_PROPERTIES'; payload: Property[] }
  | { type: 'SET_SEARCH_LOCATION'; payload: USLocation | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_OFFICE'; payload: PHAAgency | Property | null }
  | { type: 'SET_SELECTED_LOCATION'; payload: { lat: number; lng: number; name: string } | null }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SHOW_PHAS'; payload: boolean }
  | { type: 'SET_SHOW_PROPERTIES'; payload: boolean }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'APPLY_FILTERS' };

// Initial state
const initialState: SearchMapState = {
  allPHAAgencies: [],
  filteredAgencies: [],
  paginatedAgencies: [],
  allProperties: [],
  filteredProperties: [],
  loading: true,
  error: null,
  searchLocation: null,
  searchQuery: '',
  selectedOffice: null,
  selectedLocation: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  itemsPerPage: 20,
  showPHAs: true,
  showProperties: false
};

// Reducer
function searchMapReducer(state: SearchMapState, action: SearchMapAction): SearchMapState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_ALL_AGENCIES':
      return { ...state, allPHAAgencies: action.payload };
    
    case 'SET_ALL_PROPERTIES':
      return { ...state, allProperties: action.payload };
    
    case 'SET_SEARCH_LOCATION':
      return { 
        ...state, 
        searchLocation: action.payload,
        currentPage: 1, // Reset to first page when location changes
        selectedOffice: null // Clear selected office when location changes
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_OFFICE':
      return { ...state, selectedOffice: action.payload };
    
    case 'SET_SELECTED_LOCATION':
      return { ...state, selectedLocation: action.payload };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_SHOW_PHAS':
      return { ...state, showPHAs: action.payload };
    
    case 'SET_SHOW_PROPERTIES':
      return { ...state, showProperties: action.payload };
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchLocation: null,
        searchQuery: '',
        selectedOffice: null,
        selectedLocation: null,
        currentPage: 1
      };
    
    case 'APPLY_FILTERS': {
      // Apply location filter to PHAs
      const filteredPHAs = state.searchLocation
        ? filterPHAAgenciesByLocation(state.allPHAAgencies, state.searchLocation)
        : state.allPHAAgencies;
      
      // Apply location filter to properties
      const filteredProps = state.searchLocation
        ? state.allProperties.filter(prop => {
            if (!prop.latitude || !prop.longitude) return false;
            // Simple distance filter - could be enhanced
            const distance = Math.sqrt(
              Math.pow(prop.latitude - state.searchLocation!.latitude, 2) +
              Math.pow(prop.longitude - state.searchLocation!.longitude, 2)
            );
            return distance < 0.5; // Roughly 50 miles
          })
        : state.allProperties;
      
      console.log('📊 SearchMapContext APPLY_FILTERS:', {
        searchLocation: state.searchLocation?.name || 'none',
        allPHAsCount: state.allPHAAgencies.length,
        filteredPHAsCount: filteredPHAs.length,
        allPropertiesCount: state.allProperties.length,
        filteredPropertiesCount: filteredProps.length,
        showPHAs: state.showPHAs,
        showProperties: state.showProperties
      });
      
      // Combine results based on toggles
      const visiblePHAs = state.showPHAs ? filteredPHAs : [];
      const visibleProperties = state.showProperties ? filteredProps : [];
      
      // Apply pagination to PHAs (properties handled separately)
      const totalCount = visiblePHAs.length;
      const totalPages = Math.ceil(totalCount / state.itemsPerPage);
      const startIndex = (state.currentPage - 1) * state.itemsPerPage;
      const endIndex = startIndex + state.itemsPerPage;
      const paginated = visiblePHAs.slice(startIndex, endIndex);
      
      return {
        ...state,
        filteredAgencies: visiblePHAs,
        paginatedAgencies: paginated,
        filteredProperties: visibleProperties,
        totalCount,
        totalPages: Math.max(1, totalPages)
      };
    }
    
    default:
      return state;
  }
}

// Context interface
interface SearchMapContextValue {
  state: SearchMapState;
  actions: {
    setSearchLocation: (location: USLocation | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedOffice: (office: PHAAgency | Property | null) => void;
    setSelectedLocation: (location: { lat: number; lng: number; name: string } | null) => void;
    setCurrentPage: (page: number) => void;
    setShowPHAs: (show: boolean) => void;
    setShowProperties: (show: boolean) => void;
    clearSearch: () => void;
    refetch: () => Promise<void>;
  };
}

// Context
const SearchMapContext = createContext<SearchMapContextValue | undefined>(undefined);

// Provider component
export const SearchMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(searchMapReducer, initialState);
  
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Fetch both PHAs and properties in parallel
        const [phaResult, propertiesResult] = await Promise.all([
          fetchAllPHAData(),
          fetchAllProperties()
        ]);
        
        dispatch({ type: 'SET_ALL_AGENCIES', payload: phaResult.data });
        dispatch({ type: 'SET_ALL_PROPERTIES', payload: propertiesResult.data });
        
        // Apply initial filters
        dispatch({ type: 'APPLY_FILTERS' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when dependencies change
  useEffect(() => {
    if (state.allPHAAgencies.length > 0 || state.allProperties.length > 0) {
      dispatch({ type: 'APPLY_FILTERS' });
    }
  }, [state.allPHAAgencies, state.allProperties, state.searchLocation, state.currentPage, state.showPHAs, state.showProperties]);
  
  // Memoized actions
  const actions = useMemo(() => ({
    setSearchLocation: (location: USLocation | null) => {
      console.log('🎯 SearchMapContext.setSearchLocation called with:', location);
      
      dispatch({ type: 'SET_SEARCH_LOCATION', payload: location });
      
      // Set map location if provided
      if (location) {
        const mapLocation = {
          lat: location.latitude,
          lng: location.longitude,
          name: location.type === 'state' ? location.name : `${location.name}, ${location.stateCode}`
        };
        console.log('📍 Setting selected location for map:', mapLocation);
        dispatch({ 
          type: 'SET_SELECTED_LOCATION', 
          payload: mapLocation
        });
      } else {
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: null });
      }
    },
    
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },
    
    setSelectedOffice: (office: PHAAgency | Property | null) => {
      dispatch({ type: 'SET_SELECTED_OFFICE', payload: office });
    },
    
    setSelectedLocation: (location: { lat: number; lng: number; name: string } | null) => {
      dispatch({ type: 'SET_SELECTED_LOCATION', payload: location });
    },
    
    setCurrentPage: (page: number) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    },
    
    setShowPHAs: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_PHAS', payload: show });
    },
    
    setShowProperties: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_PROPERTIES', payload: show });
    },
    
    clearSearch: () => {
      dispatch({ type: 'CLEAR_SEARCH' });
    },
    
    refetch: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const [phaResult, propertiesResult] = await Promise.all([
          fetchAllPHAData(),
          fetchAllProperties()
        ]);
        
        dispatch({ type: 'SET_ALL_AGENCIES', payload: phaResult.data });
        dispatch({ type: 'SET_ALL_PROPERTIES', payload: propertiesResult.data });
        
        // Apply filters after refresh
        dispatch({ type: 'APPLY_FILTERS' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }), []);
  
  const value = useMemo(() => ({ state, actions }), [state, actions]);
  
  return (
    <SearchMapContext.Provider value={value}>
      {children}
    </SearchMapContext.Provider>
  );
};

// Hook to use the context
export const useSearchMap = () => {
  const context = useContext(SearchMapContext);
  if (!context) {
    throw new Error('useSearchMap must be used within a SearchMapProvider');
  }
  return context;
}; 