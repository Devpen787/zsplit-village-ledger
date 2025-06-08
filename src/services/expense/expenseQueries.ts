
import { storageAdapter } from "@/adapters";
import { toast } from "@/components/ui/sonner";
import { Expense } from '@/adapters/types';

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const data = await storageAdapter.getExpenseById(id);
    return data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    toast.error("Failed to load expense.");
    return null;
  }
};

export const fetchUsers = async (groupId: string | null) => {
  try {
    const data = await storageAdapter.getUsers(groupId || undefined);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to load users.");
    return [];
  }
};

export const fetchGroupDetails = async (groupId: string) => {
  try {
    const group = await storageAdapter.getGroupById(groupId);
    return group;
  } catch (error) {
    console.error("Error fetching group details:", error);
    toast.error("Failed to load group details");
    return null;
  }
};
