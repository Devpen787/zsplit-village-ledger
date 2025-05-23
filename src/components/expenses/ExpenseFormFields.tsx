
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ExpenseUser } from "@/types/expenses";

interface ExpenseFormFieldsProps {
  form: any;
  users?: ExpenseUser[];
  onSplitMethodChange?: (method: string) => void;
}

const splitMethods = [
  { id: "equal", label: "Equal split" },
  { id: "amount", label: "Custom amounts" },
  { id: "percentage", label: "Percentage split" },
];

const ExpenseFormFields: React.FC<ExpenseFormFieldsProps> = ({ 
  form, 
  users = [],
  onSplitMethodChange
}) => {
  const [localSplitMethod, setLocalSplitMethod] = React.useState("equal");
  
  const handleSplitMethodChange = (value: string) => {
    setLocalSplitMethod(value);
    if (onSplitMethodChange) {
      onSplitMethodChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title field */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Expense title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Amount field */}
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0.00" 
                step="0.01" 
                min="0"
                {...field} 
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Paid By field */}
      <FormField
        control={form.control}
        name="paidBy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paid By</FormLabel>
            <FormControl>
              <select 
                className="w-full border border-input bg-background px-3 py-2 rounded-md"
                {...field}
              >
                <option value="">Select who paid</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.name || user.email}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Split Method selector */}
      <div className="space-y-2">
        <FormLabel>Split Method</FormLabel>
        <RadioGroup 
          value={localSplitMethod} 
          onValueChange={handleSplitMethodChange}
          className="mt-2"
        >
          {splitMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-2">
              <RadioGroupItem value={method.id} id={`method-${method.id}`} />
              <Label htmlFor={`method-${method.id}`}>{method.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Notes field */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add any additional information" 
                className="resize-none"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ExpenseFormFields;
