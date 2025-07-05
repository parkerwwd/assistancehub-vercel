
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building, Image, Map, Mail, Shield, Calendar, Globe, User } from "lucide-react";
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
    size: '600x200'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '600x200');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
            
            {onShowMap && (
              <Button
                onClick={onShowMap}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                View Map
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero Card - Compact */}
            <Card className="overflow-hidden">
              {fullAddress && !imageError && (
                <div className="relative h-48">
                  <img
                    src={showFallback ? staticMapImageUrl : streetViewImageUrl}
                    alt={`View of ${office.name}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {office.name}
                    </h1>
                    <div className="flex items-start gap-2 text-white/90">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{fullAddress}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                      <Image className="w-3 h-3 mr-1" />
                      {showFallback ? 'Map' : 'Street View'}
                    </Badge>
                  </div>
                </div>
              )}
              
              {(imageError || !fullAddress) && (
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {office.name}
                  </CardTitle>
                  {fullAddress && (
                    <div className="flex items-start gap-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-blue-600" />
                      <span>{fullAddress}</span>
                    </div>
                  )}
                </CardHeader>
              )}
            </Card>

            {/* Housing Programs - Compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Available Housing Programs
                </CardTitle>
                <CardDescription>Housing assistance programs offered by this authority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {office.program_type && (
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                    {office.program_type}
                  </Badge>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Section 8 Vouchers</div>
                      <div className="text-xs text-gray-600">Housing Choice Voucher</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Public Housing</div>
                      <div className="text-xs text-gray-600">Low-income units</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <div className="text-center">
                  <Button
                    onClick={() => onViewHousing(office)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    View Housing Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Compact */}
          <div className="space-y-4">
            {/* PHA Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  PHA Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">Authority Type</div>
                  <Badge 
                    className="text-sm px-3 py-1"
                    style={{ 
                      backgroundColor: getPHATypeColor(phaType) + '20',
                      color: getPHATypeColor(phaType),
                      border: `1px solid ${getPHATypeColor(phaType)}40`
                    }}
                  >
                    {phaType}
                  </Badge>
                </div>
                
                {office.pha_code && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">PHA Code</div>
                    <div className="font-mono text-lg font-semibold text-gray-900">
                      {office.pha_code}
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                    <Calendar className="w-3 h-3" />
                    Last Updated
                  </div>
                  <div className="text-blue-800 font-medium text-sm">
                    {new Date(office.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm">Get in touch with this housing authority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {office.phone && (
                  <a 
                    href={`tel:${office.phone}`}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-all group border border-green-200"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600">Main Phone</div>
                      <div className="text-sm font-semibold text-green-700 group-hover:text-green-800">
                        {office.phone}
                      </div>
                    </div>
                  </a>
                )}
                
                {office.email && (
                  <a 
                    href={`mailto:${office.email}`}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all group border border-blue-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600">General Email</div>
                      <div className="text-xs font-semibold text-blue-700 group-hover:text-blue-800 break-all">
                        {office.email}
                      </div>
                    </div>
                  </a>
                )}

                {office.exec_dir_email && (
                  <a 
                    href={`mailto:${office.exec_dir_email}`}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all group border border-purple-200"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600">Executive Director</div>
                      <div className="text-xs font-semibold text-purple-700 group-hover:text-purple-800 break-all">
                        {office.exec_dir_email}
                      </div>
                    </div>
                  </a>
                )}
                
                {!office.phone && !office.email && !office.exec_dir_email && (
                  <div className="text-center py-6 text-gray-500">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No contact information available</p>
                    <p className="text-xs">Please visit the office directly</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="w-3 h-3" />
                  <span>Data from HUD PHA Contact Information</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHADetailView;
