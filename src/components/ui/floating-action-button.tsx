
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  position?: "bottom-right" | "bottom-center";
  size?: "default" | "lg" | "sm";
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, position = "bottom-right", size = "default", ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-center": "fixed bottom-6 left-1/2 transform -translate-x-1/2",
    };
    
    const sizeClasses = {
      default: "h-14 w-14",
      lg: "h-16 w-16",
      sm: "h-12 w-12",
    };
    
    return (
      <button
        className={cn(
          "rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 z-50",
          positionClasses[position],
          sizeClasses[size],
          className
        )}
        ref={ref}
        type="button"
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton };
