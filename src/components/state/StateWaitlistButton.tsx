
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText } from 'lucide-react';

interface StateWaitlistButtonProps {
  stateName: string;
}

const StateWaitlistButton: React.FC<StateWaitlistButtonProps> = ({ stateName }) => {
  return (
    <Link to={`/state/${encodeURIComponent(stateName)}/waitlists`}>
      <div className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Animated icon */}
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 group-hover:rotate-6 transform">
              <Check className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                Open Section 8 Waiting Lists
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                View all available waitlists in {stateName}
              </p>
            </div>
          </div>
          
          {/* Animated arrow icon */}
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-blue-50 transition-all duration-300 group-hover:translate-x-1">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:translate-x-full transition-all duration-700 transform -translate-x-full"></div>
      </div>
    </Link>
  );
};

export default StateWaitlistButton;
