#!/bin/bash

# Supabase CSV Upload Script
# Usage: ./upload.sh path/to/your/data.csv

echo "🚀 AssistanceHub - Supabase Data Upload"
echo "========================================"

# Check if CSV file argument provided
if [ $# -eq 0 ]; then
    echo "❌ Error: No CSV file specified"
    echo "Usage: ./upload.sh path/to/your/data.csv"
    echo "Example: ./upload.sh ~/Downloads/pha-data.csv"
    exit 1
fi

CSV_FILE="$1"

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: File not found: $CSV_FILE"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "SUPABASE_URL=https://your-project-id.supabase.co"
    echo "SUPABASE_SERVICE_KEY=your-service-role-key"
    echo ""
    echo "Get these from: https://supabase.com/dashboard → Settings → API"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the upload
echo "📁 Uploading: $CSV_FILE"
echo "🔗 Starting upload to Supabase..."
echo ""

node upload-to-supabase.js "$CSV_FILE"

echo ""
echo "✅ Upload process completed!"
echo "Check your Supabase dashboard to verify the data." 