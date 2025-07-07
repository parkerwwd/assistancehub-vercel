
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Home, Users, FileText, CheckCircle, ArrowRight, Target, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { USLocation } from "@/data/locations";
import USMap from "@/components/USMap";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const handleStateSearch = () => {
    if (selectedState) {
      const state = STATES.find(s => s.code === selectedState);
      if (state) {
        const stateLocation: USLocation = {
          name: state.name,
          stateCode: state.code,
          state: state.name,
          type: 'state',
          latitude: state.lat,
          longitude: state.lng
        };
        
        navigate('/section8', { state: { searchLocation: stateLocation } });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to section8 page with search query
      navigate('/section8', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  const handleCityClick = (city: string) => {
    // Navigate to section8 page with the specific city as search query
    navigate('/section8', { state: { searchQuery: city } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Matching screenshot design */}
      <div className="relative h-[70vh] bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
      }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Search Section 8 Housing Nationwide
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white mb-12 opacity-90">
              Your trusted guide to Section 8 housing and affordable rental solutions
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="City, County, or Zipcode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-20 py-6 text-lg rounded-full border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
            </div>

            {/* Popular Cities - Blue buttons */}
            <div className="mb-16">
              <div className="flex flex-wrap justify-center gap-3">
                {POPULAR_CITIES.map((city) => (
                  <Button
                    key={city}
                    onClick={() => handleCityClick(city)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {city}
                  </Button>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 text-white mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* State Search Section - Main Feature */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Search Housing by State
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We have Section 8 housing assistance listings in every state. 
              Click on a state below to find housing in your desired area.
            </p>
          </div>

          {/* State Selector */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="flex gap-4">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="flex-1 h-14 text-lg">
                  <SelectValue placeholder="Select Your State" />
                </SelectTrigger>
                <SelectContent>
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
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Interactive US Map */}
          <div className="bg-white rounded-3xl p-8 mb-16 shadow-lg border border-gray-200">
            <div className="h-96 mb-8">
              <USMap selectedState={selectedState} onStateClick={setSelectedState} />
            </div>
            
            {/* Popular States - Integrated into same container */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-800 mb-6">Popular states to explore:</p>
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
        </div>
      </div>

      {/* How-To Guides Section - Like section8search.org */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How-To Guides</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We know the HCV housing process can be confusing. That's why we've gathered 
              all the information in one place to help you navigate the entire process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Learn How to Apply for Section 8</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn more about applying for Section 8, the federal program that provides 
                  affordable housing for low-income families.
                </p>
                <Button variant="outline" className="w-full">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Check Your Waitlist Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn how to track your status and stay informed about developments 
                  in your Section 8 housing search.
                </p>
                <Button variant="outline" className="w-full">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Complete Your PHA Pre-Application</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn more about filling out your pre-application, the first step 
                  in finding Section 8 housing.
                </p>
                <Button variant="outline" className="w-full">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Finding Housing with AssistanceHub
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Save Time and Effort</h3>
              <p className="text-gray-600 leading-relaxed">
                Searching for Section 8 housing can be a long process. Here, you'll find 
                nationwide listings in one convenient place, reducing the time it takes to locate your new home.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Stay Informed</h3>
              <p className="text-gray-600 leading-relaxed">
                HCV housing rules and regulations vary by location. AssistanceHub offers the latest 
                information on waiting lists, application processes, and eligibility requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Empower Your Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Whether you're a veteran or want to own your own home, you can tailor your search 
                according to what matters to you. Your new home could be just a click away.
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
