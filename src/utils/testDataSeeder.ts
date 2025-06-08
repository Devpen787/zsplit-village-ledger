
import { storageAdapter } from '@/adapters';
import { toast } from '@/components/ui/sonner';

export const seedTestData = async (currentUserId: string) => {
  try {
    console.log('🌱 Starting test data seeding...');
    
    // Create test users first
    const testUsers = [
      { id: 'test-user-1', name: 'Alice Johnson', email: 'alice@test.com', wallet_address: '0x1234...5678' },
      { id: 'test-user-2', name: 'Bob Smith', email: 'bob@test.com', wallet_address: '0x5678...9012' },
      { id: 'test-user-3', name: 'Charlie Brown', email: 'charlie@test.com', wallet_address: null }
    ];

    // Note: In a real app, users would be created through signup
    // For testing with LocalStorage, we can add them directly
    console.log('👥 Test users prepared');

    // Create a test group
    const testGroup = await storageAdapter.createGroup({
      name: 'Test Group 🧪',
      icon: '🧪',
      created_by: currentUserId
    });
    
    console.log('📁 Created test group:', testGroup.id);

    // Add test users as members (if using LocalStorage)
    try {
      for (const user of testUsers) {
        await storageAdapter.addGroupMember(testGroup.id, user.id, 'member');
      }
      console.log('✅ Added test members to group');
    } catch (error) {
      console.log('ℹ️ Could not add test members (expected with Supabase)');
    }

    // Create sample expenses
    const expenses = [
      {
        title: 'Team Lunch 🍕',
        amount: 85.50,
        currency: 'CHF',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        paid_by: currentUserId,
        group_id: testGroup.id
      },
      {
        title: 'Coffee Run ☕',
        amount: 24.00,
        currency: 'CHF',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        paid_by: currentUserId,
        group_id: testGroup.id
      },
      {
        title: 'Office Supplies 📎',
        amount: 156.75,
        currency: 'CHF',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        paid_by: currentUserId,
        group_id: testGroup.id
      },
      {
        title: 'Transportation 🚗',
        amount: 45.20,
        currency: 'CHF',
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        paid_by: currentUserId,
        group_id: testGroup.id
      },
      {
        title: 'Team Building Event 🎳',
        amount: 320.00,
        currency: 'CHF',
        date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        paid_by: currentUserId,
        group_id: testGroup.id
      }
    ];

    for (const expense of expenses) {
      await storageAdapter.createExpense(expense);
    }
    
    console.log('💰 Created 5 test expenses');

    // Create pot activities
    const potActivities = [
      {
        group_id: testGroup.id,
        user_id: currentUserId,
        type: 'contribution' as const,
        amount: 100.00,
        status: 'complete' as const,
        note: 'Initial contribution'
      },
      {
        group_id: testGroup.id,
        user_id: currentUserId,
        type: 'contribution' as const,
        amount: 75.50,
        status: 'complete' as const,
        note: 'Monthly contribution'
      },
      {
        group_id: testGroup.id,
        user_id: currentUserId,
        type: 'payout' as const,
        amount: 50.00,
        status: 'pending' as const,
        note: 'Event supplies reimbursement'
      }
    ];

    for (const activity of potActivities) {
      await storageAdapter.createPotActivity(activity);
    }
    
    console.log('🏦 Created 3 pot activities');

    toast.success(`Test data seeded successfully! Created group "${testGroup.name}" with expenses and pot activities.`);
    
    return testGroup;
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    toast.error(`Failed to seed test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};
