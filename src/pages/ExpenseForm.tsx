import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts';
import { Loader2, ChevronDown, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseFormBasicFields from '@/components/expenses/ExpenseFormBasicFields';
import ExpensePaidBySelector from '@/components/expenses/ExpensePaidBySelector';
import ExpenseParticipantsSelector from '@/components/expenses/ExpenseParticipantsSelector';
import ExpenseOptionsFields from '@/components/expenses/ExpenseOptionsFields';
import ExpenseFormSubmitButton from '@/components/expenses/ExpenseFormSubmitButton';
import ExpenseFormHeader from '@/components/expenses/ExpenseFormHeader';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type Group = {
  id: string;
  name: string;
  icon: string;
};

const ExpenseForm = () => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('CHF');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState('group');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const groupIdFromUrl = searchParams.get('groupId');

  useEffect(() => {
    if (user) {
      setPaidBy(user.id);
      setSelectedUsers({ [user.id]: true });
    }
  }, [user]);

  useEffect(() => {
    if (groupIdFromUrl) {
      setSelectedGroup(groupIdFromUrl);
    }
  }, [groupIdFromUrl]);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    
    if (id) {
      fetchExpense(id);
    }
  }, [id, user]);

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email');
        
      if (error) throw error;
      
      setUsers(data || []);
      
      // Initialize selectedUsers with current user selected
      const initialSelectedUsers: Record<string, boolean> = {};
      data?.forEach(user => {
        initialSelectedUsers[user.id] = false;
      });
      
      if (user) {
        initialSelectedUsers[user.id] = true;
      }
      
      setSelectedUsers(initialSelectedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to load users: ${error.message}`);
    }
  };

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      // First get groups where the user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
        
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map(m => m.group_id);
        
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('id, name, icon')
          .in('id', groupIds);
          
        if (groupsError) throw groupsError;
        
        setGroups(groupsData || []);
        
        // If there's a groupId in URL params, use that
        if (groupIdFromUrl && groupsData?.some(g => g.id === groupIdFromUrl)) {
          setSelectedGroup(groupIdFromUrl);
        } 
        // Otherwise use the first group if available
        else if (groupsData && groupsData.length > 0 && !selectedGroup) {
          setSelectedGroup(groupsData[0].id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast.error(`Failed to load groups: ${error.message}`);
    }
  };

  const fetchExpense = async (expenseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_members (
            user_id,
            share_type,
            share_value
          )
        `)
        .eq('id', expenseId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setAmount(data.amount?.toString() || '');
        setCurrency(data.currency || 'CHF');
        setDate(data.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
        setPaidBy(data.paid_by || (user?.id || ''));
        setNotes(data.notes || '');
        setVisibility(data.visibility || 'group');
        setSplitMethod('equal'); // Default
        setSelectedGroup(data.group_id || null);
        
        // Set up selected users from expense_members
        if (data.expense_members && data.expense_members.length > 0) {
          const selectedUsersMap: Record<string, boolean> = {};
          data.expense_members.forEach((member: any) => {
            selectedUsersMap[member.user_id] = true;
          });
          setSelectedUsers(selectedUsersMap);
        }
      }
    } catch (error: any) {
      toast.error(`Error fetching expense: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create an expense");
      return;
    }

    if (!title || !amount || parseFloat(amount) <= 0 || !paidBy) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([_, isSelected]) => isSelected)
      .map(([userId]) => userId);

    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsSaving(true);
    try {
      const expenseData = {
        title,
        amount: parseFloat(amount),
        currency,
        date: new Date(date).toISOString(),
        paid_by: paidBy,
        notes,
        visibility,
        group_id: selectedGroup
      };

      let expenseId: string;

      if (id) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id);

        if (error) throw error;
        expenseId = id;
        
        // Delete existing expense members
        const { error: deleteError } = await supabase
          .from('expense_members')
          .delete()
          .eq('expense_id', id);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new expense
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenseData)
          .select();

        if (error) throw error;
        expenseId = data[0].id;
      }

      // Calculate shares based on split method
      const totalAmount = parseFloat(amount);
      const participantCount = selectedUserIds.length;
      let expenseMembers = [];
      
      if (splitMethod === 'equal') {
        // Equal split
        const equalShare = totalAmount / participantCount;
        
        expenseMembers = selectedUserIds.map(userId => ({
          expense_id: expenseId,
          user_id: userId,
          share_type: 'equal',
          share_value: equalShare,
          paid_status: userId === paidBy // Mark as paid if this user paid
        }));
      } else {
        // For other split methods (to be implemented)
        expenseMembers = selectedUserIds.map(userId => ({
          expense_id: expenseId,
          user_id: userId,
          share_type: 'equal', // Default to equal for now
          share_value: totalAmount / participantCount,
          paid_status: userId === paidBy
        }));
      }
      
      // Insert expense members
      const { error: membersError } = await supabase
        .from('expense_members')
        .insert(expenseMembers);
        
      if (membersError) throw membersError;

      toast.success(id ? "Expense updated successfully" : "Expense created successfully");
      navigate(selectedGroup ? `/group/${selectedGroup}` : '/');
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast.error(`Error saving expense: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto py-6">
        <ExpenseFormHeader />
        
        <Card>
          <CardHeader>
            <CardTitle>{id ? 'Edit Expense' : 'Add Expense'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Group</label>
                <div className="flex items-center justify-between border rounded-md p-2">
                  <div className="flex items-center">
                    {groups.length > 0 && selectedGroup ? (
                      <>
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-2 text-lg">
                          {groups.find(g => g.id === selectedGroup)?.icon || '🏠'}
                        </div>
                        <span>{groups.find(g => g.id === selectedGroup)?.name || 'Select a group'}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No groups available</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="split">Split</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <ExpenseFormBasicFields 
                    title={title}
                    setTitle={setTitle}
                    amount={amount}
                    setAmount={setAmount}
                    currency={currency}
                    setCurrency={setCurrency}
                    date={date}
                    setDate={setDate}
                  />
                  <ExpensePaidBySelector
                    users={users}
                    paidBy={paidBy}
                    setPaidBy={setPaidBy}
                    loading={false}
                  />
                </TabsContent>
                <TabsContent value="split" className="space-y-4 mt-4">
                  <ExpenseParticipantsSelector 
                    users={users}
                    selectedUsers={selectedUsers}
                    toggleUser={toggleUser}
                  />
                  
                  {/* Add Person button */}
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.info("User invitation will be available soon")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Person
                  </Button>
                </TabsContent>
                <TabsContent value="options" className="space-y-4 mt-4">
                  <ExpenseOptionsFields 
                    visibility={visibility}
                    setVisibility={setVisibility}
                    splitMethod={splitMethod}
                    setSplitMethod={setSplitMethod}
                    notes={notes}
                    setNotes={setNotes}
                  />
                </TabsContent>
              </Tabs>
              
              <ExpenseFormSubmitButton loading={isSaving} />
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExpenseForm;
