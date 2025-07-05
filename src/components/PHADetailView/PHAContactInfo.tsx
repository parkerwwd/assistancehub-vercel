
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAContactInfoProps {
  office: PHAAgency;
}

const PHAContactInfo: React.FC<PHAContactInfoProps> = ({ office }) => {
  return (
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
  );
};

export default PHAContactInfo;
