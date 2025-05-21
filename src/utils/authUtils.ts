
/**
 * Utility functions for authentication
 */

/**
 * Cleans up all authentication related state in localStorage and sessionStorage
 * to prevent authentication limbo states
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Validates if a role is valid according to our system's allowed roles
 */
export const isValidRole = (role: string): boolean => {
  const allowedRoles = ['participant', 'organizer'];
  return allowedRoles.includes(role);
};
