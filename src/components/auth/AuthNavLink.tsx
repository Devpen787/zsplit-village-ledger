
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface AuthNavLinkProps {
  to: string;
  isLoading: boolean;
  label: string;
}

const AuthNavLink = ({ to, isLoading, label }: AuthNavLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate(to)} 
      variant="outline"
      className="w-full"
      disabled={isLoading}
    >
      {label}
    </Button>
  );
};

export default AuthNavLink;
