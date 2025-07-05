
// CSV parsing and validation utilities

export const parseCSV = (csvText: string) => {
  console.log('📋 Starting CSV parsing');
  
  // Security: Limit file size to prevent DoS attacks
  const maxFileSize = 50 * 1024 * 1024; // 50MB limit
  if (csvText.length > maxFileSize) {
    console.error('❌ File size exceeds limit:', csvText.length, 'bytes');
    throw new Error('File size too large. Maximum allowed size is 50MB.');
  }

  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.error('❌ No lines found in CSV');
    return [];
  }
  
  // Security: Limit number of records to prevent resource exhaustion
  const maxRecords = 100000; // 100k records limit
  if (lines.length > maxRecords) {
    console.error('❌ Too many records:', lines.length);
    throw new Error(`Too many records. Maximum allowed is ${maxRecords.toLocaleString()} records.`);
  }

  console.log('📊 CSV parsing stats:');
  console.log('  - Total lines:', lines.length);
  console.log('  - First line (headers):', lines[0]);
  
  // Try to detect delimiter (tab or comma)
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';
  
  console.log('🔍 Delimiter detection:');
  console.log('  - Tab count:', tabCount);
  console.log('  - Comma count:', commaCount);
  console.log('  - Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
  
  // Parse headers with sanitization
  const headers = firstLine.split(delimiter).map(h => {
    const sanitized = h.trim().replace(/"/g, '').replace(/[<>]/g, ''); // Basic XSS prevention
    return sanitized.substring(0, 100); // Limit header length
  });
  console.log('📑 Headers found:', headers);
  
  // Debug: Look for all field types
  console.log('🔍 FIELD ANALYSIS:');
  console.log('  - Address fields:', headers.filter(h => 
    h.toLowerCase().includes('addr') || 
    h.toLowerCase().includes('address') ||
    h.toLowerCase().includes('full')
  ));
  console.log('  - Phone fields:', headers.filter(h => 
    h.toLowerCase().includes('phone') || 
    h.toLowerCase().includes('phn')
  ));
  console.log('  - Email fields:', headers.filter(h => 
    h.toLowerCase().includes('email') || 
    h.toLowerCase().includes('e_mail') ||
    h.toLowerCase().includes('mail')
  ));
  
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
      
      // Debug: Log field values for first few records
      if (i <= 3) {
        console.log(`🔍 Record ${i} field analysis:`);
        console.log(`  - Available fields: ${Object.keys(row).length}`);
        headers.forEach(header => {
          const value = row[header];
          if (value && value.length > 0) {
            console.log(`  - ${header}: "${value}"`);
          }
        });
      }
      
      data.push(row);
    }
  }

  console.log('✅ CSV parsing completed:');
  console.log('  - Total data records:', data.length);
  console.log('  - Sample record keys:', data[0] ? Object.keys(data[0]) : 'No records');
  
  return data;
};

export const extractCSVHeaders = (csvText: string): string[] => {
  console.log('📑 Extracting CSV headers');
  const firstLine = csvText.split('\n')[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
  console.log('✅ Extracted headers:', headers);
  return headers;
};

export const validateCSVFile = (file: File): void => {
  console.log('🔒 Validating CSV file security');
  console.log('  - File name:', file.name);
  console.log('  - File type:', file.type);
  console.log('  - File size:', file.size, 'bytes');
  
  // Security: Validate file type and size
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
    console.error('❌ Invalid file type:', file.type);
    throw new Error('Invalid file type. Only CSV files are allowed.');
  }

  const maxFileSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxFileSize) {
    console.error('❌ File too large:', file.size, 'bytes');
    throw new Error('File too large. Maximum size is 50MB.');
  }
  
  console.log('✅ File validation passed');
};
