
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone } from "lucide-react";

// Mock data for SNAP offices - in a real app, this would come from an API
const mockSNAPData = [
  {
    id: 1,
    name: "Los Angeles County DPSS",
    address: "12860 Crossroads Pkwy S, Industry, CA 91746",
    phone: "(866) 613-3777",
    website: "www.dpss.lacounty.gov",
    hours: "Mon-Fri: 7:30 AM - 5:30 PM",
    services: ["SNAP Applications", "CalFresh", "Recertification"],
    city: "Los Angeles",
    state: "CA"
  },
  {
    id: 2,
    name: "NYC Human Resources Administration",
    address: "180 Water St, New York, NY 10038",
    phone: "(718) 557-1399",
    website: "www.nyc.gov/hra",
    hours: "Mon-Fri: 8:30 AM - 5:00 PM",
    services: ["SNAP Applications", "Food Stamps", "Emergency Food"],
    city: "New York",
    state: "NY"
  },
  {
    id: 3,
    name: "Illinois Department of Human Services",
    address: "401 S Clinton St, Chicago, IL 60607",
    phone: "(800) 843-6154",
    website: "www.dhs.state.il.us",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    services: ["SNAP Benefits", "Food Assistance", "Online Applications"],
    city: "Chicago",
    state: "IL"
  },
  {
    id: 4,
    name: "Florida Department of Children and Families",
    address: "401 NW 2nd Ave, Miami, FL 33128",
    phone: "(866) 762-2237",
    website: "www.myflfamilies.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    services: ["SNAP Applications", "Food Assistance", "Emergency SNAP"],
    city: "Miami",
    state: "FL"
  }
];

const SNAP = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(mockSNAPData);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(mockSNAPData);
      return;
    }

    const filtered = mockSNAPData.filter(
      office => 
        office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-900 hover:text-blue-800 transition-colors">
                AssistanceHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/section8" className="text-gray-700 hover:text-blue-900 transition-colors">
                Section 8
              </Link>
              <Link to="/snap" className="text-green-700 font-medium">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SNAP Benefits Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find SNAP (Supplemental Nutrition Assistance Program) offices in your area, get contact information, and learn about food assistance programs.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter city, state, or office name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Found {searchResults.length} SNAP Office{searchResults.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="grid gap-6">
            {searchResults.map((office) => (
              <Card key={office.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">{office.name}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {office.address}
                      </CardDescription>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      SNAP Office
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <a href={`tel:${office.phone}`} className="text-green-600 hover:text-green-800 transition-colors">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-2 text-gray-500" />
                      <a 
                        href={`https://${office.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        {office.website}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Hours:</strong> {office.hours}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Services Available:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {office.services.map((service, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About SNAP Benefits</h3>
          <div className="prose text-gray-700">
            <p className="mb-4">
              SNAP (Supplemental Nutrition Assistance Program) provides nutrition benefits to supplement the food budget of needy families so they can purchase healthy food and move towards self-sufficiency.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Eligibility Requirements:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Income limits based on household size</li>
                  <li>• U.S. citizenship or qualified non-citizen status</li>
                  <li>• Work requirements for able-bodied adults</li>
                  <li>• Resource limits (savings, assets)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Apply:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Visit your local SNAP office</li>
                  <li>• Apply online through your state's website</li>
                  <li>• Call your state's SNAP hotline</li>
                  <li>• Complete an interview (phone or in-person)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SNAP;
