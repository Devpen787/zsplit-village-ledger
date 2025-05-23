
import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { GroupPot as GroupPotComponent } from "@/components/group-pot/GroupPot";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowLeft, PiggyBank, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts";
import { useGroupsList } from "@/hooks/useGroupsList";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroupDetails } from "@/hooks/useGroupDetails";

const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000002';

const GroupPotPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading } = useGroupsList();
  const { id } = useParams<{ id?: string }>();
  const { group } = useGroupDetails(id || "", user);
  
  // If no specific group ID is provided, redirect to the default group or first available group
  useEffect(() => {
    if (!id && !loading) {
      if (groups.some(group => group.id === DEFAULT_GROUP_ID)) {
        navigate(`/group-pot/${DEFAULT_GROUP_ID}`);
      } else if (groups.length > 0) {
        navigate(`/group-pot/${groups[0].id}`);
      }
    }
  }, [id, groups, loading, navigate]);
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };
  
  const handleGroupChange = (selectedGroupId: string) => {
    navigate(`/group-pot/${selectedGroupId}`);
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading group data...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!id && groups.length === 0) {
    return (
      <AppLayout>
        <motion.div
          className="container mx-auto py-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <PiggyBank className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Group Pot</CardTitle>
                  <CardDescription>Manage group funds and contributions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any groups yet. Create a group to use the Group Pot feature.</p>
                <Button onClick={() => navigate('/group')} className="mt-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Groups
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }
  
  if (!id) {
    return (
      <AppLayout>
        <motion.div
          className="container mx-auto py-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <PiggyBank className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Group Pot</CardTitle>
                  <CardDescription>Please select a group to view Pot details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-6">
                <p className="text-muted-foreground mb-4">Select a group to manage funds and contributions:</p>
                <Select onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <motion.div
        className="container mx-auto py-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">Viewing Group Pot for:</h1>
              <div className="flex items-center gap-2 mt-1">
                <Select value={id} onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue>{group?.name || "Loading..."}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/group/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Group
          </Button>
        </div>
        {id && <GroupPotComponent groupId={id} />}
      </motion.div>
    </AppLayout>
  );
};

export default GroupPotPage;
