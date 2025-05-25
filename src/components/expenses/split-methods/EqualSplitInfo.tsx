
import React from "react";
import { Check } from "lucide-react";
import { formatAmount } from "@/utils/money";

interface EqualSplitInfoProps {
  totalAmount: number;
  activeUserCount: number;
}

const EqualSplitInfo: React.FC<EqualSplitInfoProps> = ({ totalAmount, activeUserCount }) => {
  if (activeUserCount === 0 || totalAmount <= 0) return null;
  
  return (
    <div className="text-sm text-green-600 flex items-center mt-2">
      <Check className="h-4 w-4 mr-2" />
      Each person will pay {formatAmount(totalAmount / activeUserCount)}
    </div>
  );
};

export default EqualSplitInfo;
