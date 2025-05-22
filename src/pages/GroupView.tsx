
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, PlusCircle, UserPlus, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpensesList } from "@/components/ExpensesList";
import { Loader2 } from "lucide-react";
import { Group, GroupMember } from "@/types/supabase";

const GroupView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    fetchGroupDetails();
    
    const groupsChannel = supabase
      .channel(`group-${id}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${id}` },
        () => fetchGroupDetails()
      )
      .subscribe();
      
    const membersChannel = supabase
      .channel(`group-${id}-members-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` },
        () => fetchMembers()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [id, user]);
  
  const fetchGroupDetails = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    try {
      console.log("Fetching group details for:", id);
      
      // Fetch group details
      const { data: groupData, error: groupError } = await (supabase
        .from('groups') as any)
        .select('*')
        .eq('id', id)
        .single();
        
      if (groupError) {
        console.error("Error fetching group:", groupError);
        throw groupError;
      }
      
      if (!groupData) {
        toast.error("Group not found");
        navigate('/');
        return;
      }
      
      console.log("Group data:", groupData);
      setGroup(groupData);
      
      // Check if current user is an admin
      const { data: memberData, error: memberError } = await (supabase
        .from('group_members') as any)
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single();
        
      if (!memberError && memberData) {
        setIsAdmin(memberData.role === 'admin');
      }
      
      await fetchMembers();
    } catch (error: any) {
      console.error("Error fetching group:", error);
      toast.error(`Error loading group: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMembers = async () => {
    if (!id) return;
    
    try {
      console.log("Fetching members for group:", id);
      
      const { data: membersData, error: membersError } = await (supabase
        .from('group_members') as any)
        .select(`
          id,
          group_id,
          user_id,
          role,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('group_id', id);
        
      if (membersError) {
        console.error("Error fetching members:", membersError);
        throw membersError;
      }
      
      console.log("Group members data:", membersData);
      setMembers(membersData || []);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
    }
  };
  
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      // First check if the user exists
      const { data: userData, error: userError } = await (supabase
        .from('users') as any)
        .select('id')
        .eq('email', inviteEmail.toLowerCase())
        .maybeSingle();
        
      if (userError) throw userError;
      
      if (!userData) {
        toast.error("User not found with that email");
        return;
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await (supabase
        .from('group_members') as any)
        .select('id')
        .eq('group_id', id)
        .eq('user_id', userData.id)
        .maybeSingle();
        
      if (memberCheckError) throw memberCheckError;
      
      if (existingMember) {
        toast.info("This user is already a member of this group");
        return;
      }
      
      // Add the user as a member
      const { error: addError } = await (supabase
        .from('group_members') as any)
        .insert({
          group_id: id,
          user_id: userData.id,
          role: 'member'
        });
        
      if (addError) throw addError;
      
      toast.success(`Successfully invited ${inviteEmail}`);
      setInviteEmail("");
      setInviteDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast.error(`Failed to invite member: ${error.message}`);
    } finally {
      setInviting(false);
    }
  };
  
  const handleCreateExpense = () => {
    navigate(`/expenses/new?groupId=${id}`);
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!group) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-semibold">Group not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-2xl">
              {group.icon}
            </div>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
          </div>
          <div className="flex space-x-2">
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            <Button onClick={handleCreateExpense}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="mt-4">
            <ExpensesList groupId={id} />
          </TabsContent>
          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Group Members</CardTitle>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                          <AvatarFallback>
                            {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.user?.name || member.user?.email.split('@')[0]}
                            {user && member.user?.id === user.id && " (You)"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No members found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="balances" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4 text-muted-foreground">
                  Balance visualization will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter their email"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GroupView;
