
import React from 'react';
import { FileText } from "lucide-react";

export const HUDFormatInfo: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        HUD CSV Format Mapping
      </h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• <strong>PARTICIPANT_CODE</strong> → PHA Code</li>
        <li>• <strong>FORMAL_PARTICIPANT_NAME</strong> → PHA Name</li>
        <li>• <strong>STD_ADDR, STD_CITY, STD_ST, STD_ZIP5</strong> → Address</li>
        <li>• <strong>HA_PHN_NUM</strong> → Phone Number</li>
        <li>• <strong>HA_EMAIL_ADDR_TEXT, EXEC_DIR_EMAIL</strong> → Email</li>
        <li>• <strong>LAT, LON</strong> → Coordinates for mapping</li>
        <li>• <strong>HA_PROGRAM_TYPE, SECTION8_UNITS_CNT</strong> → Section 8 support</li>
        <li>• Tab-separated or comma-separated formats supported</li>
      </ul>
    </div>
  );
};
