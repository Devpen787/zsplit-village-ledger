
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, UserMinus, Crown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSimpleGroupManagement } from '@/hooks/useSimpleGroupManagement';
import type { SimpleGroupMember } from '@/hooks/useSimpleGroupMembers';

interface SimpleGroupManagementPanelProps {
  groupId: string;
  members: SimpleGroupMember[];
  currentUserId?: string;
  isAdmin: boolean;
  onMemberUpdate: () => void;
}

export const SimpleGroupManagementPanel = ({ 
  groupId, 
  members, 
  currentUserId, 
  isAdmin,
  onMemberUpdate 
}: SimpleGroupManagementPanelProps) => {
  const { updateMemberRole, removeMember, loading } = useSimpleGroupManagement();

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'participant') => {
    try {
      await updateMemberRole(groupId, userId, newRole);
      onMemberUpdate();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(groupId, userId);
      onMemberUpdate();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Group Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                <AvatarFallback>
                  {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.user?.name || 'Unknown User'}
                  {currentUserId === member.user?.id && ' (You)'}
                </p>
                <p className="text-sm text-muted-foreground">{member.user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={member.role}
                onValueChange={(newRole: 'admin' | 'member' | 'participant') => 
                  handleRoleChange(member.user?.id || '', newRole)
                }
                disabled={loading || currentUserId === member.user?.id}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="participant">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Participant
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {currentUserId !== member.user?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={loading}
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {member.user?.name || member.user?.email} from this group? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveMember(member.user?.id || '')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove Member
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
