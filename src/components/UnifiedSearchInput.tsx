import React, { useRef, useEffect } from 'react';
import { Search, X, Loader2, MapPin, Building, Mail } from 'lucide-react';
import { useUnifiedSearch, SearchResult } from '@/hooks/useUnifiedSearch';
import { USLocation } from '@/data/usLocations';

interface UnifiedSearchInputProps {
  placeholder?: string;
  onLocationSelect?: (location: USLocation) => void;
  autoNavigate?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'header';
  disabled?: boolean;
  autoFocus?: boolean;
}

const UnifiedSearchInput: React.FC<UnifiedSearchInputProps> = ({
  placeholder = "Search by city, state, or ZIP code...",
  onLocationSelect,
  autoNavigate = true,
  className = "",
  variant = 'default',
  disabled = false,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const search = useUnifiedSearch({
    onLocationSelect,
    autoNavigate,
    debounceMs: 300,
    maxResults: 10,
    enableZipSearch: true,
    enableMapboxSearch: true
  });

  const { searchState } = search;

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (searchState.showSuggestions && searchState.results.length > 0) {
          search.navigateDown();
        } else if (searchState.query.length > 0) {
          search.showSuggestions();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (searchState.showSuggestions && searchState.results.length > 0) {
          search.navigateUp();
        }
        break;
      case 'Enter':
        e.preventDefault();
        search.selectCurrent();
        break;
      case 'Escape':
        search.hideSuggestions();
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    search.setQuery(e.target.value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (disabled) return;
    if (searchState.query.length > 0 && searchState.results.length > 0) {
      search.showSuggestions();
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      search.hideSuggestions();
    }, 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (result: SearchResult) => {
    search.selectResult(result);
  };

  // Handle clear button
  const handleClear = () => {
    search.clearSearch();
    inputRef.current?.focus();
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchState.query.trim() && !disabled) {
      search.selectCurrent();
    }
  };

  // Get result icon
  const getResultIcon = (result: SearchResult) => {
    if (result.zipCode) {
      return <Mail className="w-4 h-4 text-blue-500" />;
    }
    switch (result.type) {
      case 'state':
        return <Building className="w-4 h-4 text-green-500" />;
      case 'county':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'city':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get result description
  const getResultDescription = (result: SearchResult) => {
    if (result.zipCode) {
      return 'ZIP Code';
    }
    switch (result.type) {
      case 'state':
        return 'State';
      case 'county':
        return `County, ${result.stateCode}`;
      case 'city':
        return `City, ${result.stateCode}`;
      default:
        return result.stateCode;
    }
  };

  // Get result type badge
  const getResultTypeBadge = (result: SearchResult) => {
    const badges = {
      local: 'Local',
      mapbox: 'Mapbox',
      zipcode: 'ZIP'
    };
    return badges[result.resultType] || '';
  };

  // Base input classes
  const inputClasses = {
    default: "w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
    compact: "w-full px-3 py-2.5 pl-10 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm",
    header: "w-full px-4 py-2.5 pl-10 pr-8 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-500 text-sm sm:text-base"
  };

  const containerClasses = {
    default: "relative w-full",
    compact: "relative w-full",
    header: "relative w-full"
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {searchState.loading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchState.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          className={`${inputClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Search for locations"
          aria-expanded={searchState.showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />

        {/* Clear Button */}
        {searchState.query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {searchState.showSuggestions && (searchState.results.length > 0 || searchState.error) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[60vh] sm:max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Error State */}
          {searchState.error && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 text-red-600 text-sm border-b">
              {searchState.error}
            </div>
          )}

          {/* Search Results */}
          {searchState.results.map((result, index) => (
            <button
              key={`${result.name}-${result.stateCode}-${index}`}
              onClick={() => handleSuggestionClick(result)}
              className={`w-full px-3 sm:px-4 py-3 sm:py-3 text-left hover:bg-gray-50 active:bg-gray-100 border-b last:border-b-0 transition-colors touch-manipulation ${
                index === searchState.selectedIndex ? 'bg-blue-50 border-blue-100' : ''
              }`}
              role="option"
              aria-selected={index === searchState.selectedIndex}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {getResultIcon(result)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {result.name}
                    </span>
                    {/* Result type badge */}
                    <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full">
                      {getResultTypeBadge(result)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {getResultDescription(result)}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* No Results State */}
          {searchState.results.length === 0 && !searchState.error && searchState.hasSearched && (
            <div className="px-4 py-4 sm:py-6 text-center text-gray-500">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No locations found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for a different city, state, or ZIP code
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchInput; 