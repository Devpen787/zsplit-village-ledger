
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpensesList } from "@/components/ExpensesList";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from '@/contexts';
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Users, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { GroupCreationModal } from '@/components/groups/GroupCreationModal';
import { Group } from '@/types/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGroups();
      
      // Set up real-time subscription for groups
      const groupsChannel = supabase
        .channel('groups-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'groups' },
          () => fetchGroups()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(groupsChannel);
      };
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setHasRecursionError(false);
    
    try {
      console.log("Fetching groups for user:", user.id);
      
      // Use the get_user_groups function to fetch group IDs securely
      const { data: groupIds, error: functionError } = await supabase
        .rpc('get_user_groups', { user_id_param: user.id });
        
      if (functionError) {
        console.error("Error fetching group IDs:", functionError);
        
        // Special handling for recursive RLS policy errors
        if (functionError.message?.includes('infinite recursion') || functionError.code === '42P17') {
          setHasRecursionError(true);
          setError("Database policy configuration issue");
          return;
        }
        
        throw functionError;
      }
      
      console.log("Group IDs:", groupIds);
      
      if (groupIds && groupIds.length > 0) {
        // Fetch group details
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          
          // Special handling for recursive RLS policy errors
          if (groupsError.message?.includes('infinite recursion') || groupsError.code === '42P17') {
            setHasRecursionError(true);
            setError("Database policy configuration issue");
            return;
          }
          
          throw groupsError;
        }
        
        console.log("Groups data:", groupsData);
        setGroups(groupsData || []);
      } else {
        console.log("No groups found for user");
        setGroups([]);
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      setError(`Failed to load groups: ${error.message}`);
      toast.error(`Failed to load groups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setIsCreateGroupModalOpen(false);
    toast.success(`Group "${newGroup.name}" created successfully!`);
    fetchGroups();
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Button onClick={handleCreateGroup}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </div>

        {user && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                  <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-medium">
                    Welcome, {user.name || user.email.split('@')[0]}!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Track expenses and split bills with your friends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Groups</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/group">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-32 p-6" />
                </Card>
              ))}
            </div>
          ) : hasRecursionError ? (
            <Card>
              <CardContent className="p-6">
                <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-600">Database Configuration Issue</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    <p className="mb-2">We're experiencing a temporary issue with database policies.</p>
                    <div className="flex justify-start mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchGroups}
                        className="flex items-center gap-1 bg-amber-100 dark:bg-amber-800/30 border-amber-200"
                      >
                        <RefreshCw className="h-3 w-3" /> Try Again
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={fetchGroups}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card 
                  key={group.id} 
                  className="hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/group/${group.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mr-3">
                          {group.icon || '🏠'}
                        </div>
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(group.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground opacity-50" />
                  <div className="space-y-1">
                    <h3 className="font-medium">No groups yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a group to start tracking expenses with friends
                    </p>
                  </div>
                  <Button onClick={handleCreateGroup} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/expenses/new">New Expense</Link>
            </Button>
          </div>
          <ExpensesList limit={5} />
        </div>
      </div>

      {/* Group Creation Modal */}
      <GroupCreationModal 
        open={isCreateGroupModalOpen}
        onOpenChange={setIsCreateGroupModalOpen}
        onGroupCreated={handleGroupCreated}
      />
    </AppLayout>
  );
};

export default Index;
