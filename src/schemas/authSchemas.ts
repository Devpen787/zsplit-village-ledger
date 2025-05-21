
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  groupName: z.string().optional(),
  walletAddress: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
