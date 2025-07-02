
import React from 'react';
import { Link } from "react-router-dom";
import PHADataManager from "@/components/PHADataManager";

const PHAAdmin = () => {
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
              <Link to="/pha-admin" className="text-blue-900 font-medium px-3 py-2 rounded-md bg-blue-50">
                PHA Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PHA Data Administration
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage and import Public Housing Authority data from HUD's official API. 
            Keep your PHA database current with the latest contact information and program details.
          </p>
        </div>

        {/* Data Manager */}
        <PHADataManager />

        {/* Additional Information */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HUD API Integration</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data Sources</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HUD PHA Contact Information API</li>
                  <li>• Housing Choice Voucher participation data</li>
                  <li>• Jurisdiction and service area information</li>
                  <li>• Contact details and websites</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Update Schedule</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monthly: PHA contact information</li>
                  <li>• Quarterly: Program participation data</li>
                  <li>• As needed: Waitlist status updates</li>
                  <li>• Real-time: User-reported corrections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHAAdmin;
