
/**
 * Validation utilities for financial and form data
 */

export const validateAmount = (value: string): { isValid: boolean; error?: string; amount?: number } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numValue < 0) {
    return { isValid: false, error: 'Amount must be positive' };
  }
  
  if (numValue > 1000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  
  // Check for more than 2 decimal places
  if (value.includes('.') && value.split('.')[1]?.length > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  
  return { isValid: true, amount: numValue };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateWalletAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
