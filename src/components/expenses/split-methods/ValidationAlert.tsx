
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ValidationAlertProps {
  validationError: string | null;
}

const ValidationAlert: React.FC<ValidationAlertProps> = ({ validationError }) => {
  if (!validationError) return null;

  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{validationError}</AlertDescription>
    </Alert>
  );
};

export default ValidationAlert;
