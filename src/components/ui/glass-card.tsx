import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "border-2 border-border",
        "bg-card text-card-foreground",
        "shadow-[0_8px_16px_rgb(0_0_0/0.1),0_3px_6px_rgb(0_0_0/0.08)]",
        "backdrop-blur-[12px] backdrop-filter",
        // Glow effect for the border
        "before:absolute before:inset-0 before:-z-10",
        "before:rounded-xl before:border-2 before:border-border",
        "before:blur-[2px]",
        // Hover effects
        "transition-all duration-300 ease-in-out",
        "hover:shadow-[0_12px_24px_rgb(0_0_0/0.15),0_5px_8px_rgb(0_0_0/0.1)]",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 