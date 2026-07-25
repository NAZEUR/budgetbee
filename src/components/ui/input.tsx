"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-hive-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hive-300">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-xl border border-cream-darker bg-white px-4 py-2.5 text-sm text-hive-800",
              "placeholder:text-hive-300",
              "focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-honey-400",
              "transition-honey",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-10" : undefined,
              error ? "border-status-danger focus:ring-status-danger" : undefined,
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-status-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
