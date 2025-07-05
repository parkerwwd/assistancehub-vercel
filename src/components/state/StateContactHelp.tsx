
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StateContactHelp: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border-green-200">
      <CardHeader>
        <CardTitle className="text-xl text-green-800 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Need Assistance?
        </CardTitle>
        <CardDescription className="text-green-600">
          Get personalized help with your housing search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-green-700 p-3 bg-white/50 rounded-lg">
            <Phone className="w-4 h-4" />
            <div>
              <div className="font-medium">Housing Helpline</div>
              <div className="text-sm text-green-600">1-800-HOUSING</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-green-700 p-3 bg-white/50 rounded-lg">
            <Mail className="w-4 h-4" />
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-sm text-green-600">Available 24/7</div>
            </div>
          </div>
        </div>
        <Link to="/section8">
          <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg">
            <Users className="w-4 h-4 mr-2" />
            Connect with Housing Specialist
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default StateContactHelp;
