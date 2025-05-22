
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group, GroupMember } from '@/types/supabase';
import { User } from '@/types/auth';

export const useGroupDetails = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
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

  const inviteMember = async (inviteEmail: string) => {
    if (!id || !user) throw new Error("Missing group or user information");
    
    // First check if the user exists
    const { data: userData, error: userError } = await (supabase
      .from('users') as any)
      .select('id')
      .eq('email', inviteEmail.toLowerCase())
      .maybeSingle();
      
    if (userError) throw userError;
    
    if (!userData) {
      toast.error("User not found with that email");
      throw new Error("User not found with that email");
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
      throw new Error("This user is already a member of this group");
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
  };

  return {
    group,
    members,
    loading,
    isAdmin,
    inviteMember,
    refreshData: fetchGroupDetails
  };
};
