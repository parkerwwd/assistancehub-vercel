
import React from 'react';
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-900 hover:text-blue-800 transition-colors">
                AssistanceHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/section8" className="text-gray-700 hover:text-blue-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Housing & Food Assistance
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with local resources for Section 8 housing and SNAP benefits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/section8">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 w-full sm:w-auto">
                  <Home className="w-5 h-5 mr-2" />
                  Find Housing
                </Button>
              </Link>
              <Link to="/snap">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 w-full sm:w-auto">
                  <Utensils className="w-5 h-5 mr-2" />
                  Food Assistance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Help</h2>
          <p className="text-lg text-gray-600">
            We connect you with essential assistance programs in your community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-600" />
                Section 8 Housing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Find Public Housing Authorities (PHAs) near you that administer the Housing Choice Voucher program. Get help with affordable housing options.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Locate nearby housing authorities</li>
                <li>• Check waitlist status</li>
                <li>• Get contact information</li>
                <li>• Learn about application processes</li>
              </ul>
              <Link to="/section8" className="inline-block mt-4">
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Search Housing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-6 h-6 text-green-600" />
                SNAP Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Find local SNAP offices to apply for food assistance benefits. Get information about eligibility and application requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Find SNAP offices near you</li>
                <li>• Check office hours and locations</li>
                <li>• Get contact information</li>
                <li>• Learn about eligibility requirements</li>
              </ul>
              <Link to="/snap" className="inline-block mt-4">
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find SNAP Office
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Getting Started is Easy
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Use our search tools to find assistance programs in your area. Each listing includes 
              contact information, office hours, and details about services offered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
