
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Group } from '@/types/supabase';

interface GroupCardProps {
  group: Group;
  canDelete: boolean;
  onSelect: (groupId: string) => void;
  onDeleteClick: (group: Group, event: React.MouseEvent) => void;
}

export const GroupCard = ({ group, canDelete, onSelect, onDeleteClick }: GroupCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/20 transition-colors relative"
      onClick={() => onSelect(group.id)}
      role="button"
      aria-label={`View details for group ${group.name}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-3xl">{group.icon}</div>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => onDeleteClick(group, e)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <h3 className="font-medium text-lg mb-1">{group.name}</h3>
        <p className="text-sm text-muted-foreground">
          Created {new Date(group.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
