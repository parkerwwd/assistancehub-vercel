
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Home, Users, FileText, CheckCircle, ArrowRight, Target, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { USLocation } from "@/data/locations";
import { comprehensiveCities } from "@/data/locations/cities";
import USMap from "@/components/USMap";
import UnifiedSearchInput from "@/components/UnifiedSearchInput";

const STATES = [
  { code: 'AL', name: 'Alabama', lat: 32.318, lng: -86.902 },
  { code: 'AK', name: 'Alaska', lat: 64.0685, lng: -152.2782 },
  { code: 'AZ', name: 'Arizona', lat: 34.2744, lng: -111.2847 },
  { code: 'AR', name: 'Arkansas', lat: 34.8938, lng: -92.4426 },
  { code: 'CA', name: 'California', lat: 36.7783, lng: -119.4179 },
  { code: 'CO', name: 'Colorado', lat: 39.113, lng: -105.358 },
  { code: 'CT', name: 'Connecticut', lat: 41.767, lng: -72.677 },
  { code: 'DE', name: 'Delaware', lat: 39.161, lng: -75.526 },
  { code: 'FL', name: 'Florida', lat: 27.7663, lng: -81.6868 },
  { code: 'GA', name: 'Georgia', lat: 32.9866, lng: -83.6487 },
  { code: 'HI', name: 'Hawaii', lat: 21.1098, lng: -157.5311 },
  { code: 'ID', name: 'Idaho', lat: 44.2619, lng: -114.5103 },
  { code: 'IL', name: 'Illinois', lat: 40.3363, lng: -89.0022 },
  { code: 'IN', name: 'Indiana', lat: 39.8647, lng: -86.2604 },
  { code: 'IA', name: 'Iowa', lat: 42.0046, lng: -93.214 },
  { code: 'KS', name: 'Kansas', lat: 38.5111, lng: -96.8005 },
  { code: 'KY', name: 'Kentucky', lat: 37.669, lng: -84.6514 },
  { code: 'LA', name: 'Louisiana', lat: 31.1801, lng: -91.8749 },
  { code: 'ME', name: 'Maine', lat: 44.323, lng: -69.765 },
  { code: 'MD', name: 'Maryland', lat: 39.0724, lng: -76.7902 },
  { code: 'MA', name: 'Massachusetts', lat: 42.2373, lng: -71.5314 },
  { code: 'MI', name: 'Michigan', lat: 43.3504, lng: -84.5603 },
  { code: 'MN', name: 'Minnesota', lat: 45.7326, lng: -93.9196 },
  { code: 'MS', name: 'Mississippi', lat: 32.7673, lng: -89.6812 },
  { code: 'MO', name: 'Missouri', lat: 38.4623, lng: -92.302 },
  { code: 'MT', name: 'Montana', lat: 47.0527, lng: -109.6333 },
  { code: 'NE', name: 'Nebraska', lat: 41.1289, lng: -98.2883 },
  { code: 'NV', name: 'Nevada', lat: 38.4199, lng: -117.1219 },
  { code: 'NH', name: 'New Hampshire', lat: 43.4108, lng: -71.5653 },
  { code: 'NJ', name: 'New Jersey', lat: 40.314, lng: -74.5089 },
  { code: 'NM', name: 'New Mexico', lat: 34.8375, lng: -106.2371 },
  { code: 'NY', name: 'New York', lat: 42.9538, lng: -75.5268 },
  { code: 'NC', name: 'North Carolina', lat: 35.6411, lng: -79.8431 },
  { code: 'ND', name: 'North Dakota', lat: 47.2505, lng: -100.0646 },
  { code: 'OH', name: 'Ohio', lat: 40.3467, lng: -82.7791 },
  { code: 'OK', name: 'Oklahoma', lat: 35.5376, lng: -96.9247 },
  { code: 'OR', name: 'Oregon', lat: 44.5672, lng: -122.1269 },
  { code: 'PA', name: 'Pennsylvania', lat: 40.5773, lng: -77.264 },
  { code: 'RI', name: 'Rhode Island', lat: 41.6762, lng: -71.5562 },
  { code: 'SC', name: 'South Carolina', lat: 33.8191, lng: -80.9066 },
  { code: 'SD', name: 'South Dakota', lat: 44.2853, lng: -99.4632 },
  { code: 'TN', name: 'Tennessee', lat: 35.7449, lng: -86.7489 },
  { code: 'TX', name: 'Texas', lat: 31.106, lng: -97.6475 },
  { code: 'UT', name: 'Utah', lat: 40.1135, lng: -111.8535 },
  { code: 'VT', name: 'Vermont', lat: 44.0407, lng: -72.7093 },
  { code: 'VA', name: 'Virginia', lat: 37.768, lng: -78.2057 },
  { code: 'WA', name: 'Washington', lat: 47.042, lng: -122.893 },
  { code: 'WV', name: 'West Virginia', lat: 38.468, lng: -80.9696 },
  { code: 'WI', name: 'Wisconsin', lat: 44.2563, lng: -89.6385 },
  { code: 'WY', name: 'Wyoming', lat: 42.7475, lng: -107.2085 },
  { code: 'DC', name: 'District of Columbia', lat: 38.8974, lng: -77.0365 },
];

