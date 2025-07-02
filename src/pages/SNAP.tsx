
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";

const SNAP = () => {
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
              <Link to="/snap" className="text-blue-900 font-medium px-3 py-2 rounded-md bg-blue-50">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SNAP Food Assistance
          </h1>
          <p className="text-gray-600">
            Find local SNAP offices to apply for food assistance benefits
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">SNAP Office Locator Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              We're working on adding a comprehensive SNAP office locator to help you find food assistance in your area.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll be able to do:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Search for SNAP offices by location</li>
                <li>• View office hours and contact information</li>
                <li>• Get directions and accessibility information</li>
                <li>• Learn about application requirements</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              In the meantime, visit your state's SNAP website or call 211 for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SNAP;
