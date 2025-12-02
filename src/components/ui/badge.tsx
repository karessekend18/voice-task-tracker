import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
        urgent:
          "border-transparent bg-priority-urgent/20 text-priority-urgent",
        high:
          "border-transparent bg-priority-high/20 text-priority-high",
        medium:
          "border-transparent bg-priority-medium/20 text-priority-medium",
        low:
          "border-transparent bg-priority-low/20 text-priority-low",
        todo:
          "border-transparent bg-status-todo/20 text-status-todo",
        progress:
          "border-transparent bg-status-progress/20 text-status-progress",
        done:
          "border-transparent bg-status-done/20 text-status-done",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
