
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ExpenseFormValues } from '@/hooks/useExpenseForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { Bitcoin, DollarSign, Euro, PoundSterling, IndianRupee, JapaneseYen, SwissFranc } from "lucide-react";

interface ExpenseBasicFieldsProps {
  form: UseFormReturn<ExpenseFormValues>;
}

const ExpenseBasicFields: React.FC<ExpenseBasicFieldsProps> = ({ form }) => {
  return (
    <>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  type="number"
                  {...field}
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="USD">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>USD</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EUR">
                    <div className="flex items-center">
                      <Euro className="mr-2 h-4 w-4" />
                      <span>EUR</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="GBP">
                    <div className="flex items-center">
                      <PoundSterling className="mr-2 h-4 w-4" />
                      <span>GBP</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CHF">
                    <div className="flex items-center">
                      <SwissFranc className="mr-2 h-4 w-4" />
                      <span>CHF</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="JPY">
                    <div className="flex items-center">
                      <JapaneseYen className="mr-2 h-4 w-4" />
                      <span>JPY</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="INR">
                    <div className="flex items-center">
                      <IndianRupee className="mr-2 h-4 w-4" />
                      <span>INR</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="BTC">
                    <div className="flex items-center">
                      <Bitcoin className="mr-2 h-4 w-4" />
                      <span>BTC</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ETH">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-mono">Ξ</span>
                      <span>ETH</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="USDC">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-mono">$</span>
                      <span>USDC</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <FormControl>
              <DatePicker
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                )}
                onSelect={field.onChange}
                defaultValue={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ExpenseBasicFields;
