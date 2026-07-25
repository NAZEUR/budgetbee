export type TransactionType = "expense" | "income";

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  monthlyLimit: number;
  month: string; // "YYYY-MM"
  spent?: number; // calculated field
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  color: string;
  icon: string;
  createdAt: string;
  deposits?: SavingsDeposit[];
}

export interface SavingsDeposit {
  id: string;
  savingsGoalId: string;
  amount: number;
  date: string;
  note: string | null;
}

// Dashboard aggregated data
export interface DashboardData {
  totalExpenseThisMonth: number;
  totalIncomeThisMonth: number;
  totalBudget: number;
  totalBudgetSpent: number;
  totalSavings: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrend: MonthlyTrend[];
  savingsGoals: SavingsGoal[];
  recentTransactions: Transaction[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  expense: number;
  income: number;
}

// Form types
export interface TransactionFormData {
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  date: string;
}

export interface BudgetFormData {
  categoryId: string;
  monthlyLimit: number;
  month: string;
}

export interface SavingsGoalFormData {
  name: string;
  targetAmount: number;
  targetDate?: string;
  color: string;
  icon: string;
}

export interface DepositFormData {
  amount: number;
  note?: string;
  date: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
}

// Filter types
export interface TransactionFilter {
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}
