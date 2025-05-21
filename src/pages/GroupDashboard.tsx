
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Receipt, CreditCard, Calendar } from "lucide-react";

const GroupDashboard = () => {
  const { user } = useAuth();
  
  const { data: groupMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['groupMembers', user?.group_name],
    queryFn: async () => {
      if (!user?.group_name) return [];
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('group_name', user.group_name);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.group_name,
  });
  
  // Mock data for now, would be replaced with actual queries in a real app
  const stats = [
    { name: "Total Expenses", value: "$0.00", icon: Receipt, color: "text-blue-500" },
    { name: "Average per Member", value: "$0.00", icon: Users, color: "text-green-500" },
    { name: "This Month", value: "$0.00", icon: Calendar, color: "text-purple-500" },
    { name: "Balances Due", value: "$0.00", icon: CreditCard, color: "text-red-500" },
  ];
  
  if (!user?.group_name) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">No Group Assigned</h2>
          <p className="text-muted-foreground">
            Update your profile to join or create a group.
          </p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.group_name} Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your group's expenses and activities.
          </p>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`p-2 rounded-full ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Group members */}
        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>People in your group sharing expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {groupMembers?.length ? (
                  groupMembers.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No other members in this group yet.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for future food tracker integration */}
        <Card>
          <CardHeader>
            <CardTitle>Food Tracker</CardTitle>
            <CardDescription>Coming soon! Track grocery expenses and meal planning.</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            Food tracking functionality will be implemented soon.
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GroupDashboard;
