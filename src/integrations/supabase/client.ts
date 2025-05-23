
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ymwbfotugdtmsoqbxsds.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd2Jmb3R1Z2R0bXNvcWJ4c2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTk4MTUsImV4cCI6MjA2MzM5NTgxNX0.X_cM1p6WLOGgSp4RddJLdsELZONd9Hn5qUl9YiVSv34";
// IMPORTANT: Never expose this key on the frontend in a production environment
// For this demo, we're using it only for the specific operation of creating users
// In a real app, this would be handled through a secure backend service or edge function
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd2Jmb3R1Z2R0bXNvcWJ4c2RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzgxOTgxNSwiZXhwIjoyMDYzMzk1ODE1fQ.y6IeUTecklFqqd8B642DxQ6RBV_QR5NrL20Viec3XUw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      // We'll use custom auth handling for Privy integration
    }
  }
});

// Function to set custom JWT from Privy into Supabase
export const setSupabaseAuth = async (privyUserId: string) => {
  console.log("[Auth] Setting Supabase session from Privy token...", privyUserId);
  
  try {
    // Set the auth for function calls
    supabase.functions.setAuth(privyUserId);
    
    // Set the session for database operations
    const { data, error } = await supabase.auth.setSession({
      access_token: privyUserId,
      refresh_token: '', // Optional
    });
    
    if (error) {
      console.error("Error setting Supabase session:", error);
      return false;
    }
    
    console.log("Supabase session set successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to set Supabase auth:", error);
    return false;
  }
};

// Helper function to clean up any auth state
export const clearAuthState = () => {
  // Clear any auth-related items from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear any custom auth state
  supabase.functions.setAuth('');
  
  // Try to reset the auth session
  try {
    supabase.auth.signOut();
  } catch (error) {
    console.warn("Non-critical: Error during signout cleanup:", error);
  }
};

// Create a service role client for admin operations that bypass RLS
// This should ONLY be used for specific operations like creating new users
let serviceRoleClient: any = null;

export const getServiceClient = () => {
  if (!serviceRoleClient) {
    console.log("[Auth] Creating service role client for admin operations");
    
    // Create a dedicated service role client that bypasses RLS
    serviceRoleClient = createClient(
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false // Don't persist this admin session
        }
      }
    );
  }
  
  return serviceRoleClient;
};
