
import { createClient } from '@supabase/supabase-js';

// Constants for Supabase connection
// In a traditional app, these would come from environment variables
export const supabaseUrl = 'https://ymwbfotugdtmsoqbxsds.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd2Jmb3R1Z2R0bXNvcWJ4c2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTk4MTUsImV4cCI6MjA2MzM5NTgxNX0.X_cM1p6WLOGgSp4RddJLdsELZONd9Hn5qUl9YiVSv34';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
