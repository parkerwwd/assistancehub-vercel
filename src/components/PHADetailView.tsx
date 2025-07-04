
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building, Image, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import { GoogleMapsService } from "@/services/googleMapsService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Build full address from the single address field
  const fullAddress = office.address || '';
  
  // Use phone for contact only if it's actually a phone number
  const actualPhone = office.phone && /^[\d\s\-\(\)\+\.]+$/.test(office.phone) ? office.phone : null;

  const phaType = getPHATypeFromData(office);

  // Get Google Maps images
  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '400x250'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '400x250');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  // Helper function to format numbers
  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  // Helper function to format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Info Card */}
        <Card className="shadow-sm border-0">
          {/* Address Image */}
          {fullAddress && !imageError && (
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={showFallback ? staticMapImageUrl : streetViewImageUrl}
                alt={`Street view of ${office.name}`}
                className="w-full h-56 object-cover"
                onError={handleImageError}
                onLoad={() => console.log('Image loaded successfully')}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Image className="w-3 h-3" />
                {showFallback ? 'Map View' : 'Street View'}
              </div>
            </div>
          )}

          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 leading-tight pr-2">
              {office.name}
            </CardTitle>
            {office.pha_code && (
              <CardDescription className="text-sm text-gray-600">
                PHA Code: {office.pha_code}
              </CardDescription>
            )}
            {fullAddress && (
              <CardDescription className="flex items-start text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="leading-relaxed">{fullAddress}</span>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* PHA Type & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  PHA Type
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium border"
                  style={{ 
                    backgroundColor: getPHATypeColor(phaType) + '15',
                    borderColor: getPHATypeColor(phaType) + '30',
                    color: getPHATypeColor(phaType)
                  }}
                >
                  {phaType}
                </span>
              </div>

              {office.phas_designation && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-700">
                    PHAS Designation
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    {office.phas_designation}
                  </span>
                </div>
              )}
            </div>

            {/* View Housing Button */}
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 h-11"
            >
              <Home className="w-4 h-4" />
              View Available Housing in Area
            </Button>
          </CardContent>
        </Card>

        {/* Housing Units Overview */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              Housing Units Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                <div className="text-2xl font-bold text-blue-700">{formatNumber(office.total_units)}</div>
                <div className="text-xs text-gray-600 mt-1">Total Units</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                <div className="text-2xl font-bold text-green-700">{formatNumber(office.total_occupied)}</div>
                <div className="text-xs text-gray-600 mt-1">Total Occupied</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                <div className="text-2xl font-bold text-orange-700">{formatNumber(office.section8_units_count)}</div>
                <div className="text-xs text-gray-600 mt-1">Section 8 Units</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
                <div className="text-2xl font-bold text-purple-700">{formatNumber(office.ph_occupied)}</div>
                <div className="text-xs text-gray-600 mt-1">Public Housing Occupied</div>
              </div>
            </div>

            {/* Additional Unit Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {office.total_dwelling_units && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Dwelling Units</span>
                  <span className="text-sm font-medium">{formatNumber(office.total_dwelling_units)}</span>
                </div>
              )}
              {office.section8_occupied && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Section 8 Occupied</span>
                  <span className="text-sm font-medium">{formatNumber(office.section8_occupied)}</span>
                </div>
              )}
              {office.regular_vacant && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Regular Vacant</span>
                  <span className="text-sm font-medium">{formatNumber(office.regular_vacant)}</span>
                </div>
              )}
              {office.acc_units && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">ACC Units</span>
                  <span className="text-sm font-medium">{formatNumber(office.acc_units)}</span>
                </div>
              )}
              {office.pha_total_units && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">PHA Total Units</span>
                  <span className="text-sm font-medium">{formatNumber(office.pha_total_units)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Occupancy & Reporting Statistics */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Occupancy & Reporting Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {office.pct_occupied && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                  <div className="text-2xl font-bold text-green-700">{formatPercentage(office.pct_occupied)}</div>
                  <div className="text-xs text-gray-600 mt-1">Occupancy Rate</div>
                </div>
              )}
              {office.pct_reported && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                  <div className="text-2xl font-bold text-blue-700">{formatPercentage(office.pct_reported)}</div>
                  <div className="text-xs text-gray-600 mt-1">Reporting Rate</div>
                </div>
              )}
              {office.number_reported && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{formatNumber(office.number_reported)}</div>
                  <div className="text-xs text-gray-600 mt-1">Number Reported</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {office.opfund_amount && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-700">Operating Fund Amount</span>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(office.opfund_amount)}</span>
                </div>
              )}
              {office.opfund_amount_prev_yr && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">Operating Fund (Previous Year)</span>
                  <span className="text-sm font-bold text-blue-700">{formatCurrency(office.opfund_amount_prev_yr)}</span>
                </div>
              )}
              {office.capfund_amount && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-700">Capital Fund Amount</span>
                  <span className="text-sm font-bold text-purple-700">{formatCurrency(office.capfund_amount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Size Categories */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Size Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {office.combined_size_category && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Combined Size Category</span>
                  <span className="text-sm font-medium">{office.combined_size_category}</span>
                </div>
              )}
              {office.low_rent_size_category && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Low Rent Size Category</span>
                  <span className="text-sm font-medium">{office.low_rent_size_category}</span>
                </div>
              )}
              {office.section8_size_category && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Section 8 Size Category</span>
                  <span className="text-sm font-medium">{office.section8_size_category}</span>
                </div>
              )}
              {office.program_type && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Program Type</span>
                  <span className="text-sm font-medium">{office.program_type}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actualPhone && (
              <a 
                href={`tel:${actualPhone}`}
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
              >
                <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                  {actualPhone}
                </span>
              </a>
            )}
            
            {office.email && (
              <a 
                href={`mailto:${office.email}`}
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group border border-purple-100"
              >
                <FileText className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
                <span className="text-purple-700 group-hover:text-purple-800 font-medium text-sm">
                  {office.email}
                </span>
              </a>
            )}

            {office.fax && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <FileText className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-sm">
                  Fax: {office.fax}
                </span>
              </div>
            )}

            {/* Executive Director Contact */}
            {(office.exec_dir_phone || office.exec_dir_email || office.exec_dir_fax) && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Executive Director</h4>
                <div className="space-y-2">
                  {office.exec_dir_phone && (
                    <div className="flex items-center p-2 bg-gray-50 rounded">
                      <Phone className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="text-sm">{office.exec_dir_phone}</span>
                    </div>
                  )}
                  {office.exec_dir_email && (
                    <div className="flex items-center p-2 bg-gray-50 rounded">
                      <FileText className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="text-sm">{office.exec_dir_email}</span>
                    </div>
                  )}
                  {office.exec_dir_fax && (
                    <div className="flex items-center p-2 bg-gray-50 rounded">
                      <FileText className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="text-sm">Fax: {office.exec_dir_fax}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Administrative Information */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Administrative Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {office.fiscal_year_end && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Fiscal Year End</span>
                  <span className="text-sm font-medium">{office.fiscal_year_end}</span>
                </div>
              )}
              {office.last_updated && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(office.last_updated).toLocaleDateString()}
                  </span>
                </div>
              )}
              {office.created_at && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Record Created</span>
                  <span className="text-sm font-medium">
                    {new Date(office.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Source Footer */}
        <Card className="shadow-sm border-0">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 text-center">
              Data sourced from HUD PHA Contact Information API
              <br />
              Record ID: {office.id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHADetailView;
