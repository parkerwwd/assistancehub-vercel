#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
config()

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // Use service key for full access

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   SUPABASE_URL - Your Supabase project URL')
  console.error('   SUPABASE_SERVICE_KEY - Your Supabase service role key')
  console.error('\nGet these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  process.exit(1)
}

// Initialize Supabase client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Field mapping configuration
const FIELD_MAPPINGS = {
  // Common PHA data field mappings
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name', 
  'PHA_NAME': 'name',
  'NAME': 'name',
  'AGENCY_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  'CITY': 'city',
  'STATE': 'state',
  'ZIP': 'zip',
  'ZIP_CODE': 'zip',
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EMAIL_ADDRESS': 'email',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'HA_PROGRAM_TYPE': 'program_type',
  'WEBSITE': 'website',
  'WEB_SITE': 'website',
  'URL': 'website'
}

// Valid database columns (only include mapped columns)
const VALID_DB_COLUMNS = [
  'pha_code', 'name', 'address', 'city', 'state', 'zip', 
  'phone', 'email', 'exec_dir_email', 'website', 'program_type',
  'latitude', 'longitude', 'supports_hcv', 'waitlist_open', 
  'waitlist_status', 'jurisdictions'
]

async function uploadCSVToSupabase(csvFilePath, batchSize = 100) {
  console.log('🚀 Starting Supabase upload...')
  console.log(`📁 File: ${csvFilePath}`)
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ File not found: ${csvFilePath}`)
    process.exit(1)
  }

  const records = []
  let totalProcessed = 0
  let totalInserted = 0
  let totalErrors = 0

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(parse({ 
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Transform row using field mappings
        const mappedRow = {}
        
        for (const [csvField, value] of Object.entries(row)) {
          const dbField = FIELD_MAPPINGS[csvField.toUpperCase()]
          
          // Only include columns that have explicit mappings and are valid
          if (dbField && VALID_DB_COLUMNS.includes(dbField) && value && value.trim()) {
            mappedRow[dbField] = value.trim()
          }
        }

        // Ensure we have required fields
        if (mappedRow.name) {
          records.push(mappedRow)
        }

        totalProcessed++
        
        // Process in batches
        if (records.length >= batchSize) {
          processBatch(records.splice(0, batchSize))
        }
      })
      .on('end', async () => {
        // Process remaining records
        if (records.length > 0) {
          await processBatch(records)
        }
        
        console.log('\n✅ Upload completed!')
        console.log(`📊 Total processed: ${totalProcessed}`)
        console.log(`✅ Successfully inserted: ${totalInserted}`)
        console.log(`❌ Errors: ${totalErrors}`)
        
        resolve({ totalProcessed, totalInserted, totalErrors })
      })
      .on('error', reject)
  })

  async function processBatch(batch) {
    try {
      console.log(`📤 Uploading batch of ${batch.length} records...`)
      
      const { data, error } = await supabase
        .from('pha_agencies')
        .upsert(batch, { 
          onConflict: 'pha_code',
          ignoreDuplicates: false 
        })
        .select('id')

      if (error) {
        console.error('❌ Batch upload error:', error)
        totalErrors += batch.length
      } else {
        totalInserted += batch.length
        console.log(`✅ Batch uploaded successfully`)
      }
    } catch (error) {
      console.error('❌ Batch processing error:', error)
      totalErrors += batch.length
    }
  }
}

// Main execution
async function main() {
  const csvFile = process.argv[2]
  
  if (!csvFile) {
    console.error('❌ Usage: node upload-to-supabase.js <path-to-csv-file>')
    console.error('   Example: node upload-to-supabase.js ./data/pha-data.csv')
    process.exit(1)
  }

  try {
    // Test connection
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('pha_agencies')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error)
      process.exit(1)
    }

    console.log('✅ Supabase connection successful!')
    
    // Upload CSV
    await uploadCSVToSupabase(path.resolve(csvFile))
    
  } catch (error) {
    console.error('❌ Upload failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error) 