/**
 * Supabase Client Configuration
 * This file initializes the Supabase client used throughout the application
 * for authentication and database operations.
 */
import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded from the .env file
// VITE_ prefix is required for Vite to expose them to the client-side code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Validation: Ensure the required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

