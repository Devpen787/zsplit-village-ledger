
// Core data types for the storage adapter
export interface User {
  id: string;
  name: string | null;
  email: string;
  wallet_address?: string | null;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  created_by: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user?: User;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  group_id?: string;
  paid_by_user?: User;
}

export interface Balance {
  user_id: string;
  user_name: string | null;
  user_email: string;
  amount: number;
}

export interface PotActivity {
  id: string;
  group_id: string;
  user_id: string;
  type: 'contribution' | 'payout';
  amount: number;
  status: 'pending' | 'approved' | 'complete' | 'rejected';
  note?: string;
  created_at: string;
  user?: {
    name?: string | null;
  };
}

export interface Invitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  groups?: {
    name: string;
    icon: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  expires_at?: number;
}
