
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Equal, Percent, Divide, Plus, Minus, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isValid, setIsValid] = useState(true);

  // Initialize or reset split data when users or split method changes
  useEffect(() => {
    if (users.length > 0) {
      const initialData = users.map(user => {
        const baseData = { userId: user.id };
        
        switch (splitMethod) {
          case 'equal':
            return {
              ...baseData,
              amount: calculateEqualSplit(users.length),
              percentage: 100 / users.length,
              shares: 1,
            };
          case 'amount':
            return { ...baseData, amount: 0 };
          case 'percentage':
            return { ...baseData, percentage: 0 };
          case 'shares':
            return { ...baseData, shares: 1 };
          default:
            return baseData;
        }
      });
      
      setSplitData(initialData);
      validateSplitData(initialData, splitMethod);
    }
  }, [users, splitMethod, totalAmount]);

  // Validate and update parent component when split data changes
  useEffect(() => {
    if (splitData.length > 0) {
      const isDataValid = validateSplitData(splitData, splitMethod);
      
      if (isDataValid) {
        onSplitDataChange(splitData);
      }
    }
  }, [splitData, totalAmount]);

  const calculateEqualSplit = (numUsers: number): number => {
    if (numUsers === 0 || !totalAmount) return 0;
    return parseFloat((totalAmount / numUsers).toFixed(2));
  };

  const validateSplitData = (data: UserSplitData[], method: string): boolean => {
    if (!totalAmount || totalAmount <= 0) {
      setValidationError("Please enter a valid total amount");
      setIsValid(false);
      return false;
    }

    if (method === "amount") {
      const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      if (Math.abs(total - totalAmount) > 0.01) {
        setValidationError(`Total must equal ${totalAmount.toFixed(2)}. Current total: ${total.toFixed(2)}`);
        setIsValid(false);
        return false;
      }
    } else if (method === "percentage") {
      const total = data.reduce((sum, item) => sum + (item.percentage || 0), 0);
      
      if (Math.abs(total - 100) > 0.01) {
        setValidationError(`Percentages must sum to 100%. Current total: ${total.toFixed(1)}%`);
        setIsValid(false);
        return false;
      }
    }

    setValidationError(null);
    setIsValid(true);
    return true;
  };

  const handleInputChange = (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => {
    const numValue = parseFloat(value) || 0;
    
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, [field]: numValue } 
        : item
    );
    
    setSplitData(newSplitData);
    validateSplitData(newSplitData, splitMethod);
  };

  const adjustShares = (userId: string, adjustment: number) => {
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, shares: Math.max(1, (item.shares || 1) + adjustment) } 
        : item
    );
    
    setSplitData(newSplitData);
    validateSplitData(newSplitData, splitMethod);
  };

  const getCalculatedAmount = (userData: UserSplitData): number => {
    switch (splitMethod) {
      case "equal":
        return calculateEqualSplit(users.length);
      case "percentage":
        return parseFloat(((userData.percentage || 0) * totalAmount / 100).toFixed(2));
      case "shares":
        const totalShares = splitData.reduce((sum, item) => sum + (item.shares || 0), 0);
        if (totalShares === 0) return 0;
        return parseFloat(((userData.shares || 0) / totalShares * totalAmount).toFixed(2));
      default:
        return userData.amount || 0;
    }
  };

  const getTotalShares = (): number => {
    return splitData.reduce((sum, item) => sum + (item.shares || 0), 0);
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || user?.email || "User";
  };

  const renderSplitInputs = () => {
    switch (splitMethod) {
      case "equal":
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              <div className="text-sm text-green-600 mb-4 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Each person will pay {calculateEqualSplit(users.length).toFixed(2)}
              </div>
              
              {splitData.map((data) => {
                const userName = getUserName(data.userId);
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <div className="w-1/2">
                      {userName} pays:
                    </div>
                    <div className="w-1/2 text-right font-medium">
                      {calculateEqualSplit(users.length).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      
      case "amount":
        const amountTotal = splitData.reduce((sum, item) => sum + (item.amount || 0), 0);
        const amountDiff = totalAmount - amountTotal;
        
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              <div className={cn(
                "text-sm mb-4 flex items-center",
                Math.abs(amountDiff) < 0.01 ? "text-green-600" : "text-amber-600"
              )}>
                {Math.abs(amountDiff) < 0.01 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Amounts add up correctly
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {amountDiff > 0 ? `${amountDiff.toFixed(2)} left to assign` : `Exceeds total by ${Math.abs(amountDiff).toFixed(2)}`}
                  </>
                )}
              </div>
              
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
                      className={cn(
                        "w-2/3",
                        data.userId === paidBy ? "border-green-400" : ""
                      )}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      
      case "percentage":
        const percentageTotal = splitData.reduce((sum, item) => sum + (item.percentage || 0), 0);
        const percentageDiff = 100 - percentageTotal;
        
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              <div className={cn(
                "text-sm mb-4 flex items-center",
                Math.abs(percentageDiff) < 0.01 ? "text-green-600" : "text-amber-600"
              )}>
                {Math.abs(percentageDiff) < 0.01 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Percentages add up to 100%
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {percentageDiff > 0 ? `${percentageDiff.toFixed(1)}% left to assign` : `Exceeds 100% by ${Math.abs(percentageDiff).toFixed(1)}%`}
                  </>
                )}
              </div>
              
              {splitData.map((data) => {
                const user = users.find(u => u.id === data.userId);
                const calculatedAmount = getCalculatedAmount(data);
                
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <Label htmlFor={`percentage-${data.userId}`} className="w-1/3">
                      {user?.name || user?.email}
                    </Label>
                    <div className="flex items-center w-2/3">
                      <div className="flex-1 flex items-center">
                        <Input
                          id={`percentage-${data.userId}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={data.percentage || ""}
                          onChange={(e) => handleInputChange(data.userId, e.target.value, 'percentage')}
                          className={cn(
                            "flex-1",
                            data.userId === paidBy ? "border-green-400" : ""
                          )}
                        />
                        <span className="ml-2 mr-3">%</span>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        = {calculatedAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      
      case "shares":
        const totalShares = getTotalShares();
        
        return (
          <Card className="mt-4">
            <CardContent className="pt-4 pb-2">
              <div className="text-sm text-muted-foreground mb-4">
                Total parts: {totalShares}
              </div>
              
              {splitData.map((data) => {
                const user = users.find(u => u.id === data.userId);
                const calculatedAmount = getCalculatedAmount(data);
                
                return (
                  <div key={data.userId} className="flex items-center justify-between mb-3">
                    <Label htmlFor={`shares-${data.userId}`} className="w-1/3">
                      {user?.name || user?.email}
                    </Label>
                    <div className="flex items-center w-2/3">
                      <div className="flex-1 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustShares(data.userId, -1)}
                          disabled={(data.shares || 0) <= 1}
                          className="mr-2 px-2"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          id={`shares-${data.userId}`}
                          type="number"
                          min="1"
                          value={data.shares || ""}
                          onChange={(e) => handleInputChange(data.userId, e.target.value, 'shares')}
                          className={cn(
                            "flex-1 mx-1 text-center",
                            data.userId === paidBy ? "border-green-400" : ""
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustShares(data.userId, 1)}
                          className="ml-2 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground ml-3 whitespace-nowrap">
                        = {calculatedAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
    }
  };

  const renderSummary = () => {
    if (!totalAmount || totalAmount <= 0) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
        <div className="text-sm space-y-1">
          {splitData.map((data) => {
            const userName = getUserName(data.userId);
            const amount = getCalculatedAmount(data);
            
            return (
              <div key={data.userId} className="flex justify-between">
                <span className={data.userId === paidBy ? "font-medium text-green-600" : ""}>
                  {userName} {data.userId === paidBy ? "(paid)" : "pays"}
                </span>
                <span>{amount.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {renderSplitInputs()}
      {renderSummary()}
    </div>
  );
};

export default ExpenseSplitMethodFields;
