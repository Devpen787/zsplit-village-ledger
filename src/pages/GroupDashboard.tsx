import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteUserModal } from "@/components/InviteUserModal";
import { useAuth } from '@/contexts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  wallet_address: string | null;
};

const GroupDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error("You don't have permission to delete users.");
      return;
    }

    if (userId === user?.id) {
      toast.error("You can't delete yourself.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        setError(error.message);
        toast.error(`Failed to delete user: ${error.message}`);
      } else {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh user list
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error deleting user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isAdmin && <InviteUserModal onUserAdded={handleUserAdded} />}
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {users.map((userItem) => (
                <div key={userItem.id} className="border rounded-md p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${userItem.email}`} />
                      <AvatarFallback>{userItem.name?.charAt(0) || userItem.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium">{userItem.name || userItem.email}</h4>
                      <p className="text-xs text-muted-foreground">{userItem.email}</p>
                      {userItem.wallet_address && (
                        <Badge variant="secondary" className="mt-1">
                          Wallet Connected
                        </Badge>
                      )}
                      <Badge className="mt-1">{userItem.role}</Badge>
                    </div>
                  </div>
                  {isAdmin && userItem.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteUser(userItem.id)}
                      className="mt-4 w-full text-red-500 hover:text-red-700 focus:outline-none text-sm"
                    >
                      Delete User
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDashboard;
