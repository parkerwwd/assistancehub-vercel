#!/usr/bin/env node

import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { createWriteStream } from 'fs';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.csv', '_deduped.csv');

if (!inputFile) {
  console.error('Usage: node remove-duplicates.js <input.csv> [output.csv]');
  process.exit(1);
}

console.log(`🔍 Removing duplicates from: ${inputFile}`);

const uniqueProperties = new Map();
let totalCount = 0;
let duplicateCount = 0;

// Create parser
const parser = fs.createReadStream(inputFile)
  .pipe(parse({
    columns: true,
    skip_empty_lines: true,
    trim: true
  }));

// Process each row
parser.on('data', (row) => {
  totalCount++;
  
  // Create a unique key from name and address
  const name = (row.name || '').trim().toLowerCase();
  const address = (row.address || '').trim().toLowerCase();
  const key = `${name}|${address}`;
  
  // Skip if no name or address
  if (!name || !address) {
    console.warn(`⚠️  Skipping row ${totalCount} - missing name or address`);
    return;
  }
  
  // Check if we've seen this property before
  if (uniqueProperties.has(key)) {
    duplicateCount++;
    const existing = uniqueProperties.get(key);
    console.log(`🔄 Duplicate found at row ${totalCount}:`);
    console.log(`   Name: ${row.name}`);
    console.log(`   Address: ${row.address}`);
    console.log(`   Keeping first occurrence from row ${existing.rowNumber}`);
  } else {
    // Store the property with its row number for reference
    uniqueProperties.set(key, {
      ...row,
      rowNumber: totalCount
    });
  }
  
  if (totalCount % 5000 === 0) {
    console.log(`✅ Processed ${totalCount} records...`);
  }
});

parser.on('end', () => {
  console.log(`\n📊 Summary:`);
  console.log(`   Total records: ${totalCount}`);
  console.log(`   Unique properties: ${uniqueProperties.size}`);
  console.log(`   Duplicates removed: ${duplicateCount}`);
  
  // Convert Map values to array and remove the rowNumber field
  const uniqueData = Array.from(uniqueProperties.values()).map(({ rowNumber, ...property }) => property);
  
  // Sort by state, city, name for better organization
  uniqueData.sort((a, b) => {
    const stateCompare = (a.state || '').localeCompare(b.state || '');
    if (stateCompare !== 0) return stateCompare;
    
    const cityCompare = (a.city || '').localeCompare(b.city || '');
    if (cityCompare !== 0) return cityCompare;
    
    return (a.name || '').localeCompare(b.name || '');
  });
  
  // Write deduplicated data
  const output = createWriteStream(outputFile);
  const stringifier = stringify({
    header: true,
    columns: [
      'hud_id', 'name', 'address', 'city', 'state', 'zip',
      'property_type', 'units_total', 'units_available', 'low_income_units',
      'units_studio', 'units_1br', 'units_2br', 'units_3br', 'units_4br',
      'rent_range_min', 'rent_range_max',
      'phone', 'website', 'latitude', 'longitude',
      'year_put_in_service'
    ]
  });

  stringifier.pipe(output);

  uniqueData.forEach(row => {
    stringifier.write(row);
  });

  stringifier.end();

  console.log(`\n✅ Deduplicated data saved to: ${outputFile}`);
  console.log(`\n💡 Next step: Upload ${outputFile} to your database`);
});

parser.on('error', (err) => {
  console.error('❌ Error processing CSV:', err);
  process.exit(1);
}); 