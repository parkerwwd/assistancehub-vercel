
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";

const Section8 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-900 hover:text-blue-800 transition-colors">
                AssistanceHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/section8" className="text-blue-900 font-medium px-3 py-2 rounded-md bg-blue-50">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Page Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Section 8 Housing Search
          </h1>
          <p className="text-sm text-gray-600">
            Find Public Housing Authorities (PHA) in your area and check waitlist status
          </p>
        </div>

        {/* Full Height Map View */}
        <div className="h-[calc(100vh-180px)]">
          <MapView />
        </div>

        {/* Compact Info Section */}
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About Section 8 Housing</h3>
              <p className="text-sm text-gray-700 mb-2">
                The Section 8 Housing Choice Voucher program helps low-income families, elderly, and disabled individuals afford decent, safe housing. Participants pay about 30% of their income for rent.
              </p>
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Waitlist status can change frequently. Contact the PHA directly for current information.
              </p>
            </div>
            <div className="flex space-x-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Open</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span>Limited</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section8;
