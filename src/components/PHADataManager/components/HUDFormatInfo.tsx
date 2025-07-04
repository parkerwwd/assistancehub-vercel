
import React from 'react';
import { FileText } from "lucide-react";

export const HUDFormatInfo: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        HUD CSV Format Mapping (Updated)
      </h4>
      <div className="text-sm text-blue-700 space-y-2">
        <div>
          <strong>🏢 Core Information:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• <strong>PARTICIPANT_CODE</strong> → PHA Code</li>
            <li>• <strong>FORMAL_PARTICIPANT_NAME</strong> → PHA Name</li>
          </ul>
        </div>
        
        <div>
          <strong>📍 Address Components:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• <strong>STD_ADDR</strong> → Street Address</li>
            <li>• <strong>STD_CITY</strong> → City</li>
            <li>• <strong>STD_ST</strong> → State</li>
            <li>• <strong>STD_ZIP5</strong> → ZIP Code</li>
            <li>• <strong>LAT, LON</strong> → Coordinates</li>
          </ul>
        </div>
        
        <div>
          <strong>📞 Contact Information:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• <strong>HA_PHN_NUM</strong> → Phone</li>
            <li>• <strong>HA_EMAIL_ADDR_TEXT, EXEC_DIR_EMAIL</strong> → Email</li>
            <li>• <strong>HA_FAX_NUM</strong> → Fax</li>
          </ul>
        </div>
        
        <div>
          <strong>🏘️ Program Information:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• <strong>HA_PROGRAM_TYPE</strong> → Program Type</li>
            <li>• <strong>SECTION8_UNITS_CNT</strong> → Section 8 Units</li>
            <li>• <strong>PHAS_DESIGNATION</strong> → Performance Status</li>
          </ul>
        </div>
        
        <p className="text-xs mt-3 text-blue-600">
          <strong>✅ Updated:</strong> Now supports both separate address components (STD_ADDR, STD_CITY, etc.) 
          and combined FULL_ADDRESS format. Enhanced Section 8 detection using both program type and unit count.
        </p>
      </div>
    </div>
  );
};
