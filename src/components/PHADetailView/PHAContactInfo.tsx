
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Users } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAContactInfoProps {
  office: PHAAgency;
}

const PHAContactInfo: React.FC<PHAContactInfoProps> = ({ office }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Users className="w-5 h-5 text-green-600" />
          Contact Information
        </CardTitle>
        <CardDescription className="text-sm">Get in touch with this housing authority</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {office.phone && (
          <a 
            href={`tel:${office.phone}`}
            className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl hover:from-blue-100 hover:to-blue-150/50 transition-all duration-300 group border border-blue-200/50 hover:border-blue-300/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">Main Phone</div>
                <div className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                  {office.phone}
                </div>
              </div>
            </div>
          </a>
        )}
        
        {office.email && (
          <a 
            href={`mailto:${office.email}`}
            className="block p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl hover:from-green-100 hover:to-green-150/50 transition-all duration-300 group border border-green-200/50 hover:border-green-300/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 mb-1">General Email</div>
                <div className="text-sm font-semibold text-green-700 group-hover:text-green-800 break-all">
                  {office.email}
                </div>
              </div>
            </div>
          </a>
        )}

        {office.exec_dir_email && (
          <a 
            href={`mailto:${office.exec_dir_email}`}
            className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:from-purple-100 hover:to-purple-150/50 transition-all duration-300 group border border-purple-200/50 hover:border-purple-300/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 mb-1">Executive Director</div>
                <div className="text-sm font-semibold text-purple-700 group-hover:text-purple-800 break-all">
                  {office.exec_dir_email}
                </div>
              </div>
            </div>
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default PHAContactInfo;
