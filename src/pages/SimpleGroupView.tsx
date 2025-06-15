
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { SimpleMembersCard } from "@/components/groups/SimpleMembersCard";
import { SimpleGroupManagementPanel } from "@/components/groups/SimpleGroupManagementPanel";
import { ImprovedInviteMemberDialog } from "@/components/groups/ImprovedInviteMemberDialog";
import { useSimpleGroupMembers } from "@/hooks/useSimpleGroupMembers";
import { useAuth } from "@/contexts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

const SimpleGroupView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  
  const { members, fetchMembers, loading: membersLoading } = useSimpleGroupMembers(id);
  
  // Check if current user is admin
  const currentUserMember = members.find(member => member.user?.id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';
  
  console.log("[SIMPLE GROUP VIEW] Current state:", {
    groupId: id,
    membersCount: members?.length || 0,
    isAdmin,
    currentUserMember
  });
  
  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      
      setGroupLoading(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error("[SIMPLE GROUP VIEW] Error fetching group:", error);
          setGroup(null);
        } else {
          setGroup(data);
        }
      } catch (error) {
        console.error("[SIMPLE GROUP VIEW] Unexpected error:", error);
        setGroup(null);
      } finally {
        setGroupLoading(false);
      }
    };
    
    fetchGroup();
  }, [id]);
  
  const handleCreateExpense = () => {
    navigate(`/expenses/new?groupId=${id}`);
  };
  
  const handleMemberAddedRefresh = () => {
    console.log("[SIMPLE GROUP VIEW] Member added, refreshing data");
    fetchMembers();
  };
  
  // If no group ID is provided, redirect to the groups list
  useEffect(() => {
    if (!id) {
      navigate('/group');
    }
  }, [id, navigate]);

  if (groupLoading || membersLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!group) {
    return (
      <AppLayout>
        <motion.div 
          className="container mx-auto py-6 space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-destructive/20 shadow">
            <CardHeader>
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Group not found</CardTitle>
              </div>
              <CardDescription>
                The group you're looking for doesn't exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/group')} className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GroupHeader 
          groupName={group.name}
          groupIcon={group.icon}
          isAdmin={isAdmin}
          onCreateExpense={handleCreateExpense}
        />

        <SimpleMembersCard 
          members={members}
          isAdmin={isAdmin}
          onInviteClick={() => setInviteDialogOpen(true)}
          currentUserId={user?.id}
          loading={membersLoading}
        />

        {isAdmin && (
          <SimpleGroupManagementPanel
            groupId={id!}
            members={members}
            currentUserId={user?.id}
            isAdmin={isAdmin}
            onMemberUpdate={handleMemberAddedRefresh}
          />
        )}
        
        <ImprovedInviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          groupId={id!}
          invitedBy={user?.id || ''}
          onMemberAdded={handleMemberAddedRefresh}
        />
      </motion.div>
    </AppLayout>
  );
};

export default SimpleGroupView;
