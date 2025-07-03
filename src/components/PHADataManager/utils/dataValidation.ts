// Data validation and sanitization utilities

// Enhanced coordinate parsing with validation
export const parseCoordinate = (value: string | null | undefined, type: 'latitude' | 'longitude'): number | null => {
  if (!value || value === 'null' || value === '') return null;
  
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  
  // Validate coordinate ranges
  if (type === 'latitude' && (parsed < -90 || parsed > 90)) {
    console.warn(`Invalid latitude value: ${parsed}`);
    return null;
  }
  
  if (type === 'longitude' && (parsed < -180 || parsed > 180)) {
    console.warn(`Invalid longitude value: ${parsed}`);
    return null;
  }
  
  // Round to 8 decimal places to match database precision
  return Math.round(parsed * 100000000) / 100000000;
};

// Enhanced input sanitization function
export const sanitizeInput = (input: string | null | undefined, maxLength: number = 255): string | null => {
  if (!input) return null;
  
  // Remove potentially dangerous characters and limit length
  const sanitized = input
    .replace(/[<>\"']/g, '') // Remove HTML/script injection characters
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .substring(0, maxLength);
  
  return sanitized || null;
};