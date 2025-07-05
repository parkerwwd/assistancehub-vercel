
import React from 'react';
import { Shield, Clock, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const keyFeatures = [
  { icon: Shield, title: 'Verified Listings', description: 'All properties are verified and up-to-date' },
  { icon: Clock, title: 'Real-time Updates', description: 'Wait times and availability updated monthly' },
  { icon: TrendingUp, title: 'Market Insights', description: 'Local housing market trends and analysis' },
  { icon: Users, title: 'Expert Support', description: '24/7 assistance from housing specialists' }
];

const StateKeyFeatures: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {keyFeatures.map((feature, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StateKeyFeatures;
