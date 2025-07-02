
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";
import MapFilters from "@/components/MapFilters";
import { useMapLogic } from "@/hooks/useMapLogic";

const Section8 = () => {
  const {
    showFilters,
    setShowFilters,
    handleCitySelect,
    handleSearch
  } = useMapLogic();

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Section 8 Housing Search
          </h1>
          <p className="text-gray-600">
            Find Public Housing Authorities (PHA) in your area and check waitlist status
          </p>
        </div>

        {/* Search Bar - Above Map */}
        <div className="mb-4">
          <MapFilters
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onCitySelect={handleCitySelect}
            onSearch={handleSearch}
          />
        </div>

        {/* Map View - Without integrated search */}
        <div className="h-[400px] mb-6">
          <MapView hideSearch={true} />
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About Section 8 Housing</h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                The Section 8 Housing Choice Voucher program helps low-income families, elderly, and disabled individuals afford decent, safe housing. Participants pay about 30% of their income for rent.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Waitlist status can change frequently. Contact the PHA directly for current information.
              </p>
            </div>
            <div className="flex flex-col space-y-3 text-sm ml-8 flex-shrink-0">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Open</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Limited</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
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
