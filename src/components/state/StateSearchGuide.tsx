
import React from 'react';
import { Search, MousePointer, Accessibility, Users, UserCheck, Home, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StateSearchGuideProps {
  stateName: string;
}

const StateSearchGuide: React.FC<StateSearchGuideProps> = ({ stateName }) => {


  const housingTypes = [
    {
      icon: Accessibility,
      title: 'Accessible Housing',
      description: 'Housing for disabled people or those with special needs',
      color: 'bg-yellow-400'
    },
    {
      icon: Users,
      title: 'Housing for Families',
      description: 'Family-friendly housing options with multiple bedrooms',
      color: 'bg-yellow-400'
    },
    {
      icon: UserCheck,
      title: 'Housing for Senior Citizens',
      description: 'Age-restricted housing for seniors 55+ or 62+',
      color: 'bg-yellow-400'
    },
    {
      icon: Home,
      title: 'Housing for Homeless Individuals',
      description: 'Emergency and transitional housing assistance',
      color: 'bg-yellow-400'
    },
    {
      icon: HelpCircle,
      title: 'Other Groups',
      description: 'Specialized housing for various demographics',
      color: 'bg-yellow-400'
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-600" />
              How to Search
            </CardTitle>
            <CardDescription>
              Learn how to navigate and find housing opportunities in {stateName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Expand Listing Details Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Expand Listing Details</h3>
          <p className="text-gray-600 mb-6">
            Select any listing to view more details including contact info for the property management or authority.
          </p>
          
          <div className="relative p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 bg-gray-200 rounded-lg "></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded "></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 "></div>
              </div>
              <MousePointer className="w-8 h-8 text-gray-700 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Listing Legend Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Listing Legend</h3>
          <p className="text-gray-600 mb-6">
            The following icons represent the type of housing offered based on specific demographics:
          </p>
          
          <div className="space-y-4">
            {housingTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all duration-200">
                <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center shadow-md`}>
                  <type.icon className="w-6 h-6 text-gray-800" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-blue-900">Pro Tip</h4>
          </div>
          <p className="text-blue-800 text-sm">
            Hover over any icon in the listings to see additional information about specific housing programs and eligibility requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateSearchGuide;
