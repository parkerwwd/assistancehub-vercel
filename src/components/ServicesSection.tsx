
import React from 'react';
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Utensils, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicesSection = () => {
  return (
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
  );
};

export default ServicesSection;
