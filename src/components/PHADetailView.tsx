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

// Helper function to detect if a string looks like a phone number
const isPhoneNumber = (str: string): boolean => {
  if (!str) return false;
  const phonePattern = /^[\d\s\-\(\)\+\.]{7,}$/;
  return phonePattern.test(str) && str.replace(/\D/g, '').length >= 7;
};

// Helper function to detect if a string looks like an email
const isEmail = (str: string): boolean => {
  if (!str) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(str);
};

// Helper function to detect if a string looks like a ZIP code
const isZipCode = (str: string): boolean => {
  if (!str) return false;
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(str);
};

// Helper function to detect if a string is a state abbreviation
const isStateAbbreviation = (str: string): boolean => {
  if (!str) return false;
  const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  return states.includes(str.toUpperCase());
};

// Function to extract correct contact information from mixed-up data
const extractContactInfo = (office: PHAAgency) => {
  const allFields = [
    office.phone,
    office.email,
    office.fax,
    office.city,
    office.state,
    office.zip,
    office.exec_dir_phone,
    office.exec_dir_email,
    office.exec_dir_fax,
    office.performance_status
  ].filter(Boolean);

  console.log('Analyzing all fields for contact extraction:', allFields);

  let phone = null;
  let email = null;
  let fax = null;
  let city = null;
  let state = null;
  let zip = null;
  let execDirPhone = null;
  let execDirEmail = null;
  let execDirFax = null;

  // First, try to use exec_dir fields directly if they contain valid data
  if (office.exec_dir_phone && isPhoneNumber(office.exec_dir_phone)) {
    execDirPhone = office.exec_dir_phone;
  }
  
  if (office.exec_dir_email && isEmail(office.exec_dir_email)) {
    execDirEmail = office.exec_dir_email;
  }
  
  if (office.exec_dir_fax && isPhoneNumber(office.exec_dir_fax)) {
    execDirFax = office.exec_dir_fax;
  }

  // Now go through all fields and categorize them correctly
  allFields.forEach(field => {
    if (!field) return;
    
    if (isEmail(field)) {
      if (!email) {
        email = field;
      } else if (!execDirEmail) {
        execDirEmail = field;
      }
    } else if (isPhoneNumber(field)) {
      if (field === office.exec_dir_phone || field === office.exec_dir_fax) {
        return;
      }
      
      if (!phone) {
        phone = field;
      } else if (!fax) {
        fax = field;
      } else if (!execDirPhone) {
        execDirPhone = field;
      } else if (!execDirFax) {
        execDirFax = field;
      }
    } else if (isZipCode(field)) {
      if (!zip) {
        zip = field;
      }
    } else if (isStateAbbreviation(field)) {
      if (!state) {
        state = field;
      }
    } else {
      if (!city && field.length > 1 && !field.match(/^\d+$/)) {
        city = field;
      }
    }
  });

  if (!execDirPhone && office.performance_status && isPhoneNumber(office.performance_status)) {
    execDirPhone = office.performance_status;
  }

  console.log('Extracted contact info:', {
    phone,
    email,
    fax,
    city,
    state,
    zip,
    execDirPhone,
    execDirEmail,
    execDirFax
  });

  return {
    phone,
    email,
    fax,
    city,
    state,
    zip,
    execDirPhone,
    execDirEmail,
    execDirFax
  };
};

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  console.log('PHADetailView received office data:', office);

  const contactInfo = extractContactInfo(office);
  
  const addressParts = [office.address];
  
  if (contactInfo.city) {
    addressParts.push(contactInfo.city);
  }
  
  if (contactInfo.state) {
    addressParts.push(contactInfo.state);
  }
  
  if (contactInfo.zip) {
    addressParts.push(contactInfo.zip);
  }
  
  const fullAddress = addressParts.filter(Boolean).join(', ');

  const phaType = getPHATypeFromData(office);

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
        <Card className="shadow-lg border border-gray-200 mb-4">
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
              <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
                <Image className="w-4 h-4" />
                {showFallback ? 'Map View' : 'Street View'}
              </div>
            </div>
          )}

          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900 leading-tight pr-2 font-bold">
              {office.name || 'No name available'}
            </CardTitle>
            {fullAddress && (
              <CardDescription className="flex items-start text-base text-gray-600 mt-3">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="leading-relaxed font-medium">{fullAddress}</span>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PHA Information - Enhanced */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                PHA Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">PHA Type</span>
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-semibold border-2"
                    style={{ 
                      backgroundColor: getPHATypeColor(phaType) + '20',
                      borderColor: getPHATypeColor(phaType),
                      color: getPHATypeColor(phaType)
                    }}
                  >
                    {phaType}
                  </span>
                </div>

                {office.pha_code && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PHA Code
                    </span>
                    <span className="text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-full">{office.pha_code}</span>
                  </div>
                )}

                {office.program_type && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Program Type</span>
                    <span className="text-sm text-gray-900 font-semibold">{office.program_type}</span>
                  </div>
                )}

                {office.performance_status && !isPhoneNumber(office.performance_status) && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Performance Status
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {office.performance_status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Contact Information - Enhanced */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Main Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {contactInfo.phone && (
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center p-4 bg-white rounded-lg hover:bg-green-50 transition-all duration-200 group border border-green-100 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-blue-700 group-hover:text-blue-800 font-semibold text-lg block">
                        {contactInfo.phone}
                      </span>
                      <span className="text-sm text-blue-600">Main Phone Number</span>
                    </div>
                  </a>
                )}

                {contactInfo.fax && (
                  <div className="flex items-center p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700 font-semibold text-lg block">{contactInfo.fax}</span>
                      <span className="text-sm text-gray-600">Main Fax Number</span>
                    </div>
                  </div>
                )}

                {contactInfo.email && (
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center p-4 bg-white rounded-lg hover:bg-purple-50 transition-all duration-200 group border border-green-100 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-purple-700 group-hover:text-purple-800 font-semibold text-base block break-all">
                        {contactInfo.email}
                      </span>
                      <span className="text-sm text-purple-600">Main Email Address</span>
                    </div>
                  </a>
                )}
                
                {office.website && (
                  <a 
                    href={office.website.startsWith('http') ? office.website : `https://${office.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-lg hover:bg-green-50 transition-all duration-200 group border border-green-100 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <ExternalLink className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-green-700 group-hover:text-green-800 font-semibold">
                        Visit Official Website
                      </span>
                      <span className="text-sm text-green-600 block break-all">{office.website}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Executive Director Information - Enhanced */}
            {(contactInfo.execDirPhone || contactInfo.execDirFax || contactInfo.execDirEmail) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Executive Director Contact
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {contactInfo.execDirPhone && (
                    <a 
                      href={`tel:${contactInfo.execDirPhone}`}
                      className="flex items-center p-4 bg-white rounded-lg hover:bg-purple-50 transition-all duration-200 group border border-purple-100 shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-blue-700 group-hover:text-blue-800 font-semibold text-lg block">
                          {contactInfo.execDirPhone}
                        </span>
                        <span className="text-sm text-blue-600">Executive Director Phone</span>
                      </div>
                    </a>
                  )}

                  {contactInfo.execDirFax && (
                    <div className="flex items-center p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-700 font-semibold text-lg block">{contactInfo.execDirFax}</span>
                        <span className="text-sm text-gray-600">Executive Director Fax</span>
                      </div>
                    </div>
                  )}

                  {contactInfo.execDirEmail && (
                    <a 
                      href={`mailto:${contactInfo.execDirEmail}`}
                      className="flex items-center p-4 bg-white rounded-lg hover:bg-purple-50 transition-all duration-200 group border border-purple-100 shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-purple-700 group-hover:text-purple-800 font-semibold text-base block break-all">
                          {contactInfo.execDirEmail}
                        </span>
                        <span className="text-sm text-purple-600">Executive Director Email</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Waitlist Status - Enhanced */}
            {office.waitlist_status && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Waitlist Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Waitlist Status</span>
                    <span 
                      className="px-4 py-2 rounded-full text-sm font-semibold border-2"
                      style={{ 
                        backgroundColor: getWaitlistColor(office.waitlist_status) + '20',
                        borderColor: getWaitlistColor(office.waitlist_status),
                        color: getWaitlistColor(office.waitlist_status)
                      }}
                    >
                      {office.waitlist_status}
                    </span>
                  </div>

                  {office.waitlist_open !== null && (
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Currently</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                        office.waitlist_open 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'bg-red-100 border-red-500 text-red-700'
                      }`}>
                        {office.waitlist_open ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Housing Units & Statistics - Enhanced */}
            {(office.total_units || office.total_dwelling_units || office.ph_occupied || office.section8_units_count || office.section8_occupied) && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-cyan-600" />
                  Housing Units & Occupancy Statistics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {office.total_units && (
                    <div className="p-4 bg-white rounded-lg border border-cyan-100 text-center shadow-sm">
                      <div className="text-3xl font-bold text-blue-700 mb-1">{office.total_units.toLocaleString()}</div>
                      <div className="text-sm text-blue-600 font-medium">Total Units</div>
                    </div>
                  )}

                  {office.total_dwelling_units && office.total_dwelling_units !== office.total_units && (
                    <div className="p-4 bg-white rounded-lg border border-cyan-100 text-center shadow-sm">
                      <div className="text-3xl font-bold text-green-700 mb-1">{office.total_dwelling_units.toLocaleString()}</div>
                      <div className="text-sm text-green-600 font-medium">Total Dwelling Units</div>
                    </div>
                  )}

                  {office.ph_occupied && (
                    <div className="p-4 bg-white rounded-lg border border-cyan-100 text-center shadow-sm">
                      <div className="text-3xl font-bold text-purple-700 mb-1">{office.ph_occupied.toLocaleString()}</div>
                      <div className="text-sm text-purple-600 font-medium">Public Housing Occupied</div>
                    </div>
                  )}

                  {office.section8_units_count && (
                    <div className="p-4 bg-white rounded-lg border border-cyan-100 text-center shadow-sm">
                      <div className="text-3xl font-bold text-orange-700 mb-1">{office.section8_units_count.toLocaleString()}</div>
                      <div className="text-sm text-orange-600 font-medium">Section 8 Units Available</div>
                    </div>
                  )}

                  {office.section8_occupied && (
                    <div className="p-4 bg-white rounded-lg border border-cyan-100 text-center shadow-sm">
                      <div className="text-3xl font-bold text-red-700 mb-1">{office.section8_occupied.toLocaleString()}</div>
                      <div className="text-sm text-red-600 font-medium">Section 8 Units Occupied</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Program Information - Enhanced */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Program Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {office.combined_size_category && (
                  <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-semibold text-gray-700">Combined Size Category</span>
                    </div>
                    <p className="text-base text-gray-900 font-bold">{office.combined_size_category}</p>
                  </div>
                )}

                {office.low_rent_size_category && !isPhoneNumber(office.low_rent_size_category) && (
                  <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-gray-700">Low Rent Size Category</span>
                    </div>
                    <p className="text-base text-gray-900 font-bold">{office.low_rent_size_category}</p>
                  </div>
                )}

                {office.section8_size_category && (
                  <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-semibold text-gray-700">Section 8 Size Category</span>
                    </div>
                    <p className="text-base text-gray-900 font-bold">{office.section8_size_category}</p>
                  </div>
                )}

                {office.fiscal_year_end && office.fiscal_year_end !== '0' && (
                  <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Fiscal Year End</span>
                    </div>
                    <p className="text-base text-gray-900 font-bold">{office.fiscal_year_end}</p>
                  </div>
                )}

                <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-700">Housing Choice Voucher (HCV) Support</span>
                  </div>
                  <p className={`text-base font-bold ${office.supports_hcv ? 'text-green-700' : 'text-red-700'}`}>
                    {office.supports_hcv ? 'Supported ✓' : 'Not Supported ✗'}
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Typical Office Hours</h3>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm">
                <div className="text-base text-gray-700 space-y-2">
                  <p className="font-semibold">Monday - Friday: 8:00 AM - 4:30 PM</p>
                  <p className="font-semibold">Saturday - Sunday: Closed</p>
                  <p className="text-sm text-gray-500 mt-3 italic">*Hours may vary. Please call to confirm current hours.</p>
                </div>
              </div>
            </div>

            {/* View Housing Button */}
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              View Available Housing in Area
            </Button>

            {/* Available Housing Programs */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 text-base">Available Housing Programs</h4>
              <div className="space-y-3 text-base">
                {office.supports_hcv && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="font-medium">Section 8 Housing Choice Vouchers</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Public Housing Units</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Emergency Housing Assistance</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Senior Housing Programs</span>
                </div>
              </div>
            </div>

            {/* Service Areas & Jurisdictions */}
            {office.jurisdictions && office.jurisdictions.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 text-base">Service Areas & Jurisdictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {office.jurisdictions.map((jurisdiction, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 font-medium text-center"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source Footer */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <strong>Data Source:</strong> HUD PHA Contact Information API
                {office.last_updated && (
                  <span className="block mt-2">
                    <strong>Last Updated:</strong> {new Date(office.last_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
