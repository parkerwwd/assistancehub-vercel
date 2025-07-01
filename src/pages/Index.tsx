
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Phone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">AssistanceHub</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/section8" className="text-gray-700 hover:text-blue-900 transition-colors">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-900 transition-colors">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Find Government
            <span className="text-blue-600"> Assistance</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Your comprehensive resource for finding housing assistance, food benefits, and other government programs in your area.
          </p>
        </div>

        {/* Program Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/section8">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Section 8 Housing</CardTitle>
                <CardDescription className="text-lg">
                  Find Public Housing Authorities, contact information, and available housing opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    PHA Offices
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact Info
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/snap">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">SNAP Benefits</CardTitle>
                <CardDescription className="text-lg">
                  Locate SNAP offices, application centers, and get contact information for food assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    SNAP Offices
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Phone Numbers
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose a program above to find resources and assistance in your area. All information is free and updated regularly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/section8">Search Section 8</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/snap">Find SNAP Offices</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>AssistanceHub</strong> - Your guide to government assistance programs
            </p>
            <p className="text-sm">
              This tool provides information about government assistance programs. Please verify all information with official sources.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
