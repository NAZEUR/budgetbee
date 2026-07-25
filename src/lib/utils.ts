/**
 * Format a number as currency (IDR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format date to YYYY-MM for month selectors
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get display name for a month string (YYYY-MM)
 */
export function getMonthDisplayName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(date);
}

/**
 * Calculate budget percentage spent
 */
export function getBudgetPercentage(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 100);
}

/**
 * Get budget status based on percentage
 */
export function getBudgetStatus(
  spent: number,
  limit: number
): "safe" | "warning" | "danger" {
  const ratio = spent / limit;
  if (ratio <= 0.7) return "safe";
  if (ratio <= 0.9) return "warning";
  return "danger";
}

/**
 * Get budget status color class
 */
export function getBudgetStatusColor(status: "safe" | "warning" | "danger"): string {
  const colors = {
    safe: "bg-status-safe",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
  };
  return colors[status];
}

/**
 * Calculate savings progress percentage
 */
export function getSavingsProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Classname merge utility (simple implementation)
 */
export function cn(...classes: (string | undefined | null | false | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return formatMonth(new Date());
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
