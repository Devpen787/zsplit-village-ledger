
// This file is kept for backward compatibility but is now using Privy for authentication
import { isValidRole } from "@/utils/authUtils";

export async function checkEmailExists(email: string): Promise<boolean> {
  console.warn("checkEmailExists is deprecated with Privy integration");
  return false;
}

export async function registerUser(): Promise<any> {
  console.warn("registerUser is deprecated with Privy integration");
  throw new Error("Privy is now used for authentication");
}

export async function loginUser(): Promise<any> {
  console.warn("loginUser is deprecated with Privy integration");
  throw new Error("Privy is now used for authentication");
}

// Export isValidRole for backward compatibility
export { isValidRole };
