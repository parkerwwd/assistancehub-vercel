
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, CheckCircle, MapPin, Phone, Mail, Users, Building, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';

  // Enhanced state data with more comprehensive information
  const stateData = {
    totalUnits: '12,847',
    properties: '340',
    cities: '75',
    agencies: '28',
    averageWaitTime: '18 months',
    lastUpdated: 'December 2024',
    heroImage: '/lovable-uploads/c30a91ac-2aa4-4263-a0e0-4be5156e797e.png',
    quickStats: [
      { label: 'Total Housing Units', value: '12,847', icon: Home },
      { label: 'Properties Available', value: '340', icon: Building },
      { label: 'Cities Covered', value: '75', icon: MapPin },
      { label: 'PHA Agencies', value: '28', icon: Users }
    ]
  };

  const housingPrograms = [
    {
      title: 'Section 8 Housing Choice Vouchers',
      description: 'Rental assistance for eligible low-income families',
      availability: 'Limited - Waitlist Open',
      status: 'available'
    },
    {
      title: 'Public Housing',
      description: 'Government-owned housing for eligible families',
      availability: 'Available in Select Cities',
      status: 'available'
    },
    {
      title: 'Income Restricted Apartments',
      description: 'Private apartments with income requirements',
      availability: 'Multiple Options Available',
      status: 'available'
    },
    {
      title: 'Rural Housing Programs',
      description: 'USDA rural development housing assistance',
      availability: 'Available in Rural Areas',
      status: 'available'
    }
  ];

  const topCities = [
    { name: 'Little Rock', units: '3,240', properties: '89' },
    { name: 'Fort Smith', units: '1,890', properties: '52' },
    { name: 'Fayetteville', units: '1,450', properties: '38' },
    { name: 'Springdale', units: '980', properties: '27' },
    { name: 'Jonesboro', units: '750', properties: '21' },
    { name: 'North Little Rock', units: '680', properties: '19' }
  ];

  const features = [
    'Section 8 Housing Choice Vouchers',
    'Public Housing Units', 
    'Income Restricted Apartments',
    'Senior Housing Options',
    'Disabled Accessible Units',
    'Family Housing Programs',
    'Emergency Housing Assistance',
    'Rural Development Programs'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-[500px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${stateData.heroImage})` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-indigo-900/80"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                {/* State Badge */}
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Home className="w-6 h-6 text-black" />
                  <span className="text-black font-bold text-lg">{stateName} Housing Guide</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Section 8 Housing In{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                    {stateName}
                  </span>
                </h1>

                {/* Enhanced Stats */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                  <p className="text-gray-800 text-xl mb-4 font-medium">
                    We found <span className="font-bold text-blue-600 text-2xl">{stateData.totalUnits}</span> affordable housing units from{' '}
                    <span className="font-bold text-green-600 text-2xl">{stateData.properties}</span> properties across{' '}
                    <span className="font-bold text-purple-600 text-2xl">{stateData.cities}</span> cities in {stateName}.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {stateData.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{stateData.agencies} PHA Agencies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stateData.quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Introduction */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">About Housing Assistance in {stateName}</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    Finding affordable housing in {stateName} is now easier with our comprehensive database of Section 8 and low-income housing options. We've compiled information from {stateData.agencies} Public Housing Authorities across the state to help you find suitable housing.
                  </p>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    The Housing Choice Voucher Program (Section 8) in {stateName} is administered by local Public Housing Authorities (PHAs). Each PHA manages its own waiting list and eligibility requirements, which means your application process may vary depending on your chosen location.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 font-medium">
                      <strong>Current Average Wait Time:</strong> {stateData.averageWaitTime} for new applicants
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Housing Programs */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Building className="w-6 h-6 text-blue-600" />
                    Available Housing Programs
                  </CardTitle>
                  <CardDescription>
                    Explore different types of housing assistance available in {stateName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {housingPrograms.map((program, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">{program.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            program.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {program.availability}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{program.description}</p>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          Learn More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search CTA */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl border-0">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold mb-4">Ready to Start Your Search?</h2>
                  <p className="text-blue-100 mb-6 text-lg">
                    Browse available housing options in {stateName} and connect with local housing authorities.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/section8">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                        <Home className="w-5 h-5 mr-2" />
                        Search Housing Now
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Phone className="w-5 h-5 mr-2" />
                      Contact Local PHA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Top Cities */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Top Cities in {stateName}
                  </CardTitle>
                  <CardDescription>Cities with the most housing options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCities.map((city, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div>
                          <div className="font-semibold text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-600">{city.properties} properties</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{city.units}</div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Cities <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* What You'll Find */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">What You'll Find</CardTitle>
                  <CardDescription>Types of housing assistance available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Help */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border-green-200">
                <CardHeader>
                  <CardTitle className="text-xl text-green-800">Need Help?</CardTitle>
                  <CardDescription className="text-green-600">Get assistance with your housing search</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-green-700">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">Call Housing Helpline</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email Support Team</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    Get Help Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default State;
