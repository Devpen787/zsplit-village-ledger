
import React, { useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { GroupPot as GroupPotComponent } from "@/components/group-pot/GroupPot";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts";
import { useGroupsList } from "@/hooks/useGroupsList";

const GroupPotPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading } = useGroupsList();
  const { id } = useParams<{ id?: string }>();
  
  // If no specific group ID is provided, redirect to the first available group
  useEffect(() => {
    if (!id && !loading && groups.length > 0) {
      navigate(`/group-pot/${groups[0].id}`);
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
            <CardTitle>Group Pot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You don't have any groups yet. Create a group to use the Group Pot feature.</p>
            <Button onClick={() => navigate('/group')}>Go to Groups</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Group Pot</h1>
        {id && <GroupPotComponent groupId={id} />}
      </div>
    </AppLayout>
  );
};

export default GroupPotPage;
