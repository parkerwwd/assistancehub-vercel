
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";

const Section8 = () => {
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

        {/* Map View */}
        <MapView />

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
