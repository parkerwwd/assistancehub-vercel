
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
  
  // Enhanced CSV parsing to handle quoted fields properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator found outside quotes
        result.push(current.trim());
        current = '';
      } else if (char === '\t' && !inQuotes) {
        // Tab separator found outside quotes
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  // Try to detect delimiter more accurately
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  // Count commas outside of quotes for better detection
  let commasOutsideQuotes = 0;
  let inQuotes = false;
  for (let i = 0; i < firstLine.length; i++) {
    if (firstLine[i] === '"') {
      inQuotes = !inQuotes;
    } else if (firstLine[i] === ',' && !inQuotes) {
      commasOutsideQuotes++;
    }
  }
  
  const delimiter = tabCount > commasOutsideQuotes ? '\t' : ',';
  
  console.log('🔍 Delimiter detection:');
  console.log('  - Tab count:', tabCount);
  console.log('  - Comma count (total):', commaCount);
  console.log('  - Comma count (outside quotes):', commasOutsideQuotes);
  console.log('  - Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
  
  // Parse headers with proper CSV parsing
  const headers = parseCSVLine(firstLine).map(h => {
    const sanitized = h.replace(/^"|"$/g, '').replace(/[<>]/g, ''); // Remove surrounding quotes and XSS chars
    return sanitized.substring(0, 100); // Limit header length
  });
  console.log('📑 Headers found:', headers);
  console.log('📑 Header count:', headers.length);
  
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]).map(v => {
        // Remove surrounding quotes and sanitize
        const cleaned = v.replace(/^"|"$/g, '').replace(/[<>]/g, '');
        return cleaned.substring(0, 500) || null; // Limit field length, convert empty to null
      });
      
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Convert "nan", "null", empty strings to null
        if (!value || value.toLowerCase() === 'nan' || value.toLowerCase() === 'null' || value.trim() === '') {
          row[header] = null;
        } else {
          row[header] = value;
        }
      });
      
      // Debug: Log field values for first few records
      if (i <= 3) {
        console.log(`🔍 Record ${i} field analysis:`);
        console.log(`  - Available fields: ${Object.keys(row).length}`);
        console.log(`  - Values parsed: ${values.length}`);
        console.log(`  - Headers expected: ${headers.length}`);
        
        // Log key fields we care about
        const keyFields = ['PARTICIPANT_CODE', 'FORMAL_PARTICIPANT_NAME', 'FULL_ADDRESS', 'HA_PHN_NUM', 'HA_EMAIL_ADDR_TEXT', 'EXEC_DIR_EMAIL'];
        keyFields.forEach(field => {
          if (row[field] !== undefined) {
            console.log(`  - ${field}: "${row[field]}"`);
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
  
  // Use the same parsing logic as parseCSV
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else if (char === '\t' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(firstLine).map(h => h.replace(/^"|"$/g, '').trim());
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
