"use client";

import { cn, getBudgetStatus, getBudgetPercentage } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number; // current spent
  max: number; // budget limit
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "budget" | "savings" | "custom";
  customColor?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max,
  showLabel = false,
  showPercentage = true,
  size = "md",
  variant = "budget",
  customColor,
  className,
  animated = true,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = getBudgetPercentage(value, max);
  const status = getBudgetStatus(value, max);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animated]);

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const getBarColor = () => {
    if (customColor) return customColor;
    if (variant === "savings") return "bg-honey-500";
    // Budget status colors
    switch (status) {
      case "safe":
        return "bg-status-safe";
      case "warning":
        return "bg-status-warning";
      case "danger":
        return "bg-status-danger";
    }
  };

  const getBarGradient = () => {
    if (variant === "savings") {
      return "background: linear-gradient(90deg, #FADB5F, #F0B429, #DE911D)";
    }
    return "";
  };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {showLabel && (
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                status === "danger" ? "text-status-danger" : "text-hive-400"
              )}
            >
              {status === "safe"
                ? "On Track"
                : status === "warning"
                ? "Watch Out"
                : "Over Budget"}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-bold text-hive-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-cream-darker overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getBarColor(),
            variant === "savings" && "progress-honey"
          )}
          style={{
            width: `${width}%`,
            ...(getBarGradient() ? { background: "linear-gradient(90deg, #FADB5F, #F0B429, #DE911D)" } : {}),
          }}
        />
      </div>
    </div>
  );
}
