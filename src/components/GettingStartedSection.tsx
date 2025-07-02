
import React from 'react';
import { Building } from "lucide-react";

const GettingStartedSection = () => {
  return (
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
  );
};

export default GettingStartedSection;
