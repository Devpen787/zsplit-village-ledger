
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type User = {
  id: string;
  name: string | null;
};

export const useExpenseUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [paidBy, setPaidBy] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching users...");
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch real users from the database
        const { data: dbUsers, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        const formattedUsers: User[] = dbUsers.map(dbUser => ({
          id: dbUser.id, // Store as string
          name: dbUser.name || `User (${dbUser.email})`
        }));
        
        setUsers(formattedUsers);
        
        // Default to current user as the payer
        if (!paidBy && user?.id) {
          setPaidBy(user.id);
        }
        
        // Pre-select the current user as a participant
        if (user?.id) {
          setSelectedUsers(prev => ({
            ...prev,
            [user.id]: true
          }));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, paidBy]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return {
    users,
    loading,
    paidBy,
    setPaidBy,
    selectedUsers,
    toggleUser
  };
};
