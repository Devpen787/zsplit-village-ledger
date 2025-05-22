
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpensesList } from "@/components/ExpensesList";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from '@/contexts';
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Users, Wallet, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { GroupCreationModal } from '@/components/groups/GroupCreationModal';
import { Group } from '@/types/supabase';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
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
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Fetching groups for user:", user.id);
      
      // Fetch groups where the user is a member
      const { data: groupMemberships, error: membershipError } = await (supabase
        .from('group_members') as any)
        .select('group_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("Error fetching group memberships:", membershipError);
        throw membershipError;
      }
      
      console.log("Group memberships:", groupMemberships);

      if (groupMemberships && groupMemberships.length > 0) {
        const groupIds = groupMemberships.map((membership: any) => membership.group_id);
        
        const { data: groupsData, error: groupsError } = await (supabase
          .from('groups') as any)
          .select('*')
          .in('id', groupIds);

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          throw groupsError;
        }
        
        console.log("Groups data:", groupsData);
        setGroups(groupsData || []);
      } else {
        console.log("No group memberships found");
        setGroups([]);
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
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
