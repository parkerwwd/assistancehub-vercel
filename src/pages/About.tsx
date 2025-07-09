import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, MapPin, Users, Shield, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            About AssistanceHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your comprehensive guide to finding Section 8 housing assistance across the United States.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Heart className="w-6 h-6 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              We believe everyone deserves access to safe, affordable housing. AssistanceHub connects 
              individuals and families with Public Housing Authorities (PHAs) nationwide, making it 
              easier to find and apply for Section 8 housing assistance programs.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-600" />
                  Find Local PHAs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Search by city, state, or ZIP code to find Public Housing Authorities 
                  in your area with up-to-date contact information and program details.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Interactive Maps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualize PHA locations on interactive maps to find the most 
                  convenient housing authorities near you.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  Program Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access detailed information about housing programs, including 
                  Section 8 Housing Choice Vouchers and Public Housing options.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Reliable Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our database is regularly updated with official PHA information 
                  to ensure you have access to current and accurate details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription>Getting started is simple</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Search Your Area</h3>
                <p className="text-sm text-gray-600">
                  Enter your city, state, or ZIP code in our search bar
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Browse Results</h3>
                <p className="text-sm text-gray-600">
                  View nearby PHAs on the map and in the search results
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get In Touch</h3>
                <p className="text-sm text-gray-600">
                  Contact the PHA directly for applications and assistance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-8 shadow-lg border-0 bg-amber-50/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <Shield className="w-5 h-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              This site is privately owned and operated. We are not affiliated with any government 
              agency or Public Housing Authority. We provide information to help you connect with 
              official housing programs, but applications must be submitted directly to the appropriate PHA.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Housing Assistance?</h2>
          <p className="text-gray-600 mb-6">Start your search today and connect with local housing authorities.</p>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Home className="w-5 h-5 mr-2" />
              Start Your Search
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About; 