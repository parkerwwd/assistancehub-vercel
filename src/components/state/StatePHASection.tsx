
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, ArrowRight } from "lucide-react";
import PHAOfficeCard from "@/components/PHAOfficeCard";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface StatePHASectionProps {
  stateName: string;
  phaAgencies: PHAAgency[];
  loading: boolean;
}

const StatePHASection: React.FC<StatePHASectionProps> = ({
  stateName,
  phaAgencies,
  loading
}) => {
  const navigate = useNavigate();

  const handleViewAllOffices = () => {
    navigate('/section8', { 
      state: { 
        searchLocation: { 
          name: stateName, 
          type: 'state' 
        } 
      } 
    });
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading PHA offices...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Section 8 Offices in {stateName}
          </h2>
          <p className="text-gray-600">
            {phaAgencies.length > 0 
              ? `Found ${phaAgencies.length} Public Housing Agencies in ${stateName}`
              : `No PHA offices found in ${stateName}`
            }
          </p>
        </div>
        
        {phaAgencies.length > 0 && (
          <Button 
            onClick={handleViewAllOffices}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            View All Offices
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {phaAgencies.length > 0 ? (
        <div className="grid gap-4">
          {phaAgencies.slice(0, 6).map((agency) => (
            <PHAOfficeCard
              key={agency.id}
              agency={agency}
            />
          ))}
          
          {phaAgencies.length > 6 && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {phaAgencies.length - 6} More Offices Available
                </h3>
                <p className="text-gray-600 mb-4">
                  View all Section 8 offices in {stateName} with detailed information and contact details.
                </p>
                <Button 
                  onClick={handleViewAllOffices}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  View All {phaAgencies.length} Offices
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center bg-gray-50">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No PHA Offices Found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any Public Housing Agencies in {stateName} in our current database.
          </p>
          <Button 
            onClick={handleViewAllOffices}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Search All Offices
          </Button>
        </Card>
      )}
    </div>
  );
};

export default StatePHASection;
