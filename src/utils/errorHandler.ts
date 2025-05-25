
import { toast } from '@/components/ui/sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0, 'Connection error. Please check your internet connection.');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401, 'Please sign in to continue.');
    this.name = 'AuthenticationError';
  }
}

export class SecurityError extends AppError {
  constructor(message: string = 'Security violation detected') {
    super(message, 'SECURITY_ERROR', 403, 'Access denied for security reasons.');
    this.name = 'SecurityError';
  }
}

// Enhanced validation utilities
export const validateAmount = (amount: string | number): number => {
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) {
    throw new ValidationError('Amount must be a valid number');
  }
  
  if (numValue < 0) {
    throw new ValidationError('Amount must be positive');
  }
  
  if (!Number.isFinite(numValue)) {
    throw new ValidationError('Amount must be a finite number');
  }
  
  return numValue;
};

export const validateRequired = (value: any, fieldName: string): any => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value;
};

export const handleError = (error: unknown, context?: string): void => {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  if (error instanceof AppError) {
    toast.error(error.userMessage || error.message);
    return;
  }
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('fetch')) {
      toast.error('Connection error. Please check your internet connection.');
      return;
    }
    
    if (error.message.includes('auth')) {
      toast.error('Authentication error. Please sign in again.');
      return;
    }
    
    // Generic error handling
    toast.error(process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong. Please try again.'
    );
    return;
  }
  
  // Unknown error type
  toast.error('An unexpected error occurred. Please try again.');
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
};

// Retry utility for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};

// Memory leak prevention utility
export const createCancellablePromise = <T>(
  promise: Promise<T>
): { promise: Promise<T>; cancel: () => void } => {
  let isCancelled = false;
  
  const cancellablePromise = new Promise<T>((resolve, reject) => {
    promise.then(
      value => {
        if (!isCancelled) {
          resolve(value);
        }
      },
      error => {
        if (!isCancelled) {
          reject(error);
        }
      }
    );
  });
  
  return {
    promise: cancellablePromise,
    cancel: () => {
      isCancelled = true;
    }
  };
};

// Safe async operation wrapper with cleanup
export const useSafeAsync = () => {
  let isMounted = true;
  
  const safeSet = <T>(setter: (value: T) => void) => {
    return (value: T) => {
      if (isMounted) {
        setter(value);
      }
    };
  };
  
  const cleanup = () => {
    isMounted = false;
  };
  
  return { safeSet, cleanup };
};
