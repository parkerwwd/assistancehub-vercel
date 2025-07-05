
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building, Image, Map, Mail, Shield, Calendar } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor, getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import { GoogleMapsService } from "@/services/googleMapsService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
  onShowMap?: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack, onShowMap }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const fullAddress = office.address || 'Address not available';
  const phaType = getPHATypeFromData(office);
  const waitlistStatus = 'Unknown';

  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '400x200'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '400x200');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Hero Image Section - Separated */}
        {fullAddress && !imageError && (
          <Card className="overflow-hidden shadow-lg border-0 bg-white">
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img
                src={showFallback ? staticMapImageUrl : streetViewImageUrl}
                alt={`View of ${office.name}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm">
                <Image className="w-3 h-3" />
                {showFallback ? 'Map View' : 'Street View'}
              </div>
            </div>
          </Card>
        )}

        {/* Basic Information Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {office.name}
              </h1>
              {fullAddress && (
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mt-0.5 text-blue-600" />
                  <span className="text-lg">{fullAddress}</span>
                </div>
              )}
            </div>

            {/* Show Map Button - Only if onShowMap is available */}
            {onShowMap && (
              <Button
                onClick={onShowMap}
                variant="outline"
                className="flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 h-12 mb-6"
              >
                <Map className="w-5 h-5" />
                Show on Map
              </Button>
            )}

            {/* Status Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Building className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xs text-gray-500 mb-1">PHA Type</div>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium inline-block"
                  style={{ 
                    backgroundColor: getPHATypeColor(phaType) + '20',
                    color: getPHATypeColor(phaType)
                  }}
                >
                  {phaType}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-xs text-gray-500 mb-1">Waitlist Status</div>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium inline-block"
                  style={{ 
                    backgroundColor: getWaitlistColor(waitlistStatus) + '20',
                    color: getWaitlistColor(waitlistStatus)
                  }}
                >
                  {waitlistStatus}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Information
            </CardTitle>
            <CardDescription>Get in touch with this housing authority</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {office.phone && (
              <a 
                href={`tel:${office.phone}`}
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all group border border-blue-100 hover:border-blue-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Main Phone</div>
                  <div className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                    {office.phone}
                  </div>
                </div>
              </a>
            )}
            
            {office.email && (
              <a 
                href={`mailto:${office.email}`}
                className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all group border border-green-100 hover:border-green-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">General Email</div>
                  <div className="text-lg font-semibold text-green-700 group-hover:text-green-800 break-all">
                    {office.email}
                  </div>
                </div>
              </a>
            )}

            {office.exec_dir_email && (
              <a 
                href={`mailto:${office.exec_dir_email}`}
                className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all group border border-purple-100 hover:border-purple-200"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Executive Director</div>
                  <div className="text-lg font-semibold text-purple-700 group-hover:text-purple-800 break-all">
                    {office.exec_dir_email}
                  </div>
                </div>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Program Information Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Home className="w-5 h-5 text-purple-600" />
              Housing Programs
            </CardTitle>
            <CardDescription>Available housing assistance programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {office.program_type && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Program Type</span>
                </div>
                <p className="text-lg font-semibold text-purple-700">{office.program_type}</p>
              </div>
            )}

            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Section 8 Housing Choice Vouchers</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Public Housing Units</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Emergency Housing Assistance</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Senior Housing Programs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Details Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-orange-600" />
              Office Information
            </CardTitle>
            <CardDescription>Hours of operation and additional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {office.pha_code && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">PHA Code</span>
                </div>
                <p className="text-lg font-semibold text-gray-700">{office.pha_code}</p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Office Hours</span>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Friday</span>
                  <span>8:00 AM - 4:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Saturday - Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Last Updated</span>
              </div>
              <p className="text-sm text-blue-700">
                {new Date(office.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Footer */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Data sourced from HUD PHA Contact Information API</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHADetailView;
