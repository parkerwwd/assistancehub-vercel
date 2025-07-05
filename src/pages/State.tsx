
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';

  // Mock data - in a real app, this would come from an API based on the state
  const stateData = {
    totalUnits: '4,219',
    properties: '120',
    cities: '29',
    heroImage: '/lovable-uploads/c30a91ac-2aa4-4263-a0e0-4be5156e797e.png' // Using one of the available images
  };

  const features = [
    'Section 8 Housing',
    'Income Restricted Apartments', 
    'Townhomes',
    'Open Section 8 Waiting Lists',
    'Low Income Rentals',
    'Public Housing',
    'Public Housing Agencies (PHA)'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${stateData.heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="bg-yellow-400 inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4">
                <Home className="w-5 h-5 text-black" />
                <span className="text-black font-semibold">{stateName} Housing Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Section 8 Housing In {stateName}
              </h1>
              <p className="text-lg text-white/90 max-w-3xl">
                We found <span className="font-semibold">{stateData.totalUnits}</span> low-income units from{' '}
                <span className="font-semibold">{stateData.properties}</span> properties in{' '}
                <span className="font-semibold">{stateData.cities}</span> cities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 mb-6">
              The search for affordable housing can feel overwhelming, but if you're looking for Section 8 housing in {stateName}, you've come to the right place. You're taking a positive first step and{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                Section 8 Search is here to help
              </Link>.
            </p>
            
            <p className="text-gray-700 mb-6">
              Finding low-income housing in {stateName} involves understanding certain rules and processes, which can vary depending on location. Before{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                starting your search
              </Link>, you should know that the Section 8 Housing Program (also called the Housing Choice Voucher Program) is run by local{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                Public Housing Authorities (PHAs)
              </Link>. This means that your eligibility and{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                waiting list details
              </Link> will differ{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                according to the city
              </Link> or county you're interested in.
            </p>

            <p className="text-gray-700 mb-8">
              Explore{' '}
              <Link to="/section8" className="text-blue-600 hover:underline">
                cities
              </Link> in {stateName} with Section 8 and Affordable housing options.
            </p>
          </div>

          {/* What You'll Find Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Find</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
            <p className="text-gray-700 mb-8">
              We understand that searching for Section 8 housing in {stateName} can be a journey. Your specific search will be unique to your needs. Easily search low-income {stateName} housing by city, using the grid below. We support your journey by providing resources and tools to assist you in your search. Take your time, gather the necessary information, and know that you're not alone.
            </p>

            <div className="text-center">
              <Link to="/section8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  <Home className="w-5 h-5 mr-2" />
                  Start Your Housing Search
                </Button>
              </Link>
            </div>
          </div>

          {/* How to Search Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Search</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expand Listing Details</h3>
              <p className="text-gray-700 mb-4">
                Select any listing to view more details including contact info for the property management or authority.
              </p>
              
              <div className="bg-gray-50 border-2 border-yellow-400 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-xs">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default State;
