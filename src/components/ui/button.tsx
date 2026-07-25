"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-gradient-to-r from-honey-400 via-honey-500 to-honey-600 text-hive-900 shadow-honey hover:shadow-md hover:brightness-105 border border-honey-400/30",
      secondary:
        "bg-hive-800 text-cream hover:bg-hive-900 shadow-sm hover:shadow-md border border-hive-700/50",
      ghost:
        "bg-transparent text-hive-700 hover:bg-honey-100/60 hover:text-hive-900 font-bold",
      danger:
        "bg-status-danger text-white hover:bg-red-600 shadow-sm shadow-red-500/20 hover:shadow-md",
      outline:
        "border border-honey-400 text-hive-800 hover:bg-honey-100/60 hover:border-honey-500 bg-white/80 backdrop-blur-sm shadow-xs",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs min-h-[34px] gap-1.5 rounded-xl font-bold",
      md: "px-4.5 py-2 text-sm min-h-[40px] gap-2 rounded-xl font-extrabold",
      lg: "px-6 py-2.5 text-sm sm:text-base min-h-[46px] gap-2.5 rounded-2xl font-extrabold",
      xl: "px-8 py-3.5 text-base sm:text-lg min-h-[52px] gap-3 rounded-2xl font-black tracking-wide",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
