#!/usr/bin/env node

import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { createWriteStream } from 'fs';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.csv', '_cleaned.csv');

if (!inputFile) {
  console.error('Usage: node clean-lihtc-data.js <input.csv> [output.csv]');
  process.exit(1);
}

console.log(`🧹 Cleaning LIHTC data from: ${inputFile}`);
console.log(`📝 Output will be saved to: ${outputFile}`);

const cleanedData = [];
let recordCount = 0;
let fixedCount = 0;

// Create parser
const parser = fs.createReadStream(inputFile)
  .pipe(parse({
    columns: true,
    skip_empty_lines: true,
    trim: true
  }));

// Process each row
parser.on('data', (row) => {
  recordCount++;
  let changesMade = false;

  // Clean years - convert 9999 to null
  ['yr_pis', 'yr_alloc'].forEach(field => {
    if (row[field] === '9999' || row[field] === 9999) {
      row[field] = '';
      changesMade = true;
    }
  });

  // Fix common typos
  if (row.proj_cty === 'ANCORAGE') {
    row.proj_cty = 'ANCHORAGE';
    changesMade = true;
  }

  // Clean placeholder values
  Object.keys(row).forEach(key => {
    if (row[key] && row[key].toString().includes('XXXXXXXXX')) {
      row[key] = '';
      changesMade = true;
    }
  });

  // Validate coordinates
  const lat = parseFloat(row.latitude);
  const lng = parseFloat(row.longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.warn(`⚠️  Invalid coordinates for ${row.project}: lat=${lat}, lng=${lng}`);
    row.latitude = '';
    row.longitude = '';
    changesMade = true;
  }

  // Map bedroom columns to expected format
  row.units_studio = row.n_0br || '0';
  row.units_1br = row.n_1br || '0';
  row.units_2br = row.n_2br || '0';
  row.units_3br = row.n_3br || '0';
  row.units_4br = row.n_4br || '0';

  // Add missing fields with defaults
  row.rent_range_min = '';  // No rent data in LIHTC
  row.rent_range_max = '';
  row.property_type = 'tax_credit';  // All LIHTC properties
  row.units_available = '';

  // Use better name/address fields
  row.name = row.project || '';
  row.address = row.proj_add || '';
  row.city = row.proj_cty || '';
  row.state = row.proj_st || '';
  row.zip = row.proj_zip || '';
  row.phone = row.phone || '';
  row.website = row.website || '';
  row.units_total = row.n_units || '';
  row.low_income_units = row.li_units || '';
  row.year_put_in_service = row.yr_pis || '';

  if (changesMade) fixedCount++;
  cleanedData.push(row);

  if (recordCount % 1000 === 0) {
    console.log(`✅ Processed ${recordCount} records...`);
  }
});

parser.on('end', () => {
  console.log(`\n📊 Summary:`);
  console.log(`   Total records: ${recordCount}`);
  console.log(`   Records fixed: ${fixedCount}`);
  
  // Write cleaned data
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

  cleanedData.forEach(row => {
    stringifier.write(row);
  });

  stringifier.end();

  console.log(`\n✅ Cleaned data saved to: ${outputFile}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the cleaned file`);
  console.log(`   2. Upload to your database`);
});

parser.on('error', (err) => {
  console.error('❌ Error processing CSV:', err);
  process.exit(1);
}); 