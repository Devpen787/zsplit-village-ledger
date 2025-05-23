
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, DollarSign, Euro, PoundSterling, SwissFranc } from "lucide-react";

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
