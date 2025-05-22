
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Equal, Percent, Divide } from "lucide-react";

type User = {
  id: string;
  name?: string | null;
  email: string | null;
};

interface UserSplitData {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

interface ExpenseSplitMethodFieldsProps {
  users: User[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
}

const splitMethods = [
  { id: "equal", label: "Equal split", icon: Equal },
  { id: "amount", label: "Split by amounts", icon: null },
  { id: "percentage", label: "Percentage-based split", icon: Percent },
  { id: "shares", label: "Share-based split", icon: Divide },
];

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
}) => {
  const [splitData, setSplitData] = useState<UserSplitData[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize or reset split data when users or split method changes
  useEffect(() => {
    if (users.length > 0) {
      const initialData = users.map(user => ({
        userId: user.id,
        amount: splitMethod === "equal" ? calculateEqualSplit(users.length) : 0,
        percentage: splitMethod === "equal" ? 100 / users.length : 0,
        shares: 1,
      }));
      setSplitData(initialData);
    }
  }, [users, splitMethod]);

  // Validate and update parent component when split data changes
  useEffect(() => {
    if (splitData.length > 0) {
      validateSplitData();
      onSplitDataChange(splitData);
    }
  }, [splitData, totalAmount]);

  const calculateEqualSplit = (numUsers: number): number => {
    if (numUsers === 0 || !totalAmount) return 0;
    return totalAmount / numUsers;
  };

  const validateSplitData = () => {
    if (!totalAmount || totalAmount <= 0) {
      setValidationError("Please enter a valid total amount");
      return;
    }

    if (splitMethod === "amount") {
      const total = splitData.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (Math.abs(total - totalAmount) > 0.01) {
        setValidationError(`Amounts must sum to ${totalAmount.toFixed(2)}`);
        return;
      }
    } else if (splitMethod === "percentage") {
      const total = splitData.reduce((sum, item) => sum + (item.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        setValidationError("Percentages must sum to 100%");
        return;
      }
    }

    setValidationError(null);
  };

  const handleInputChange = (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => {
    const numValue = parseFloat(value) || 0;
    
    setSplitData(prevData => 
      prevData.map(item => 
        item.userId === userId 
          ? { ...item, [field]: numValue } 
          : item
      )
    );
  };

  const renderSplitInputs = () => {
    switch (splitMethod) {
      case "equal":
        return (
          <div className="text-sm text-muted-foreground mt-2">
            Each person will pay {calculateEqualSplit(users.length).toFixed(2)}
          </div>
        );
      
      case "amount":
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              {splitData.map((data) => {
                const user = users.find(u => u.id === data.userId);
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <Label htmlFor={`amount-${data.userId}`} className="w-1/3">
                      {user?.name || user?.email}
                    </Label>
                    <Input
                      id={`amount-${data.userId}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.amount || ""}
                      onChange={(e) => handleInputChange(data.userId, e.target.value, 'amount')}
                      className="w-2/3"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      
      case "percentage":
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              {splitData.map((data) => {
                const user = users.find(u => u.id === data.userId);
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <Label htmlFor={`percentage-${data.userId}`} className="w-1/3">
                      {user?.name || user?.email}
                    </Label>
                    <div className="flex items-center w-2/3">
                      <Input
                        id={`percentage-${data.userId}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={data.percentage || ""}
                        onChange={(e) => handleInputChange(data.userId, e.target.value, 'percentage')}
                        className="flex-1"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      
      case "shares":
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              {splitData.map((data) => {
                const user = users.find(u => u.id === data.userId);
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <Label htmlFor={`shares-${data.userId}`} className="w-1/3">
                      {user?.name || user?.email}
                    </Label>
                    <div className="flex items-center w-2/3">
                      <Input
                        id={`shares-${data.userId}`}
                        type="number"
                        step="0.5"
                        min="0"
                        value={data.shares || ""}
                        onChange={(e) => handleInputChange(data.userId, e.target.value, 'shares')}
                        className="flex-1"
                      />
                      <span className="ml-2">parts</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Split Method</Label>
        <RadioGroup value={splitMethod} onValueChange={setSplitMethod} className="mt-2">
          {splitMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-2">
              <RadioGroupItem value={method.id} id={`method-${method.id}`} />
              <Label htmlFor={`method-${method.id}`} className="flex items-center">
                {method.icon && <method.icon className="mr-2 h-4 w-4" />}
                {method.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {renderSplitInputs()}
    </div>
  );
};

export default ExpenseSplitMethodFields;
