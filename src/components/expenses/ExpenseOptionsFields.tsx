
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const visibilityOptions = [
  { id: "private", label: "Private (only me)" },
  { id: "group", label: "Group (participants only)" },
  { id: "public", label: "Public (anyone in the village)" },
];

const splitMethods = [
  { id: "equal", label: "Equal split" },
  { id: "percentage", label: "Percentage-based split" },
  { id: "custom", label: "Share-based split (e.g. 2x or 0.5x shares)" },
];

interface ExpenseOptionsFieldsProps {
  visibility: string;
  setVisibility: (value: string) => void;
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const ExpenseOptionsFields: React.FC<ExpenseOptionsFieldsProps> = ({
  visibility,
  setVisibility,
  splitMethod,
  setSplitMethod,
  notes,
  setNotes,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Visibility</Label>
        <RadioGroup value={visibility} onValueChange={setVisibility}>
          {visibilityOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`visibility-${option.id}`} />
              <Label htmlFor={`visibility-${option.id}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Split Method</Label>
        <RadioGroup value={splitMethod} onValueChange={setSplitMethod}>
          {splitMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-2">
              <RadioGroupItem value={method.id} id={`method-${method.id}`} />
              <Label htmlFor={`method-${method.id}`}>{method.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </>
  );
};

export default ExpenseOptionsFields;
