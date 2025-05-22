
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "@/types/expenses";

/**
 * Fetches expenses for a specific group
 */
export const fetchGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      title,
      amount,
      date,
      created_at,
      currency,
      paid_by,
      group_id
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data || [];
};
