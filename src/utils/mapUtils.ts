
export const getWaitlistColor = (status: string) => {
  switch (status) {
    case "Open": return "#10b981";
    case "Limited Opening": return "#f59e0b";
    case "Closed": return "#ef4444";
    default: return "#6b7280";
  }
};

export const getPHATypeFromData = (agency: any) => {
  // First check if we have HA_PROGRAM_TYPE field
  if (agency.ha_program_type) {
    return agency.ha_program_type;
  }
  
  // Fallback to existing logic using supports_hcv
  if (agency.supports_hcv) {
    return "Section 8 PHA";
  } else {
    return "Public Housing PHA";
  }
};

export const getPHATypeColor = (phaType: string) => {
  switch (phaType) {
    case "Combined PHA": return "#8b5cf6";
    case "Section 8 PHA": return "#3b82f6";
    case "Public Housing PHA": return "#10b981";
    case "Section 8 Only": return "#0ea5e9";
    case "Public Housing Only": return "#059669";
    default: return "#6b7280";
  }
};
