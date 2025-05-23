
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Settings, Wallet, ChartPie } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface GroupHeaderProps {
  groupName: string;
  groupIcon: string;
  isAdmin: boolean;
  onCreateExpense: () => void;
}

export const GroupHeader = ({ groupName, groupIcon, isAdmin, onCreateExpense }: GroupHeaderProps) => {
  const navigate = useNavigate();
  const groupId = window.location.pathname.split('/').pop();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-2xl shadow-sm">
          {groupIcon}
        </div>
        <h1 className="text-2xl font-semibold">{groupName}</h1>
      </div>
      
      <div className="flex space-x-2 w-full sm:w-auto justify-end">
        <TooltipProvider>
          <div className="hidden sm:flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/group-pot/${groupId}`)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Group Pot
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage group funds</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/group-pulse/${groupId}`)}
                >
                  <ChartPie className="h-4 w-4 mr-2" />
                  Group Pulse
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View group analytics</p>
              </TooltipContent>
            </Tooltip>
            
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage group settings</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Mobile dropdown menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Group Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/group-pot/${groupId}`)}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Group Pot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/group-pulse/${groupId}`)}>
                  <ChartPie className="h-4 w-4 mr-2" />
                  Group Pulse
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
        
        <Button onClick={onCreateExpense} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
};
