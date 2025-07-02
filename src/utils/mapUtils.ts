
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
    // Map various program types to our two simplified categories
    const programType = agency.ha_program_type.toLowerCase();
    if (programType.includes('combined') || programType.includes('both')) {
      return "Combined PHA";
    } else {
      return "Section 8 PHA";
    }
  }
  
  // Fallback to existing logic using supports_hcv
  if (agency.supports_hcv) {
    return "Section 8 PHA";
  } else {
    // If they don't support HCV, they likely have public housing too, so Combined
    return "Combined PHA";
  }
};

export const getPHATypeColor = (phaType: string) => {
  switch (phaType) {
    case "Combined PHA": return "#8b5cf6";
    case "Section 8 PHA": return "#3b82f6";
    default: return "#6b7280";
  }
};
