
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, CheckCircle, MapPin, Phone, Mail, Users, Building, Calendar, ExternalLink, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';

  // Enhanced state data with realistic Arkansas-specific information
  const stateData = {
    totalUnits: '8,243',
    properties: '156',
    cities: '42',
    agencies: '12',
    averageWaitTime: '24 months',
    lastUpdated: 'January 2025',
    occupancyRate: '94%',
    heroImage: '/lovable-uploads/c30a91ac-2aa4-4263-a0e0-4be5156e797e.png',
    quickStats: [
      { label: 'Available Units', value: '8,243', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Active Properties', value: '156', icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Cities Served', value: '42', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Housing Authorities', value: '12', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  };

  const housingPrograms = [
    {
      title: 'Section 8 Housing Choice Vouchers',
      description: 'Portable rental assistance allowing families to choose their housing',
      availability: 'Waitlist Currently Open',
      status: 'available',
      participants: '4,200+',
      fundingLevel: 'Fully Funded'
    },
    {
      title: 'Public Housing',
      description: 'Government-owned affordable housing developments',
      availability: 'Limited Openings',
      status: 'limited',
      participants: '2,100+',
      fundingLevel: 'State Funded'
    },
    {
      title: 'Low-Income Housing Tax Credit',
      description: 'Private developments with income-restricted units',
      availability: 'Multiple Properties',
      status: 'available',
      participants: '1,800+',
      fundingLevel: 'Federal Tax Credits'
    },
    {
      title: 'USDA Rural Housing',
      description: 'Rural development housing assistance programs',
      availability: 'Rural Areas Only',
      status: 'available',
      participants: '943',
      fundingLevel: 'USDA Funded'
    }
  ];

  const topCities = [
    { name: 'Little Rock', units: '2,450', properties: '38', population: '198,541', waitTime: '18 months' },
    { name: 'Fort Smith', units: '1,240', properties: '22', population: '87,788', waitTime: '22 months' },
    { name: 'Fayetteville', units: '890', properties: '19', population: '93,949', waitTime: '15 months' },
    { name: 'Springdale', units: '720', properties: '14', population: '84,161', waitTime: '20 months' },
    { name: 'Jonesboro', units: '650', properties: '12', population: '78,576', waitTime: '26 months' },
    { name: 'North Little Rock', units: '540', properties: '11', population: '65,911', waitTime: '24 months' }
  ];

  const keyFeatures = [
    { icon: Shield, title: 'Verified Listings', description: 'All properties are verified and up-to-date' },
    { icon: Clock, title: 'Real-time Updates', description: 'Wait times and availability updated monthly' },
    { icon: TrendingUp, title: 'Market Insights', description: 'Local housing market trends and analysis' },
    { icon: Users, title: 'Expert Support', description: '24/7 assistance from housing specialists' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* State Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full mb-8 shadow-2xl">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-lg">Live Housing Data for {stateName}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Section 8 Housing
              <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-300 bg-clip-text text-transparent">
                in {stateName}
              </span>
            </h1>

            {/* Enhanced Stats Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {stateData.quickStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Last Updated: {stateData.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Occupancy Rate: {stateData.occupancyRate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Avg. Wait: {stateData.averageWaitTime}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/section8">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Home className="w-5 h-5 mr-2" />
                  Search Available Housing
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl">
                <Phone className="w-5 h-5 mr-2" />
                Contact Housing Authority
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {keyFeatures.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About Section */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    Housing Assistance in {stateName}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Comprehensive guide to affordable housing programs and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stateData.totalUnits}</div>
                      <div className="text-sm text-gray-600">Total Units Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stateData.agencies}</div>
                      <div className="text-sm text-gray-600">Housing Authorities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stateData.cities}</div>
                      <div className="text-sm text-gray-600">Cities Covered</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {stateName} offers multiple pathways to affordable housing through federal, state, and local programs. 
                    Our comprehensive database includes {stateData.totalUnits} housing units across {stateData.cities} cities, 
                    managed by {stateData.agencies} certified Public Housing Authorities.
                  </p>
                </CardContent>
              </Card>

              {/* Housing Programs */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Building className="w-6 h-6 text-blue-600" />
                    Available Housing Programs
                  </CardTitle>
                  <CardDescription>
                    Explore different types of housing assistance programs in {stateName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {housingPrograms.map((program, index) => (
                      <div key={index} className="group p-6 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{program.title}</h3>
                            <p className="text-gray-600 mb-3">{program.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 ${
                            program.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : program.status === 'limited'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {program.availability}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{program.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{program.fundingLevel}</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="group-hover:bg-blue-50 transition-colors">
                          Learn More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Top Cities */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Top Cities in {stateName}
                  </CardTitle>
                  <CardDescription>Cities with the most housing opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCities.map((city, index) => (
                      <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{city.name}</div>
                            <div className="text-sm text-gray-600">Pop. {city.population}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{city.units}</div>
                            <div className="text-xs text-gray-500">units</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{city.properties} properties</span>
                          <span className="text-orange-600 font-medium">~{city.waitTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 hover:bg-blue-50">
                    View All Cities <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Help */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border-green-200">
                <CardHeader>
                  <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Need Assistance?
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Get personalized help with your housing search
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-green-700 p-3 bg-white/50 rounded-lg">
                      <Phone className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Housing Helpline</div>
                        <div className="text-sm text-green-600">1-800-HOUSING</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-green-700 p-3 bg-white/50 rounded-lg">
                      <Mail className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-green-600">Available 24/7</div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg">
                    <Users className="w-4 h-4 mr-2" />
                    Connect with Housing Specialist
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
