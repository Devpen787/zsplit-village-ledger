
import React from "react";
import { UserSplitData } from "@/types/expenses";
import { Card, CardContent } from "@/components/ui/card";
import SplitSummary from "./SplitSummary";
import EqualSplitInfo from "./EqualSplitInfo";
import SplitSummaryCollapsible from "./SplitSummaryCollapsible";

interface SplitSummarySectionProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  selectedUsers: Record<string, boolean>;
  activeUserCount: number;
  splitMethod: string;
  isSummaryOpen: boolean;
  setIsSummaryOpen: (isOpen: boolean) => void;
  getUserName: (userData: UserSplitData) => string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  toggleUser: (userId: string) => void;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
}

const SplitSummarySection: React.FC<SplitSummarySectionProps> = ({
  splitData,
  totalAmount,
  paidBy,
  selectedUsers,
  activeUserCount,
  splitMethod,
  isSummaryOpen,
  setIsSummaryOpen,
  getUserName,
  getCalculatedAmount,
  toggleUser,
  handleInputChange,
  adjustShares
}) => {
  return (
    <>
      {/* Split Summary Table */}
      <Card>
        <CardContent className="pt-4 pb-2 overflow-x-auto">
          <SplitSummary
            splitData={splitData}
            totalAmount={totalAmount}
            paidBy={paidBy}
            getCalculatedAmount={getCalculatedAmount}
            getUserName={getUserName}
            splitMethod={splitMethod}
            selectedUsers={selectedUsers}
            toggleUser={toggleUser}
            onInputChange={handleInputChange}
            adjustShares={adjustShares}
          />
        </CardContent>
      </Card>
      
      {/* Equal split info displayed directly */}
      <EqualSplitInfo 
        totalAmount={totalAmount} 
        activeUserCount={activeUserCount} 
      />
      
      {/* Collapsible Summary - only show if we have a valid amount */}
      {totalAmount > 0 && activeUserCount > 0 && splitMethod !== "equal" && (
        <SplitSummaryCollapsible
          isOpen={isSummaryOpen}
          setIsOpen={setIsSummaryOpen}
          splitData={splitData}
          selectedUsers={selectedUsers}
          getUserName={getUserName}
          getCalculatedAmount={getCalculatedAmount}
        />
      )}
    </>
  );
};

export default SplitSummarySection;
