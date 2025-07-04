
// Helper functions for PHADetailView components
export const hasValue = (value: any) => {
  return value !== null && value !== undefined && value !== '' && value !== 0;
};

export const formatNumber = (value: number | null) => {
  if (!hasValue(value)) return null;
  return value!.toLocaleString();
};

export const formatCurrency = (value: number | null) => {
  if (!hasValue(value)) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value!);
};

export const formatPercentage = (value: number | null) => {
  if (!hasValue(value)) return null;
  return `${value!.toFixed(2)}%`;
};

export const isValidPhone = (phone: string | null) => {
  if (!phone) return false;
  return /^[\d\s\-\(\)\+\.x]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

export const isValidEmail = (email: string | null) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidFax = (fax: string | null) => {
  if (!fax) return false;
  return /^[\d\s\-\(\)\+\.x]+$/.test(fax) && fax.replace(/\D/g, '').length >= 7;
};
