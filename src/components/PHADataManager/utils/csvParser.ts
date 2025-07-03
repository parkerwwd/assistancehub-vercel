// CSV parsing and validation utilities

export const parseCSV = (csvText: string) => {
  // Security: Limit file size to prevent DoS attacks
  const maxFileSize = 50 * 1024 * 1024; // 50MB limit
  if (csvText.length > maxFileSize) {
    throw new Error('File size too large. Maximum allowed size is 50MB.');
  }

  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Security: Limit number of records to prevent resource exhaustion
  const maxRecords = 100000; // 100k records limit
  if (lines.length > maxRecords) {
    throw new Error(`Too many records. Maximum allowed is ${maxRecords.toLocaleString()} records.`);
  }

  console.log('Total lines in CSV:', lines.length);
  console.log('First line (headers):', lines[0]);
  
  // Try to detect delimiter (tab or comma)
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';
  
  console.log('Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
  
  // Parse headers with sanitization
  const headers = firstLine.split(delimiter).map(h => {
    const sanitized = h.trim().replace(/"/g, '').replace(/[<>]/g, ''); // Basic XSS prevention
    return sanitized.substring(0, 100); // Limit header length
  });
  console.log('Headers found:', headers);
  
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(delimiter).map(v => {
        const sanitized = v.trim().replace(/"/g, '').replace(/[<>]/g, ''); // Basic XSS prevention
        return sanitized.substring(0, 500); // Limit field length
      });
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      data.push(row);
    }
  }

  console.log('Parsed data sample:', data.slice(0, 2));
  return data;
};

export const extractCSVHeaders = (csvText: string): string[] => {
  const firstLine = csvText.split('\n')[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';
  return firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
};

export const validateCSVFile = (file: File): void => {
  // Security: Validate file type and size
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Invalid file type. Only CSV files are allowed.');
  }

  const maxFileSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxFileSize) {
    throw new Error('File too large. Maximum size is 50MB.');
  }
};