
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Expense } from '@/types/expenses';

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching expense:", error);
      toast.error("Failed to load expense.");
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    toast.error("Failed to load expense.");
    return null;
  }
};

export const fetchUsers = async (groupId: string | null) => {
  try {
    let query = supabase.from('users').select('*');

    // If we have a group ID, filter users by group members
    if (groupId) {
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) {
        console.error("Error fetching group members:", membersError);
      } else if (groupMembers && groupMembers.length > 0) {
        const userIds = groupMembers.map(member => member.user_id);
        query = query.in('id', userIds);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to load users.");
    return [];
  }
};

export const fetchGroupDetails = async (groupId: string) => {
  try {
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to load group details");
      return null;
    }
    
    return group;
  } catch (error) {
    console.error("Error fetching group details:", error);
    toast.error("Failed to load group details");
    return null;
  }
};
