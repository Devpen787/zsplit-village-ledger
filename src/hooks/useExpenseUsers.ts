
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
        
        // For now, let's create a mock list of users including the current user
        // This allows the app to function while backend issues are resolved
        const mockUsers: User[] = [];
        
        if (user) {
          mockUsers.push({
            id: user.id,
            name: user.name || `User (${user.email})` 
          });
          
          // Add some sample users for testing
          mockUsers.push({ id: 'user2', name: 'Sample User 1' });
          mockUsers.push({ id: 'user3', name: 'Sample User 2' });
          
          setUsers(mockUsers);
          
          // Default to current user as the payer
          if (!paidBy) {
            setPaidBy(user.id);
          }
          
          // Pre-select the current user as a participant
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
