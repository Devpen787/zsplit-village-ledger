
export type User = {
  id: string;
  email: string | null;
  name?: string | null;
  role?: string | null;
  group_name?: string | null;
  wallet_address?: string | null;
  avatar_url?: string | null;
};

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<User | null>;
  authError: string | null;
  clearAuthError: () => void;
  loginAttempts: number;
  resetLoginAttempts: () => void;
}
