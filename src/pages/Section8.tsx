import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Map } from "lucide-react";
import MapView from "@/components/MapView";

// Mock data for PHA offices - in a real app, this would come from an API
const mockPHAData = [
  {
    id: 1,
    name: "Los Angeles Housing Authority",
    address: "2600 Wilshire Blvd, Los Angeles, CA 90057",
    phone: "(213) 252-2500",
    website: "www.hacla.org",
    waitlistStatus: "Closed",
    city: "Los Angeles",
    state: "CA"
  },
  {
    id: 2,
    name: "New York City Housing Authority",
    address: "250 Broadway, New York, NY 10007",
    phone: "(212) 306-3000",
    website: "www.nyc.gov/nycha",
    waitlistStatus: "Limited Opening",
    city: "New York",
    state: "NY"
  },
  {
    id: 3,
    name: "Chicago Housing Authority",
    address: "60 E Van Buren St, Chicago, IL 60605",
    phone: "(312) 742-8500",
    website: "www.thecha.org",
    waitlistStatus: "Open",
    city: "Chicago",
    state: "IL"
  },
  {
    id: 4,
    name: "Miami-Dade Public Housing Authority",
    address: "701 NW 1st Ct, Miami, FL 33136",
    phone: "(305) 375-1313",
    website: "www.miamidade.gov/housing",
    waitlistStatus: "Closed",
    city: "Miami",
    state: "FL"
  }
];

const Section8 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(mockPHAData);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(mockPHAData);
      return;
    }

    const filtered = mockPHAData.filter(
      office => 
        office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const getWaitlistColor = (status: string) => {
    switch (status) {
      case "Open": return "text-green-600 bg-green-100";
      case "Limited Opening": return "text-yellow-600 bg-yellow-100";
      case "Closed": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
              <Link to="/section8" className="text-blue-900 font-medium">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-900 transition-colors">
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
            Section 8 Housing Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find Public Housing Authorities (PHA) in your area, get contact information, and check waitlist status for Section 8 housing assistance.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="rounded-md"
            >
              <Search className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              onClick={() => setViewMode("map")}
              className="rounded-md"
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <MapView />
        ) : (
          <>
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter city, state, or PHA name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Found {searchResults.length} PHA Office{searchResults.length !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid gap-6">
                {searchResults.map((office) => (
                  <Card key={office.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl text-gray-900">{office.name}</CardTitle>
                          <CardDescription className="flex items-center mt-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {office.address}
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getWaitlistColor(office.waitlistStatus)}`}>
                          Waitlist: {office.waitlistStatus}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <a href={`tel:${office.phone}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            {office.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Search className="w-4 h-4 mr-2 text-gray-500" />
                          <a 
                            href={`https://${office.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {office.website}
                          </a>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Services:</strong> Section 8 Housing Choice Vouchers, Public Housing, Housing Applications
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About Section 8 Housing</h3>
          <div className="prose text-gray-700">
            <p className="mb-4">
              The Section 8 Housing Choice Voucher program helps low-income families, elderly, and disabled individuals afford decent, safe housing in the private market. Participants pay about 30% of their income for rent, and the program pays the remainder.
            </p>
            <p>
              <strong>Important:</strong> Waitlist status can change frequently. Contact the PHA directly for the most current information about applications and availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section8;
