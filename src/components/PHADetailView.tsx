
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building, Image, Mail, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor, getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
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

  console.log('PHADetailView received office data:', office);

  // Build full address, handling the case where city might be in phone field
  const addressParts = [office.address];
  
  // Check if phone field contains city name (non-numeric data)
  const phoneContainsCity = office.phone && !/^[\d\s\-\(\)\+\.]+$/.test(office.phone);
  
  if (phoneContainsCity) {
    addressParts.push(office.phone);
  } else if (office.city) {
    addressParts.push(office.city);
  }
  
  if (office.state) {
    addressParts.push(office.state);
  }
  
  if (office.zip) {
    addressParts.push(office.zip);
  }
  
  const fullAddress = addressParts.filter(Boolean).join(', ');
  
  // Use phone for contact only if it's actually a phone number
  const actualPhone = phoneContainsCity ? null : office.phone;

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
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="shadow-sm border-0 mb-4">
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
              {office.name || 'No name available'}
            </CardTitle>
            {fullAddress && (
              <CardDescription className="flex items-start text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="leading-relaxed">{fullAddress}</span>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* PHA Information - Most prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {office.pha_code && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PHA Code
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{office.pha_code}</span>
                </div>
              )}
            </div>

            {/* Waitlist Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Waitlist Status
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium border"
                style={{ 
                  backgroundColor: getWaitlistColor(office.waitlist_status || 'Unknown') + '15',
                  borderColor: getWaitlistColor(office.waitlist_status || 'Unknown') + '30',
                  color: getWaitlistColor(office.waitlist_status || 'Unknown')
                }}
              >
                {office.waitlist_status || 'Unknown'}
              </span>
            </div>

            {/* Performance Status */}
            {office.performance_status && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Status
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {office.performance_status}
                </span>
              </div>
            )}

            {/* Contact Information - Enhanced */}
            {(actualPhone || office.fax || office.email || office.website) && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm mb-3">Contact Information</h4>
                
                {actualPhone && (
                  <a 
                    href={`tel:${actualPhone}`}
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
                  >
                    <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-blue-700 group-hover:text-blue-800 font-medium block">
                        {actualPhone}
                      </span>
                      <span className="text-xs text-blue-600">Main Phone</span>
                    </div>
                  </a>
                )}

                {office.fax && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
                    <Phone className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700 font-medium block">{office.fax}</span>
                      <span className="text-xs text-gray-600">Fax</span>
                    </div>
                  </div>
                )}

                {office.email && (
                  <a 
                    href={`mailto:${office.email}`}
                    className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group border border-purple-100"
                  >
                    <Mail className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
                    <div>
                      <span className="text-purple-700 group-hover:text-purple-800 font-medium text-sm block">
                        {office.email}
                      </span>
                      <span className="text-xs text-purple-600">Email</span>
                    </div>
                  </a>
                )}
                
                {office.website && (
                  <a 
                    href={office.website.startsWith('http') ? office.website : `https://${office.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group border border-green-100"
                  >
                    <ExternalLink className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 group-hover:text-green-800 font-medium">
                      Visit Website
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* Executive Director Information */}
            {(office.exec_dir_phone || office.exec_dir_fax || office.exec_dir_email) && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm mb-3">Executive Director Contact</h4>
                
                {office.exec_dir_phone && (
                  <a 
                    href={`tel:${office.exec_dir_phone}`}
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
                  >
                    <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-blue-700 group-hover:text-blue-800 font-medium block">
                        {office.exec_dir_phone}
                      </span>
                      <span className="text-xs text-blue-600">Executive Director Phone</span>
                    </div>
                  </a>
                )}

                {office.exec_dir_fax && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
                    <Phone className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700 font-medium block">{office.exec_dir_fax}</span>
                      <span className="text-xs text-gray-600">Executive Director Fax</span>
                    </div>
                  </div>
                )}

                {office.exec_dir_email && (
                  <a 
                    href={`mailto:${office.exec_dir_email}`}
                    className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group border border-purple-100"
                  >
                    <Mail className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
                    <div>
                      <span className="text-purple-700 group-hover:text-purple-800 font-medium text-sm block">
                        {office.exec_dir_email}
                      </span>
                      <span className="text-xs text-purple-600">Executive Director Email</span>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Program & Size Categories */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm mb-3">Program Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {office.program_type && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium text-gray-700">Program Type</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{office.program_type}</p>
                  </div>
                )}

                {office.combined_size_category && (
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-medium text-gray-700">Combined Size Category</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{office.combined_size_category}</p>
                  </div>
                )}

                {office.low_rent_size_category && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Low Rent Size Category</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{office.low_rent_size_category}</p>
                  </div>
                )}

                {office.section8_size_category && (
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-pink-600" />
                      <span className="text-xs font-medium text-gray-700">Section 8 Size Category</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{office.section8_size_category}</p>
                  </div>
                )}

                {office.fiscal_year_end && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">Fiscal Year End</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{office.fiscal_year_end}</p>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-gray-700">Housing Choice Voucher (HCV) Support</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {office.supports_hcv ? 'Supported' : 'Not Supported'}
                  </p>
                </div>
              </div>
            </div>

            {/* Housing Units Statistics */}
            {(office.total_units || office.total_dwelling_units || office.ph_occupied || office.section8_units_count || office.section8_occupied) && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 text-sm mb-3">Housing Units & Occupancy Statistics</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {office.total_units && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                      <div className="text-2xl font-bold text-blue-700">{office.total_units.toLocaleString()}</div>
                      <div className="text-xs text-blue-600 mt-1">Total Units</div>
                    </div>
                  )}

                  {office.total_dwelling_units && office.total_dwelling_units !== office.total_units && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                      <div className="text-2xl font-bold text-green-700">{office.total_dwelling_units.toLocaleString()}</div>
                      <div className="text-xs text-green-600 mt-1">Total Dwelling Units</div>
                    </div>
                  )}

                  {office.ph_occupied && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
                      <div className="text-2xl font-bold text-purple-700">{office.ph_occupied.toLocaleString()}</div>
                      <div className="text-xs text-purple-600 mt-1">Public Housing Occupied</div>
                    </div>
                  )}

                  {office.section8_units_count && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                      <div className="text-2xl font-bold text-orange-700">{office.section8_units_count.toLocaleString()}</div>
                      <div className="text-xs text-orange-600 mt-1">Section 8 Units Available</div>
                    </div>
                  )}

                  {office.section8_occupied && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                      <div className="text-2xl font-bold text-red-700">{office.section8_occupied.toLocaleString()}</div>
                      <div className="text-xs text-red-600 mt-1">Section 8 Units Occupied</div>
                    </div>
                  )}

                  {office.waitlist_open !== null && (
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
                      <div className="text-2xl font-bold text-cyan-700">
                        {office.waitlist_open ? 'OPEN' : 'CLOSED'}
                      </div>
                      <div className="text-xs text-cyan-600 mt-1">Waitlist Status</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Office Hours */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Typical Office Hours</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
                <p>Saturday - Sunday: Closed</p>
                <p className="text-xs text-gray-500 mt-2">*Hours may vary. Please call to confirm.</p>
              </div>
            </div>

            {/* View Housing Button */}
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 h-11"
            >
              <Home className="w-4 h-4" />
              View Available Housing in Area
            </Button>

            {/* Available Programs */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Available Housing Programs</h4>
              <div className="space-y-2 text-sm">
                {office.supports_hcv && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    Section 8 Housing Choice Vouchers
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  Public Housing Units
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  Emergency Housing Assistance
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  Senior Housing Programs
                </div>
              </div>
            </div>

            {/* Jurisdictions */}
            {office.jurisdictions && office.jurisdictions.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">Service Areas & Jurisdictions</h4>
                <div className="flex flex-wrap gap-2">
                  {office.jurisdictions.map((jurisdiction, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source - Footer */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Data sourced from HUD PHA Contact Information API
                {office.last_updated && (
                  <span className="block mt-1">
                    Last updated: {new Date(office.last_updated).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHADetailView;
