
import React, { useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { GroupPulse as GroupPulseComponent } from "@/components/group-pulse/GroupPulse";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts";
import { useGroupsList } from "@/hooks/useGroupsList";

const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000002';

const GroupPulsePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading } = useGroupsList();
  const { id } = useParams<{ id?: string }>();
  
  // If no specific group ID is provided, redirect to the default group or first available group
  useEffect(() => {
    if (!id && !loading) {
      if (groups.some(group => group.id === DEFAULT_GROUP_ID)) {
        navigate(`/group-pulse/${DEFAULT_GROUP_ID}`);
      } else if (groups.length > 0) {
        navigate(`/group-pulse/${groups[0].id}`);
      }
    }
  }, [id, groups, loading, navigate]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!id && groups.length === 0) {
    return (
      <AppLayout>
        <Card>
          <CardHeader>
            <CardTitle>Group Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You don't have any groups yet. Create a group to use the Group Pulse feature.</p>
            <Button onClick={() => navigate('/group')}>Go to Groups</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Group Pulse</h1>
        {id && <GroupPulseComponent groupId={id} />}
      </div>
    </AppLayout>
  );
};

export default GroupPulsePage;
