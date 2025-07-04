
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, FileText } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { isValidPhone, isValidEmail, isValidFax } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAContactInfoProps {
  office: PHAAgency;
}

const PHAContactInfo: React.FC<PHAContactInfoProps> = ({ office }) => {
  const hasContactData = isValidPhone(office.phone) || 
                        isValidEmail(office.email) || 
                        isValidFax(office.fax) ||
                        isValidPhone(office.exec_dir_phone) ||
                        isValidEmail(office.exec_dir_email) ||
                        isValidFax(office.exec_dir_fax);

  if (!hasContactData) return null;

  console.log('Contact data analysis:', {
    phone: { value: office.phone, isValid: isValidPhone(office.phone) },
    email: { value: office.email, isValid: isValidEmail(office.email) },
    fax: { value: office.fax, isValid: isValidFax(office.fax) },
    exec_dir_phone: { value: office.exec_dir_phone, isValid: isValidPhone(office.exec_dir_phone) },
    exec_dir_email: { value: office.exec_dir_email, isValid: isValidEmail(office.exec_dir_email) },
    exec_dir_fax: { value: office.exec_dir_fax, isValid: isValidFax(office.exec_dir_fax) },
    hasContactData
  });

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main PHA Contact */}
        {isValidPhone(office.phone) && (
          <a 
            href={`tel:${office.phone}`}
            className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
          >
            <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                {office.phone}
              </span>
              <span className="text-xs text-blue-600">Main Phone</span>
            </div>
          </a>
        )}
        
        {isValidEmail(office.email) && (
          <a 
            href={`mailto:${office.email}`}
            className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group border border-purple-100"
          >
            <Mail className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-purple-700 group-hover:text-purple-800 font-medium text-sm">
                {office.email}
              </span>
              <span className="text-xs text-purple-600">Main Email</span>
            </div>
          </a>
        )}

        {isValidFax(office.fax) && (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <FileText className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-gray-700 font-medium text-sm">
                {office.fax}
              </span>
              <span className="text-xs text-gray-600">Main Fax</span>
            </div>
          </div>
        )}

        {/* Executive Director Contact */}
        {(isValidPhone(office.exec_dir_phone) || isValidEmail(office.exec_dir_email) || isValidFax(office.exec_dir_fax)) && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Executive Director</h4>
            <div className="space-y-2">
              {isValidPhone(office.exec_dir_phone) && (
                <a 
                  href={`tel:${office.exec_dir_phone}`}
                  className="flex items-center p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors group"
                >
                  <Phone className="w-3 h-3 mr-2 text-blue-500" />
                  <span className="text-sm text-blue-700 group-hover:text-blue-800">{office.exec_dir_phone}</span>
                </a>
              )}
              {isValidEmail(office.exec_dir_email) && (
                <a 
                  href={`mailto:${office.exec_dir_email}`}
                  className="flex items-center p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors group"
                >
                  <Mail className="w-3 h-3 mr-2 text-purple-500" />
                  <span className="text-sm text-purple-700 group-hover:text-purple-800">{office.exec_dir_email}</span>
                </a>
              )}
              {isValidFax(office.exec_dir_fax) && (
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
  );
};

export default PHAContactInfo;
