
export interface PotActivity {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  type: 'contribution' | 'payout';
  status: 'pending' | 'approved' | 'complete' | 'rejected' | null;
  created_at: string | null;
  users?: {
    name: string | null;
    email: string;
  };
}
