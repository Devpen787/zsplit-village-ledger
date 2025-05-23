
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

type DashboardSectionProps = {
  title: string;
  linkText?: string;
  linkTo?: string;
  description?: string;
  children: React.ReactNode;
};

export const DashboardSection = ({ 
  title, 
  linkText, 
  linkTo, 
  description,
  children 
}: DashboardSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {linkTo && linkText && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={linkTo}>{linkText}</Link>
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};
