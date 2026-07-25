import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const numberSchema = (msg: string) => z.coerce.number().positive(msg);

// Transaction schema
export const transactionSchema = z.object({
  amount: numberSchema("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["expense", "income"]),
  categoryId: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Date is required"),
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  icon: z.string().min(1, "Please select an icon"),
});

// Budget schema
export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  monthlyLimit: numberSchema("Budget must be greater than 0"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
});

// Savings goal schema
export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: numberSchema("Target amount must be greater than 0"),
  targetDate: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  icon: z.string().min(1, "Please select an icon"),
});

// Deposit schema
export const depositSchema = z.object({
  amount: numberSchema("Amount must be greater than 0"),
  note: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

// Types from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TransactionFormInput = z.infer<typeof transactionSchema>;
export type CategoryFormInput = z.infer<typeof categorySchema>;
export type BudgetFormInput = z.infer<typeof budgetSchema>;
export type SavingsGoalFormInput = z.infer<typeof savingsGoalSchema>;
export type DepositFormInput = z.infer<typeof depositSchema>;
