
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, FileText, ArrowLeft, Building, Image, Map, Mail, Shield, Calendar } from "lucide-react";
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

  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '300x150'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '300x150');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Search
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 space-y-3">
        {/* Hero Image Section */}
        {fullAddress && !imageError && (
          <Card className="overflow-hidden shadow-sm border-0 bg-white">
            <div className="relative h-32 overflow-hidden">
              <img
                src={showFallback ? staticMapImageUrl : streetViewImageUrl}
                alt={`View of ${office.name}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                <Image className="w-2 h-2" />
                {showFallback ? 'Map' : 'Street'}
              </div>
            </div>
          </Card>
        )}

        {/* Basic Information Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-3">
            <div className="mb-2">
              <h1 className="text-lg font-bold text-gray-900 mb-1">
                {office.name}
              </h1>
              {fullAddress && (
                <div className="flex items-start gap-2 text-gray-600 mb-2">
                  <MapPin className="w-3 h-3 mt-0.5 text-blue-600" />
                  <span className="text-xs">{fullAddress}</span>
                </div>
              )}
            </div>

            {/* Show Map Button */}
            {onShowMap && (
              <Button
                onClick={onShowMap}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-7 mb-2 text-xs"
              >
                <Map className="w-3 h-3" />
                Show on Map
              </Button>
            )}

            {/* PHA Type and PHA Code Side by Side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Building className="w-3 h-3 mx-auto mb-1 text-blue-600" />
                <div className="text-xs text-gray-500 mb-1">PHA Type</div>
                <div 
                  className="px-2 py-0.5 rounded-full text-xs font-medium inline-block"
                  style={{ 
                    backgroundColor: getPHATypeColor(phaType) + '20',
                    color: getPHATypeColor(phaType)
                  }}
                >
                  {phaType}
                </div>
              </div>
              
              {office.pha_code && (
                <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <FileText className="w-3 h-3 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs text-gray-500 mb-1">PHA Code</div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium inline-block bg-gray-200 text-gray-700">
                    {office.pha_code}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-3 h-3 text-blue-600" />
              Contact Information
            </CardTitle>
            <CardDescription className="text-xs">Get in touch with this housing authority</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {office.phone && (
              <a 
                href={`tel:${office.phone}`}
                className="flex items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all group border border-blue-100 hover:border-blue-200"
              >
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2 group-hover:bg-blue-200 transition-colors">
                  <Phone className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">Main Phone</div>
                  <div className="text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                    {office.phone}
                  </div>
                </div>
              </a>
            )}
            
            {office.email && (
              <a 
                href={`mailto:${office.email}`}
                className="flex items-center p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-all group border border-green-100 hover:border-green-200"
              >
                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2 group-hover:bg-green-200 transition-colors">
                  <Mail className="w-3 h-3 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-900">General Email</div>
                  <div className="text-sm font-semibold text-green-700 group-hover:text-green-800 break-all">
                    {office.email}
                  </div>
                </div>
              </a>
            )}

            {office.exec_dir_email && (
              <a 
                href={`mailto:${office.exec_dir_email}`}
                className="flex items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all group border border-purple-100 hover:border-purple-200"
              >
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2 group-hover:bg-purple-200 transition-colors">
                  <Mail className="w-3 h-3 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-900">Executive Director</div>
                  <div className="text-sm font-semibold text-purple-700 group-hover:text-purple-800 break-all">
                    {office.exec_dir_email}
                  </div>
                </div>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Program Information Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="w-3 h-3 text-purple-600" />
              Housing Programs
            </CardTitle>
            <CardDescription className="text-xs">Available housing assistance programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {office.program_type && (
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-3 h-3 text-purple-600" />
                  <span className="font-medium text-gray-900 text-xs">Program Type</span>
                </div>
                <p className="text-sm font-semibold text-purple-700">{office.program_type}</p>
              </div>
            )}

            <div className="grid gap-1">
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium">Section 8 Housing Choice Vouchers</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium">Public Housing Units</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="text-xs font-medium">Emergency Housing Assistance</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <span className="text-xs font-medium">Senior Housing Programs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Details Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-3 h-3 text-blue-600" />
              Last Updated
            </CardTitle>
            <CardDescription className="text-xs">Data information</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700">
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
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Data sourced from HUD PHA Contact Information API</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHADetailView;
