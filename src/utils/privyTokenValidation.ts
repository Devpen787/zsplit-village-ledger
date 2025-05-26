
/**
 * Utility functions for validating Privy tokens before using them with Supabase
 */

interface PrivyTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Validates a Privy JWT token structure and expiration
 * @param token - The JWT token from Privy
 * @returns Object with validation result and parsed payload
 */
export const validatePrivyToken = (token: string): { 
  isValid: boolean; 
  payload?: PrivyTokenPayload; 
  error?: string 
} => {
  try {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token is required and must be a string' };
    }

    // Check if token has the correct JWT structure (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid JWT format: token must have 3 parts' };
    }

    // Decode the payload (second part)
    try {
      const payload = JSON.parse(atob(parts[1])) as PrivyTokenPayload;
      
      // Check required fields
      if (!payload.sub || !payload.iat || !payload.exp) {
        return { isValid: false, error: 'Invalid token payload: missing required fields' };
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        return { isValid: false, error: 'Token has expired' };
      }

      // Check if token is issued in the future (clock skew tolerance of 5 minutes)
      const clockSkewTolerance = 5 * 60; // 5 minutes in seconds
      if (payload.iat > currentTime + clockSkewTolerance) {
        return { isValid: false, error: 'Token issued in the future' };
      }

      return { isValid: true, payload };
    } catch (decodeError) {
      return { isValid: false, error: 'Failed to decode token payload' };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, error: 'Unexpected error during token validation' };
  }
};

/**
 * Validates a Privy user ID format
 * @param userId - The user ID from Privy
 * @returns boolean indicating if the user ID is valid
 */
export const validatePrivyUserId = (userId: string): boolean => {
  if (!userId || typeof userId !== 'string') {
    return false;
  }

  // Privy user IDs typically start with "did:privy:" followed by an identifier
  // This is a basic validation - adjust based on your actual Privy setup
  const privyUserIdPattern = /^did:privy:[a-zA-Z0-9-_]+$/;
  return privyUserIdPattern.test(userId) || userId.length > 10; // Fallback for custom formats
};
