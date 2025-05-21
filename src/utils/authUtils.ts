
/**
 * Utility functions for authentication
 */

/**
 * Validates if a role is valid according to our system's allowed roles
 */
export const isValidRole = (role: string): boolean => {
  const allowedRoles = ['participant', 'organizer', 'admin'];
  return allowedRoles.includes(role);
};
