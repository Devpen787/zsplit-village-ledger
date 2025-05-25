
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
