
import { z } from 'zod';
import { UserSplitData } from '@/types/expenses';

// Define the split data types
export const splitDataSchema = z.array(
  z.object({
    userId: z.string(),
    amount: z.number().optional(),
    percentage: z.number().optional(),
    shares: z.number().optional(),
    isActive: z.boolean().optional(), // Added isActive property
  })
);

export const expenseFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.number().positive({
    message: "Amount must be greater than 0",
  }),
  currency: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  paidBy: z.string(),
  splitEqually: z.boolean().default(true),
  splitData: splitDataSchema.optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
