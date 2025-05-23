
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Euro, PoundSterling, SwissFranc } from 'lucide-react';

interface ExpenseFormBasicFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
}

const currencies = [
  { value: "USD", label: "USD", icon: DollarSign },
  { value: "USDC", label: "USDC", icon: DollarSign },
  { value: "EUR", label: "EUR", icon: Euro },
  { value: "GBP", label: "GBP", icon: PoundSterling },
  { value: "CHF", label: "CHF", icon: SwissFranc },
  { value: "BTC", label: "BTC", icon: DollarSign },
  { value: "ETH", label: "ETH", icon: DollarSign },
];

const ExpenseFormBasicFields: React.FC<ExpenseFormBasicFieldsProps> = ({
  title,
  setTitle,
  amount,
  setAmount,
  currency,
  setCurrency,
  date,
  setDate,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="What was this expense for?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  <div className="flex items-center">
                    <curr.icon className="mr-2 h-4 w-4" />
                    <span>{curr.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default ExpenseFormBasicFields;
