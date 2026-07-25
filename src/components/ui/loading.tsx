import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-honey-200 border-t-honey-500 animate-spin",
          sizes[size]
        )}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-4xl animate-float">🐝</div>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-hive-400 font-medium">Buzzing around...</p>
    </div>
  );
}
