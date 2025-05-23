
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, Euro, PoundSterling, SwissFranc } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface ExpenseDetailEditProps {
  editedTitle: string;
  editedAmount: string;
  editedCurrency: string;
  editedDate: Date | null;
  editedPaidBy: string;
  expenseUsers: any[];
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onDateChange: (value: Date | null) => void;
  onPaidByChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
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

export const ExpenseDetailEdit = ({
  editedTitle,
  editedAmount,
  editedCurrency,
  editedDate,
  editedPaidBy,
  expenseUsers,
  onTitleChange,
  onAmountChange,
  onCurrencyChange,
  onDateChange,
  onPaidByChange,
  onCancel,
  onSave,
  loading
}: ExpenseDetailEditProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          value={editedTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          type="number"
          id="amount"
          value={editedAmount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={editedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a currency" />
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
      <div>
        <Label>Date</Label>
        <DatePicker
          value={editedDate}
          onValueChange={onDateChange}
        />
      </div>
      <div>
        <Label htmlFor="paidBy">Paid By</Label>
        <Select value={editedPaidBy} onValueChange={onPaidByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {expenseUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </>
  );
};
