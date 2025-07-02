
import React from 'react';
import { Link } from "react-router-dom";
import { Home, Utensils, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
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
  );
};

export default HeroSection;
