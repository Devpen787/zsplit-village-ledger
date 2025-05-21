
import { InviteUserModal } from "@/components/InviteUserModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Users, AlertCircle, LogOut } from "lucide-react";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ExpensesList } from "@/components/ExpensesList";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

// Define TypeScript type for users based on the database schema
type User = {
  id: string;
  name: string | null;
  email: string;
  group_name: string | null;
};

const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, signOut } = useAuth();
  const mockGroupName = currentUser?.group_name || "Zuitzerland House";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, group_name');

        if (error) throw new Error(error.message);
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zsplit</h1>
        <div className="flex gap-2">
          {currentUser ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Link to="/signup">
              <Button variant="outline" size="sm">Signup</Button>
            </Link>
          )}
          <InviteUserModal onUserAdded={() => {
            // Refresh users list when a new user is added
            const fetchUsers = async () => {
              try {
                const { data, error } = await supabase
                  .from('users')
                  .select('id, name, email, group_name');
      
                if (error) throw new Error(error.message);
                setUsers(data || []);
              } catch (err) {
                console.error('Error refreshing users:', err);
              }
            };
            
            fetchUsers();
          }} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">{mockGroupName}</h2>
        <BalanceSummary />
      </div>

      {currentUser && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-md font-medium">Your Profile</h3>
            <Users className="h-4 w-4" />
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{currentUser.name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-slate-100">
                    {currentUser.role || "participant"}
                  </span>
                </div>
              </div>
              {currentUser.wallet_address && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  Wallet: {currentUser.wallet_address}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Group Members</h3>
        {loading ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{user.name || "Unnamed"}</span>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.group_name || "No group"}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium">Recent Expenses</h3>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        <ExpensesList limit={5} />
      </div>

      <div className="fixed bottom-6 right-6">
        <Link to="/expenses/new">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
