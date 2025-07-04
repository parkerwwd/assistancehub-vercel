
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PHADetailHeaderProps {
  onBack: () => void;
}

const PHADetailHeader: React.FC<PHADetailHeaderProps> = ({ onBack }) => {
  return (
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
  );
};

export default PHADetailHeader;
