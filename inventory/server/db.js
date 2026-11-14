// db.js: Supabase client initialization
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const path = require('path');

// Load environment variables from .env located in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const rawUrl = process.env.SUPABASE_URL;
const rawKey = process.env.SUPABASE_KEY;

// Check if credentials are missing or still placeholder values
const isConfigured = rawUrl && rawKey && !rawUrl.includes('your-project-id');

if (!isConfigured) {
  console.log('---------------------------------------------------------------');
  console.log('⚠️  SUPABASE SETUP REQUIRED:');
  console.log('   Please add your Supabase project credentials in server/.env:');
  console.log('   1. SUPABASE_URL=https://<your-project>.supabase.co');
  console.log('   2. SUPABASE_KEY=<your-anon-or-service-role-key>');
  console.log('---------------------------------------------------------------');
}

// Fallback to a valid format URL if unconfigured to allow the server to start cleanly
const supabaseUrl = isConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const supabaseKey = isConfigured ? rawKey : 'placeholder-anon-key';

// Create and export the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

module.exports = supabase;
