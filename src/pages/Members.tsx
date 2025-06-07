
import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Crown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Members = () => {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['all-members'],
    queryFn: async () => {
      console.log("[MEMBERS PAGE] Fetching all members");
      
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          role,
          created_at,
          user:users!user_id (
            id,
            name,
            email,
            wallet_address
          ),
          group:groups!group_id (
            id,
            name,
            icon
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("[MEMBERS PAGE] Error fetching members:", error);
        throw error;
      }
      
      console.log("[MEMBERS PAGE] Fetched members:", data);
      return data;
    }
  });

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Crown className="h-4 w-4 text-yellow-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'organizer';
    return role;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading all members...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Failed to load members. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const groupedMembers = members?.reduce((acc, member) => {
    const groupName = member.group?.name || 'Unknown Group';
    if (!acc[groupName]) {
      acc[groupName] = {
        group: member.group,
        members: []
      };
    }
    acc[groupName].members.push(member);
    return acc;
  }, {} as Record<string, { group: any; members: any[] }>);

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">All Members</h1>
            <p className="text-muted-foreground">
              View all members across your groups ({members?.length || 0} total)
            </p>
          </div>
        </div>

        {!members || members.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground text-center">
                No members have been added to any groups yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMembers || {}).map(([groupName, { group, members: groupMembers }]) => (
              <motion.div
                key={groupName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">{group?.icon || '🏠'}</span>
                      <div>
                        <h3 className="text-xl">{groupName}</h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          {groupMembers.length} {groupMembers.length === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupMembers.map((member) => (
                        <Card key={member.id} className="p-4 bg-muted/30">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                                <AvatarFallback>
                                  {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              {member.role === 'admin' && (
                                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                                  <Crown className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {member.user?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.user?.email || 'No email'}
                              </p>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(member.role)}
                                <Badge 
                                  variant={getRoleBadgeVariant(member.role)} 
                                  className="text-xs"
                                >
                                  {getRoleLabel(member.role)}
                                </Badge>
                              </div>
                              {member.user?.wallet_address && (
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-muted-foreground">Wallet connected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Members;
