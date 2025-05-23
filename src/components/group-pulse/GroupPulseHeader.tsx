
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartPie } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroupPulseHeaderProps {
  groupName?: string;
  activeTab: "group" | "all";
  onTabChange: (value: "group" | "all") => void;
}

export const GroupPulseHeader = ({ 
  groupName, 
  activeTab, 
  onTabChange 
}: GroupPulseHeaderProps) => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <ChartPie className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Group Pulse{groupName ? ` - ${groupName}` : ''}</CardTitle>
            <CardDescription>Analytics and financial insights</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "group" | "all")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="group">Current Group</TabsTrigger>
            <TabsTrigger value="all">All Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="group" className="pt-4">
            <p className="text-muted-foreground">
              View analytics and insights for this specific group. Monitor pot balance, expenses, and member activity.
            </p>
          </TabsContent>
          
          <TabsContent value="all" className="pt-4">
            <p className="text-muted-foreground">
              View cross-group analytics and insights. Compare financial health and activity across all your groups.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
