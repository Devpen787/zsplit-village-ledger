
import { Button, ButtonProps } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';

interface SignInButtonProps extends ButtonProps {
  showIcon?: boolean;
  text?: string;
}

export default function SignInButton({ 
  showIcon = true, 
  text = "Sign In", 
  ...props 
}: SignInButtonProps) {
  const { login } = usePrivy();

  return (
    <Button onClick={() => login()} {...props}>
      {showIcon && <LogIn className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
}
