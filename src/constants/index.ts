// Default expense categories with colors and lucide-react icon names
export const DEFAULT_CATEGORIES = [
  {
    name: "Food & Drinks",
    color: "#FF8C42",
    icon: "UtensilsCrossed",
    isDefault: true,
  },
  {
    name: "Transportation",
    color: "#4A90D9",
    icon: "Car",
    isDefault: true,
  },
  {
    name: "Shopping",
    color: "#E85D9C",
    icon: "ShoppingBag",
    isDefault: true,
  },
  {
    name: "Bills & Utilities",
    color: "#8B6FD1",
    icon: "Receipt",
    isDefault: true,
  },
  {
    name: "Entertainment",
    color: "#4CAF8A",
    icon: "Gamepad2",
    isDefault: true,
  },
  {
    name: "Health",
    color: "#FF6B6B",
    icon: "HeartPulse",
    isDefault: true,
  },
  {
    name: "Other",
    color: "#9B9284",
    icon: "MoreHorizontal",
    isDefault: true,
  },
] as const;

// Income categories
export const DEFAULT_INCOME_CATEGORIES = [
  {
    name: "Salary",
    color: "#34D399",
    icon: "Briefcase",
    isDefault: true,
  },
  {
    name: "Freelance",
    color: "#60A5FA",
    icon: "Laptop",
    isDefault: true,
  },
  {
    name: "Investment",
    color: "#A78BFA",
    icon: "TrendingUp",
    isDefault: true,
  },
  {
    name: "Other Income",
    color: "#9B9284",
    icon: "Plus",
    isDefault: true,
  },
] as const;

// Budget status thresholds
export const BUDGET_STATUS = {
  SAFE: { max: 0.7, color: "status-safe", label: "On Track" },
  WARNING: { max: 0.9, color: "status-warning", label: "Watch Out" },
  DANGER: { max: Infinity, color: "status-danger", label: "Over Budget" },
} as const;

// Available icons for savings goals
export const SAVINGS_ICONS = [
  "PiggyBank",
  "Home",
  "Plane",
  "GraduationCap",
  "Car",
  "Smartphone",
  "Gift",
  "Heart",
  "Star",
  "Target",
  "Gem",
  "Trophy",
] as const;

// Available colors for savings goals
export const SAVINGS_COLORS = [
  "#F0B429",
  "#FF8C42",
  "#4A90D9",
  "#E85D9C",
  "#8B6FD1",
  "#4CAF8A",
  "#FF6B6B",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
] as const;

// Navigation items for the sidebar
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Transactions", href: "/transactions", icon: "ArrowLeftRight" },
  { label: "Budget", href: "/budget", icon: "Wallet" },
  { label: "Savings", href: "/savings", icon: "PiggyBank" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

// Months for selectors
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
