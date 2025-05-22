
// If this file already exists, we're just adding types needed for wallet functionality
import { User } from './auth';

export interface PotContributor {
  userId: string;
  name: string | null;
  amount: number;
  walletAddress?: string | null;
}

export interface PotActivity {
  id: string;
  group_id: string;
  user_id: string;
  type: 'contribution' | 'payout';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'complete' | null;
  note?: string;
  created_at: string;
  users?: {
    id?: string;
    name: string | null;
    email: string;
    wallet_address?: string | null;
  };
}
