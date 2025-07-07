
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Home, Users, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { USLocation } from "@/data/locations";
import USMap from "@/components/USMap";

const STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

const POPULAR_CITIES = [
  'Los Angeles, CA',
  'New York, NY', 
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA'
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string>("");
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
          latitude: 39.8283,
          longitude: -98.5795
        };
        
        navigate('/section8', { state: { searchLocation: stateLocation } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Like section8search.org */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Your trusted guide to Section 8 housing
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Section 8 Housing
              <span className="block text-blue-600">Nationwide</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your trusted guide to Section 8 housing and affordable rental solutions. 
              Finding affordable housing can be tough, but you're not alone.
            </p>

            {/* Popular Cities */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {POPULAR_CITIES.map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    className="text-sm hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => navigate('/section8')}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trust Signal - Like section8search.org */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">500,000+</div>
                <div className="text-gray-600 mb-6">Trusted by over 500,000 families to find housing</div>
                <Button 
                  onClick={() => navigate('/section8')}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
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
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 mb-16">
            <div className="h-96">
              <USMap selectedState={selectedState} onStateClick={setSelectedState} />
            </div>
            
            {/* Popular States */}
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Popular states to explore:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['CA', 'TX', 'FL', 'NY', 'IL', 'GA'].map((stateCode) => {
                  const state = STATES.find(s => s.code === stateCode);
                  return (
                    <Button
                      key={stateCode}
                      variant="outline"
                      onClick={() => setSelectedState(stateCode)}
                      className="hover:bg-blue-50 hover:border-blue-300"
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
