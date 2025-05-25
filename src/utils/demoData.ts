
import { PotActivity } from '@/types/group-pot';

export const DEMO_PAYOUT_REQUESTS: PotActivity[] = process.env.NODE_ENV === 'development' ? [
  {
    id: 'demo-request-1',
    group_id: '',
    user_id: 'demo-user-1',
    type: 'payout',
    amount: 75.50,
    status: 'pending',
    note: 'Pizza for group meeting',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    users: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      wallet_address: '0x1234...5678'
    }
  },
  {
    id: 'demo-request-2',
    group_id: '',
    user_id: 'demo-user-2',
    type: 'payout',
    amount: 120.00,
    status: 'pending',
    note: 'Transportation expenses',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    users: {
      name: 'Sam Wilson',
      email: 'sam@example.com',
      wallet_address: null
    }
  }
] : [];

export const shouldUseDemoData = (realData: any[], forceDemo: boolean = false): boolean => {
  return process.env.NODE_ENV === 'development' && (forceDemo || realData.length === 0);
};

export const getDemoPayoutRequests = (realRequests: PotActivity[]): PotActivity[] => {
  return shouldUseDemoData(realRequests) ? DEMO_PAYOUT_REQUESTS : realRequests;
};
