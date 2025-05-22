
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupInvites = (groupId: string | undefined) => {
  const inviteMember = async (inviteEmail: string, userId: string) => {
    if (!groupId || !userId) throw new Error("Missing group or user information");
    
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
      .eq('group_id', groupId)
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
        group_id: groupId,
        user_id: userData.id,
        role: 'member'
      });
      
    if (addError) throw addError;
    
    toast.success(`Successfully invited ${inviteEmail}`);
  };

  return { inviteMember };
};
