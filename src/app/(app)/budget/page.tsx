"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  getCurrentMonth,
  getMonthDisplayName,
  getBudgetStatus,
  getBudgetPercentage,
  cn,
} from "@/lib/utils";
import type { Budget, Category } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, BudgetFormInput } from "@/lib/validators";
import { Plus, ChevronLeft, ChevronRight, Trash2, Wallet } from "lucide-react";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: currentMonth,
    },
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch(`/api/budgets?month=${currentMonth}`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const navigateMonth = (direction: -1 | 1) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
    setLoading(true);
  };

  const openModal = () => {
    reset({
      month: currentMonth,
      categoryId: "",
      monthlyLimit: undefined as unknown as number,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, month: currentMonth }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchBudgets();
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchBudgets();
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  // Categories that don't have a budget set for this month
  const availableCategories = categories.filter(
    (c) => !budgets.some((b) => b.categoryId === c.id)
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-hive-900 tracking-tight">
            Budget
          </h1>
          <p className="text-sm sm:text-base text-hive-400 font-medium mt-1">
            Set limits and keep your spending on track
          </p>
        </div>
        <Button onClick={openModal} size="md" disabled={availableCategories.length === 0}>
          <Plus className="w-5 h-5" />
          Set Budget
        </Button>
      </div>

      {/* Month Navigation */}
      <Card variant="honey" className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-xl hover:bg-honey-200/50 transition-honey"
        >
          <ChevronLeft className="w-5 h-5 text-hive-600" />
        </button>
        <h2 className="text-lg font-bold text-hive-800">
          {getMonthDisplayName(currentMonth)}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-xl hover:bg-honey-200/50 transition-honey"
        >
          <ChevronRight className="w-5 h-5 text-hive-600" />
        </button>
      </Card>

      {/* Total Overview */}
      {budgets.length > 0 && (
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-honey-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-honey-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-hive-400">Total Budget</p>
              <p className="text-2xl font-extrabold text-hive-800">
                {formatCurrency(totalSpent)}{" "}
                <span className="text-base font-semibold text-hive-400">
                  / {formatCurrency(totalBudget)}
                </span>
              </p>
            </div>
            <Badge
              variant={
                getBudgetStatus(totalSpent, totalBudget) === "safe"
                  ? "safe"
                  : getBudgetStatus(totalSpent, totalBudget) === "warning"
                  ? "warning"
                  : "danger"
              }
            >
              {Math.round(getBudgetPercentage(totalSpent, totalBudget))}% used
            </Badge>
          </div>
          <ProgressBar
            value={totalSpent}
            max={totalBudget}
            showLabel
            showPercentage={false}
            size="lg"
          />
        </Card>
      )}

      {/* Budget Items */}
      {budgets.length === 0 ? (
        <EmptyState
          title="No budgets set"
          description="Set monthly budgets for your categories to keep track of your spending limits."
          action={
            <Button onClick={openModal}>
              <Plus className="w-4 h-4" />
              Set Your First Budget
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = budget.spent || 0;
            const status = getBudgetStatus(spent, budget.monthlyLimit);
            const remaining = Math.max(budget.monthlyLimit - spent, 0);

            return (
              <Card key={budget.id} hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${budget.category.color}15`,
                      }}
                    >
                      <DynamicIcon
                        name={budget.category.icon}
                        size={18}
                        color={budget.category.color}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-hive-700">
                        {budget.category.name}
                      </p>
                      <p className="text-xs text-hive-400">
                        {formatCurrency(remaining)} remaining
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-hive-300 hover:text-status-danger transition-honey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-hive-700">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-hive-400">
                      {formatCurrency(budget.monthlyLimit)}
                    </span>
                  </div>
                </div>

                <ProgressBar
                  value={spent}
                  max={budget.monthlyLimit}
                  showPercentage
                  size="md"
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Budget Limit"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            id="categoryId"
            label="Category"
            placeholder="Select a category"
            options={availableCategories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            error={errors.categoryId?.message}
            {...register("categoryId")}
          />

          <Input
            id="monthlyLimit"
            label="Monthly Limit"
            type="number"
            step="any"
            placeholder="e.g. 500000"
            error={errors.monthlyLimit?.message}
            {...register("monthlyLimit")}
          />

          <input type="hidden" {...register("month")} value={currentMonth} />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Set Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
