
import { User } from '@/types/auth';

// Auth-specific types used within the auth context
export type AuthState = {
  user: User | null;
  loading: boolean;
  authError: string | null;
  loginAttempts: number;
  isAuthenticated: boolean;
};

export type AuthActions = {
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<User | null>;
  clearAuthError: () => void;
  resetLoginAttempts: () => void;
};

export type AuthContextType = AuthState & AuthActions;
