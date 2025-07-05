
import React from 'react';
import { Building, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HousingProgram {
  title: string;
  description: string;
  availability: string;
  status: string;
  participants: string;
  fundingLevel: string;
  agencyCount: number;
}

interface StateHousingProgramsProps {
  housingPrograms: HousingProgram[];
  stateName: string;
}

const StateHousingPrograms: React.FC<StateHousingProgramsProps> = ({ housingPrograms, stateName }) => {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          Available Housing Programs
        </CardTitle>
        <CardDescription>
          Explore different types of housing assistance programs in {stateName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {housingPrograms.map((program, index) => (
            <div key={index} className="group p-6 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-gray-600 mb-3">{program.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 ${
                  program.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : program.status === 'limited'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {program.availability}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{program.participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{program.fundingLevel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>{program.agencyCount} agencies</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="group-hover:bg-blue-50 transition-colors">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
        
        {housingPrograms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No housing programs found for {stateName}</p>
            <p className="text-sm">Please check back later or contact local housing authorities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StateHousingPrograms;
