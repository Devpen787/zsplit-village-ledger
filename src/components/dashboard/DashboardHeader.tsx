
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DashboardHeaderProps = {
  onCreateGroup: () => void;
};

export const DashboardHeader = ({ onCreateGroup }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onCreateGroup}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start a new group to split expenses with friends</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
