import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserX, Users } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { formatUserName } from "@/utils/userFormatUtils";

interface Participant {
  id: string;
  name?: string | null;
  email: string | null;
  display_name?: string | null;
  group_id?: string | null;
  group?: string;
}

interface UnifiedParticipantTableProps {
  participants: Participant[];
  selectedParticipantIds: string[];
  onSelectionChange: (ids: string[]) => void;
  totalAmount: number;
  splitMethod: 'equal' | 'custom' | 'percentage';
  paidById?: string;
}

export const UnifiedParticipantTable: React.FC<UnifiedParticipantTableProps> = ({
  participants,
  selectedParticipantIds,
  onSelectionChange,
  totalAmount,
  splitMethod,
  paidById
}) => {
  // Group handling
  const [availableGroups, setAvailableGroups] = useState<Record<string, string>>({});
  
  // Custom amounts and percentages
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({});
  
  // Extract available groups from participants
  useEffect(() => {
    const groups: Record<string, string> = {};
    participants.forEach(participant => {
      if (participant.group_id) {
        groups[participant.group_id] = participant.group || participant.group_id;
      }
    });
    setAvailableGroups(groups);
  }, [participants]);
  
  // Initialize custom amounts/percentages when selection changes
  useEffect(() => {
    if (selectedParticipantIds.length > 0) {
      // Equal split for initial values
      const equalAmount = totalAmount / selectedParticipantIds.length;
      const equalPercentage = 100 / selectedParticipantIds.length;
      
      const newAmounts: Record<string, number> = {};
      const newPercentages: Record<string, number> = {};
      
      selectedParticipantIds.forEach(id => {
        newAmounts[id] = equalAmount;
        newPercentages[id] = equalPercentage;
      });
      
      setCustomAmounts(newAmounts);
      setCustomPercentages(newPercentages);
    }
  }, [selectedParticipantIds, totalAmount]);

  // Selection handlers
  const handleSelectAll = () => {
    onSelectionChange(participants.map(p => p.id));
    toast.success("Selected all participants");
  };

  const handleDeselectAll = () => {
    // Keep the payer selected if one exists
    if (paidById) {
      onSelectionChange([paidById]);
    } else {
      onSelectionChange([]);
    }
    toast.success("Deselected all participants");
  };

  const handleSelectGroup = (groupId: string) => {
    if (!groupId) return;

    const groupMembers = participants
      .filter(p => p.group_id === groupId)
      .map(p => p.id);
    
    // Include the payer if they exist
    const selection = paidById ? 
      Array.from(new Set([...groupMembers, paidById])) : 
      groupMembers;
    
    onSelectionChange(selection);
    toast.success(`Selected members of group ${groupId.substring(0, 8)}`);
  };

  const toggleParticipant = (id: string) => {
    let newSelection: string[];
    
    if (selectedParticipantIds.includes(id)) {
      // Don't allow deselecting the payer
      if (id === paidById) return;
      newSelection = selectedParticipantIds.filter(pid => pid !== id);
    } else {
      newSelection = [...selectedParticipantIds, id];
    }
    
    onSelectionChange(newSelection);
    recalculateSplits(newSelection);
  };
  
  // Recalculate splits when selection changes
  const recalculateSplits = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    // Equal split
    const equalAmount = totalAmount / selectedIds.length;
    const equalPercentage = 100 / selectedIds.length;
    
    const newAmounts: Record<string, number> = {};
    const newPercentages: Record<string, number> = {};
    
    selectedIds.forEach(id => {
      newAmounts[id] = equalAmount;
      newPercentages[id] = equalPercentage;
    });
    
    setCustomAmounts(newAmounts);
    setCustomPercentages(newPercentages);
  };
  
  // Handle custom amount changes
  const handleCustomAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAmounts(prev => ({
      ...prev,
      [id]: numValue
    }));
  };
  
  // Handle percentage changes
  const handlePercentageChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomPercentages(prev => ({
      ...prev,
      [id]: numValue
    }));
  };
  
  // Calculate total for validation
  const calculateCustomTotal = (): number => {
    return selectedParticipantIds.reduce((sum, id) => sum + (customAmounts[id] || 0), 0);
  };
  
  const calculatePercentageTotal = (): number => {
    return selectedParticipantIds.reduce((sum, id) => sum + (customPercentages[id] || 0), 0);
  };
  
  // Get calculated amount for a participant
  const getParticipantAmount = (participantId: string): number => {
    if (!selectedParticipantIds.includes(participantId)) return 0;
    
    switch(splitMethod) {
      case 'equal':
        return totalAmount / selectedParticipantIds.length;
      case 'custom':
        return customAmounts[participantId] || 0;
      case 'percentage':
        const percentage = customPercentages[participantId] || 0;
        return (percentage / 100) * totalAmount;
      default:
        return 0;
    }
  };
  
  // Helper to get display name
  const getDisplayName = (participant: Participant): string => {
    return formatUserName(participant);
  };
  
  // Determine if the split is valid
  const isSplitValid = (): boolean => {
    if (splitMethod === 'custom') {
      const customTotal = calculateCustomTotal();
      return Math.abs(customTotal - totalAmount) < 0.01;
    }
    
    if (splitMethod === 'percentage') {
      const percentageTotal = calculatePercentageTotal();
      return Math.abs(percentageTotal - 100) < 0.01;
    }
    
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={handleSelectAll}
          className="flex items-center"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Select All
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={handleDeselectAll}
          className="flex items-center"
        >
          <UserX className="h-4 w-4 mr-1" />
          Deselect All
        </Button>
        
        {Object.keys(availableGroups).length > 0 && (
          <Select onValueChange={handleSelectGroup}>
            <SelectTrigger className="h-9 w-auto max-w-[200px]">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Select Group" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(availableGroups).map(groupId => (
                <SelectItem key={groupId} value={groupId}>
                  {availableGroups[groupId] || `Group ${groupId.substring(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary info for custom splits */}
      {splitMethod === 'custom' && (
        <div className={`text-sm ${isSplitValid() ? 'text-green-600' : 'text-red-500'} mb-2`}>
          {isSplitValid() 
            ? 'All amounts are correctly assigned'
            : `Total doesn't match: $${calculateCustomTotal().toFixed(2)} / $${totalAmount.toFixed(2)}`}
        </div>
      )}
      
      {splitMethod === 'percentage' && (
        <div className={`text-sm ${isSplitValid() ? 'text-green-600' : 'text-red-500'} mb-2`}>
          {isSplitValid() 
            ? 'All percentages add up to 100%'
            : `Total percentage: ${calculatePercentageTotal().toFixed(1)}% / 100%`}
        </div>
      )}
      
      {/* Participants Table */}
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Name</TableHead>
                {splitMethod !== 'equal' && <TableHead>Assignment</TableHead>}
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => {
                const isSelected = selectedParticipantIds.includes(participant.id);
                const isPayer = participant.id === paidById;
                const amount = getParticipantAmount(participant.id);
                
                return (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleParticipant(participant.id)}
                        disabled={isPayer} // Can't deselect the payer
                        className={isPayer ? "border-green-500" : ""}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={isPayer ? "font-medium text-green-600" : ""}>
                          {getDisplayName(participant)}
                          {isPayer && " (Payer)"}
                        </span>
                        {participant.email && (
                          <span className="text-xs text-gray-500">{participant.email}</span>
                        )}
                      </div>
                    </TableCell>
                    
                    {splitMethod === 'custom' && (
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            value={isSelected ? customAmounts[participant.id] || 0 : 0}
                            onChange={(e) => handleCustomAmountChange(participant.id, e.target.value)}
                            disabled={!isSelected}
                            step="0.01"
                            min="0"
                            className="w-24"
                          />
                        </div>
                      </TableCell>
                    )}
                    
                    {splitMethod === 'percentage' && (
                      <TableCell>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={isSelected ? customPercentages[participant.id] || 0 : 0}
                            onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                            disabled={!isSelected}
                            step="0.1"
                            min="0"
                            max="100"
                            className="w-20"
                          />
                          <span className="ml-2">%</span>
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell className="text-right">
                      ${isSelected ? amount.toFixed(2) : '0.00'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {participants.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No participants available
            </div>
          )}
          
          {participants.length > 0 && selectedParticipantIds.length === 0 && (
            <div className="text-center py-4 text-amber-500">
              Please select at least one participant
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
