
export const downloadMappingTemplate = () => {
  const csvContent = `Field Name,Description,Required
PHA Code,Unique identifier for the PHA,No
PHA Name,Official name of the housing authority,Yes
Address,Street address,No
Phone,Contact phone number,No
Email,Contact email address,No
Executive Director Email,Executive director email address,No
Program Type,Type of housing program,No`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pha_field_mapping_reference.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const getRequiredFieldStatus = (selectedFields: string[]) => {
  const requiredFields = ['name']; // Only name is required now
  const missingRequired = requiredFields.filter(field => !selectedFields.includes(field));
  
  return {
    missingRequired,
    hasRequired: missingRequired.length === 0
  };
};