const POPULAR_CITIES = [
  'Los Angeles, CA',
  'San Francisco, CA',
  'Atlanta, GA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA'
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const navigate = useNavigate();

  const handleStateSearch = () => {
    console.log('🗺️ State search triggered:', selectedState);
    
    if (selectedState) {
      const state = STATES.find(s => s.code === selectedState);
      console.log('🔍 Found state data:', state);
      
      if (state) {
        const stateLocation: USLocation = {
          name: state.name,
          stateCode: state.code,
          state: state.name,
          type: 'state',
          latitude: state.lat,
          longitude: state.lng
        };
        
        console.log('✅ Navigating with state location:', stateLocation);
        navigate('/section8', { state: { searchLocation: stateLocation } });
      }
    }
  };

  // Handle location selection from search
  const handleLocationSelect = (location: USLocation) => {
    console.log('🔍 Home page search - location selected:', location);
    navigate('/section8', { state: { searchLocation: location } });
  };

  // Handle city click from popular cities buttons
  const handleCityClick = (cityName: string) => {
    console.log('🏙️ Popular city clicked:', cityName);
    
    // Find the city data from our comprehensive cities list
    const cityData = comprehensiveCities.find(city => 
      city.name === cityName.split(',')[0].trim()
    );
    
    console.log('🔍 Found city data:', cityData);
    
    if (cityData) {
      // Pass the location object with coordinates
      console.log('✅ Navigating with city data:', cityData);
      navigate('/section8', { state: { searchLocation: cityData } });
    } else {
      // Fallback to text search if city not found in local data
      console.log('⚠️ City not found in local data, using text search:', cityName);
      navigate('/section8', { state: { searchQuery: cityName } });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative h-[80vh] md:h-[70vh] bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
      }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading - Mobile Optimized */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Search Section 8 Housing Nationwide
            </h1>
            
            {/* Subtitle - Mobile Optimized */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 opacity-90 px-2">
              Your trusted guide to Section 8 housing
            </p>

            {/* Search Bar with Autocomplete - Mobile Optimized */}
            <div className="max-w-xl md:max-w-2xl mx-auto mb-6 sm:mb-8 relative px-2 sm:px-0">
              <UnifiedSearchInput
                placeholder="City, County, or ZIP"
                onLocationSelect={handleLocationSelect}
                autoNavigate={false}
                className="w-full"
                variant="default"
                autoFocus={false}
              />
            </div>

            {/* Popular Cities - Mobile Optimized */}
            <div className="mb-6 sm:mb-10">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2 sm:px-0">
                {POPULAR_CITIES.map((city) => (
                  <Button
                    key={city}
                    onClick={() => handleCityClick(city)}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>{city.split(',')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Down Arrow - Hidden on small mobile */}
            <div className="animate-bounce hidden sm:block">
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* State Search Section - Mobile Optimized */}
      <div className="bg-white py-8 sm:py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Search Housing by State
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              We have Section 8 housing assistance listings in every state.
            </p>
          </div>

          {/* State Selector - Mobile Optimized */}
          <div className="max-w-md md:max-w-lg mx-auto mb-6 sm:mb-8 md:mb-10">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg">
                  <SelectValue placeholder="Select Your State" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleStateSearch}
                disabled={!selectedState}
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Interactive US Map - Hidden on Mobile */}
          <div className="hidden md:block bg-white rounded-3xl p-6 mb-0 shadow-lg border border-gray-200">
            <div className="h-96 mb-6">
              <USMap selectedState={selectedState} onStateClick={setSelectedState} />
            </div>
            
            {/* Popular States - Desktop */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-800 mb-4">Popular states to explore:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['CA', 'TX', 'FL', 'NY', 'IL', 'GA'].map((stateCode) => {
                  const state = STATES.find(s => s.code === stateCode);
                  return (
                    <Button
                      key={stateCode}
                      variant="outline"
                      onClick={() => setSelectedState(stateCode)}
                      className="hover:bg-blue-50 hover:border-blue-300 px-4 py-2 text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {state?.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Popular States Grid - Mobile Only */}
          <div className="md:hidden">
            <p className="text-center text-base font-medium text-gray-800 mb-4">
              Popular states to explore:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['CA', 'TX', 'FL', 'NY', 'IL', 'GA', 'PA', 'OH'].map((stateCode) => {
                const state = STATES.find(s => s.code === stateCode);
                return (
                  <Button
                    key={stateCode}
                    variant="outline"
                    onClick={() => {
                      console.log('📱 Mobile state button clicked:', stateCode);
                      const state = STATES.find(s => s.code === stateCode);
                      if (state) {
                        const stateLocation: USLocation = {
                          name: state.name,
                          stateCode: state.code,
                          state: state.name,
                          type: 'state',
                          latitude: state.lat,
                          longitude: state.lng
                        };
                        console.log('✅ Mobile navigating with state location:', stateLocation);
                        navigate('/section8', { state: { searchLocation: stateLocation } });
                      }
                    }}
                    className="h-16 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 border-2"
                  >
                    <span className="text-lg font-bold text-blue-600">{stateCode}</span>
                    <span className="text-xs text-gray-600">{state?.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* How-To Guides Section - Mobile Optimized */}
      <div className="bg-gray-50 py-8 sm:py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How-To Guides
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Navigate the housing process with our comprehensive guides
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Apply for Section 8</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Learn about the application process for federal housing assistance.
                </p>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Check Waitlist Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Track your application and stay informed about your status.
                </p>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow touch-manipulation sm:col-span-2 md:col-span-1">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Home className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Complete Pre-Application</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Fill out your pre-application - the first step to housing.
                </p>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section - Mobile Optimized */}
      <div className="bg-white py-8 sm:py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Use AssistanceHub?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center px-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Save Time
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Find all Section 8 housing options in one place, reducing your search time.
              </p>
            </div>

            <div className="text-center px-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Stay Informed
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get the latest info on waiting lists and eligibility requirements.
              </p>
            </div>

            <div className="text-center px-2 sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Find Your Home
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Tailor your search to find the perfect housing option for your needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
