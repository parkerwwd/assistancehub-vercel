
import { DATABASE_FIELDS } from './constants';

export const downloadMappingTemplate = () => {
  const template = DATABASE_FIELDS.map(field => 
    `${field.key},${field.label},"${field.description}"`
  ).join('\n');
  
  const blob = new Blob([`Database Field,Label,Description\n${template}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pha_field_mapping_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getRequiredFieldStatus = (usedDbFields: string[]) => {
  const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.key);
  const missingRequired = requiredFields.filter(field => !usedDbFields.includes(field));
  return { missingRequired, hasRequired: missingRequired.length === 0 };
};
