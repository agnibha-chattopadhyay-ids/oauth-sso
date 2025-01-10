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
        "border border-white/[0.2] bg-gradient-to-b from-white/30 to-white/10",
        "shadow-[0_8px_16px_rgb(0_0_0/0.1),0_3px_6px_rgb(0_0_0/0.08)]",
        "backdrop-blur-[12px] backdrop-filter",
        "dark:border-black/[0.2] dark:from-black/30 dark:to-black/10",
        "dark:shadow-[0_8px_16px_rgb(0_0_0/0.3),0_3px_6px_rgb(0_0_0/0.2)]",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-[0_12px_24px_rgb(0_0_0/0.15),0_5px_8px_rgb(0_0_0/0.1)]",
        "dark:hover:shadow-[0_12px_24px_rgb(0_0_0/0.4),0_5px_8px_rgb(0_0_0/0.2)]",
        // Subtle inner glow
        "before:absolute before:inset-0 before:-z-10",
        "before:bg-gradient-to-b before:from-white/5 before:to-transparent",
        "before:rounded-xl before:backdrop-blur-[8px]",
        // Subtle border highlight
        "after:absolute after:inset-px after:-z-10",
        "after:rounded-[11px] after:bg-gradient-to-b",
        "after:from-white/10 after:to-white/[0.02]",
        "dark:after:from-white/5 dark:after:to-white/[0.01]",
        className
      )}
      {...props}
    >
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
} 