
import React from "react";
import { Check } from "lucide-react";
import { UserSplitData } from "@/types/expenses";
import { formatAmount } from "@/utils/money";

interface EqualSplitProps {
  splitData: UserSplitData[];
  totalAmount: number;
  users: Array<{ id: string; name?: string | null; email: string | null }>;
}

const EqualSplit: React.FC<EqualSplitProps> = ({ splitData, totalAmount, users }) => {
  const calculateEqualSplit = (): number => {
    if (users.length === 0 || !totalAmount) return 0;
    return parseFloat((totalAmount / users.length).toFixed(2));
  };

  return (
    <div className="text-sm text-green-600 flex items-center">
      <Check className="h-4 w-4 mr-2" />
      Each person will pay {formatAmount(calculateEqualSplit())}
    </div>
  );
};

export default EqualSplit;
