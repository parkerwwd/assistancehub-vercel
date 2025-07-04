
import React from 'react';
import { FileText } from "lucide-react";

export const HUDFormatInfo: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Automatic HUD CSV Field Mapping
      </h4>
      <div className="text-sm text-blue-700 space-y-3">
        <p className="font-medium">The system automatically maps these HUD CSV fields:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium mb-2">Basic Information:</h5>
            <ul className="space-y-1 text-xs">
              <li>• <strong>PARTICIPANT_CODE/PHA_CODE</strong> → PHA Code</li>
              <li>• <strong>FORMAL_PARTICIPANT_NAME/PHA_NAME</strong> → Name</li>
              <li>• <strong>STD_ADDR/ADDRESS</strong> → Street Address</li>
              <li>• <strong>STD_CITY/CITY</strong> → City</li>
              <li>• <strong>STD_ST/STATE</strong> → State</li>
              <li>• <strong>STD_ZIP5/ZIP</strong> → ZIP Code</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Contact Information:</h5>
            <ul className="space-y-1 text-xs">
              <li>• <strong>HA_PHN_NUM/PHONE</strong> → Phone</li>
              <li>• <strong>HA_FAX_NUM/FAX</strong> → Fax</li>
              <li>• <strong>HA_EMAIL_ADDR_TEXT/EMAIL</strong> → Email</li>
              <li>• <strong>WEBSITE/WEB_SITE</strong> → Website</li>
              <li>• <strong>EXEC_DIR_EMAIL</strong> → Executive Director Email</li>
              <li>• <strong>EXEC_DIR_PHN_NUM</strong> → Executive Director Phone</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Program Data:</h5>
            <ul className="space-y-1 text-xs">
              <li>• <strong>SECTION8_UNITS_CNT</strong> → Section 8 Units</li>
              <li>• <strong>SECTION8_OCCUPIED</strong> → Section 8 Occupied</li>
              <li>• <strong>PH_OCCUPIED</strong> → Public Housing Occupied</li>
              <li>• <strong>TOTAL_UNITS</strong> → Total Units</li>
              <li>• <strong>HA_PROGRAM_TYPE</strong> → Program Type</li>
              <li>• <strong>WAITLIST_STATUS</strong> → Waitlist Status</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Location & Status:</h5>
            <ul className="space-y-1 text-xs">
              <li>• <strong>LAT/LATITUDE</strong> → Latitude</li>
              <li>• <strong>LON/LONGITUDE</strong> → Longitude</li>
              <li>• <strong>PERFORMANCE_STATUS</strong> → HUD Rating</li>
              <li>• <strong>FISCAL_YEAR_END</strong> → Fiscal Year End</li>
              <li>• <strong>JURISDICTIONS</strong> → Service Areas</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="font-medium text-blue-800">✅ Direct Import Benefits:</p>
          <ul className="text-xs mt-1 space-y-1">
            <li>• No manual field mapping required</li>
            <li>• Supports multiple HUD CSV formats automatically</li>
            <li>• Handles both separated address fields (STD_ADDR, STD_CITY) and combined formats</li>
            <li>• Automatically detects Section 8 support from program type and unit counts</li>
            <li>• Maps all database fields including executive director contacts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
