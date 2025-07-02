
import React from 'react';
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Utensils, Users, Building, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                AssistanceHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/section8" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Trusted by thousands of families
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Find Housing &
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Food Assistance
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Connect with local resources for Section 8 housing and SNAP benefits. 
                Fast, free, and designed to help you find the support you need.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/section8">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 w-full sm:w-auto text-lg px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <Home className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Find Housing
                </Button>
              </Link>
              <Link to="/snap">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto text-lg px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <Utensils className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Food Assistance
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">2,500+</div>
                <div className="text-blue-200">Housing Authorities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-blue-200">SNAP Offices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50 States</div>
                <div className="text-blue-200">Nationwide Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">How We Help You Succeed</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We connect you with essential assistance programs in your community, 
            making it easier to access the support you deserve.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-900">Section 8 Housing</div>
                  <div className="text-sm font-normal text-gray-500 mt-1">Housing Choice Voucher Program</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                Find Public Housing Authorities (PHAs) near you that administer the Housing Choice Voucher program. 
                Get help with affordable housing options and application guidance.
              </p>
              
              <div className="space-y-3">
                {[
                  "Locate nearby housing authorities",
                  "Check waitlist status",
                  "Get contact information",
                  "Learn about application processes"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/section8" className="inline-block mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold group">
                  <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Search Housing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Utensils className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="text-gray-900">SNAP Benefits</div>
                  <div className="text-sm font-normal text-gray-500 mt-1">Supplemental Nutrition Assistance</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                Find local SNAP offices to apply for food assistance benefits. 
                Get information about eligibility requirements and application processes.
              </p>
              
              <div className="space-y-3">
                {[
                  "Find SNAP offices near you",
                  "Check office hours and locations",
                  "Get contact information",
                  "Learn about eligibility requirements"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/snap" className="inline-block mt-6">
                <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 font-semibold group">
                  <MapPin className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Find SNAP Office
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building className="w-4 h-4" />
              Simple and effective
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Getting Started is Easy
            </h3>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Use our search tools to find assistance programs in your area. Each listing includes 
              contact information, office hours, and details about services offered. 
              Start your search today and connect with the resources that can help you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
