
import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { GroupPulse as GroupPulseComponent } from "@/components/group-pulse/GroupPulse";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowLeft, ChartPie } from "lucide-react";
import { useAuth } from "@/contexts";
import { useGroupsList } from "@/hooks/useGroupsList";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroupDetails } from "@/hooks/useGroupDetails";

const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000002';

const GroupPulsePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading } = useGroupsList();
  const { id } = useParams<{ id?: string }>();
  const { group } = useGroupDetails(id || "", user);
  const [activeTab, setActiveTab] = useState<"group" | "all">("group");
  
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
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };
  
  const handleGroupChange = (selectedGroupId: string) => {
    navigate(`/group-pulse/${selectedGroupId}`);
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
                <ChartPie className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Group Pulse</CardTitle>
                  <CardDescription>Group analytics and metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any groups yet. Create a group to use the Group Pulse feature.</p>
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
                <ChartPie className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Group Pulse</CardTitle>
                  <CardDescription>Please select a group to view Pulse details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-6">
                <p className="text-muted-foreground mb-4">Select a group to view analytics and insights:</p>
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
            <ChartPie className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">
                Group Pulse – {activeTab === "all" ? "All Groups" : group?.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {activeTab === "group" && (
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
                )}
              </div>
              <p className="text-muted-foreground mt-2">
                View analytics and insights for your group or compare financial activity across all your groups.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/group/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Group
          </Button>
        </div>
        {id && <GroupPulseComponent 
          groupId={id} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />}
      </motion.div>
    </AppLayout>
  );
};

export default GroupPulsePage;
