
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Equal, Percent, Divide } from "lucide-react";

const splitMethods = [
  { id: "equal", label: "Equal split", icon: Equal },
  { id: "amount", label: "Split by amounts", icon: null },
  { id: "percentage", label: "Percentage-based split", icon: Percent },
  { id: "shares", label: "Share-based split", icon: Divide },
];

interface SplitMethodSelectorProps {
  splitMethod: string;
  setSplitMethod: (value: string) => void;
}

const SplitMethodSelector: React.FC<SplitMethodSelectorProps> = ({
  splitMethod,
  setSplitMethod,
}) => {
  return (
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
  );
};

export default SplitMethodSelector;
