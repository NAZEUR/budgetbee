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
  formatDate,
  getSavingsProgress,
  getToday,
  cn,
} from "@/lib/utils";
import type { SavingsGoal } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  savingsGoalSchema,
  depositSchema,
  SavingsGoalFormInput,
  DepositFormInput,
} from "@/lib/validators";
import { SAVINGS_ICONS, SAVINGS_COLORS } from "@/constants";
import { Plus, Trash2, PlusCircle, Target } from "lucide-react";

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const goalForm = useForm({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      color: SAVINGS_COLORS[0],
      icon: SAVINGS_ICONS[0],
    },
  });

  const depositForm = useForm({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      date: getToday(),
    },
  });

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/savings");
      if (res.ok) setGoals(await res.json());
    } catch (error) {
      console.error("Failed to fetch savings goals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openGoalModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      goalForm.reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate
          ? new Date(goal.targetDate).toISOString().split("T")[0]
          : undefined,
        color: goal.color,
        icon: goal.icon,
      });
    } else {
      setEditingGoal(null);
      goalForm.reset({
        name: "",
        targetAmount: undefined as unknown as number,
        color: SAVINGS_COLORS[0],
        icon: SAVINGS_ICONS[0],
      });
    }
    setIsGoalModalOpen(true);
  };

  const openDepositModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    depositForm.reset({ date: getToday(), amount: undefined as unknown as number, note: "" });
    setIsDepositModalOpen(true);
  };

  const onGoalSubmit = async (data: SavingsGoalFormInput) => {
    try {
      const method = editingGoal ? "PUT" : "POST";
      const body = editingGoal ? { id: editingGoal.id, ...data } : data;

      const res = await fetch("/api/savings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsGoalModalOpen(false);
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
    }
  };

  const onDepositSubmit = async (data: DepositFormInput) => {
    if (!selectedGoalId) return;
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savingsGoalId: selectedGoalId, ...data }),
      });

      if (res.ok) {
        setIsDepositModalOpen(false);
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to add deposit:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/savings?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-hive-800">
            Savings Goals
          </h1>
          <p className="text-sm text-hive-400 mt-1">
            Build your honey pot, one deposit at a time 🍯
          </p>
        </div>
        <Button onClick={() => openGoalModal()} size="sm">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Total Overview */}
      {goals.length > 0 && (
        <Card variant="honey">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-honey-200/50 flex items-center justify-center">
              <Target className="w-6 h-6 text-honey-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-hive-400">Total Saved</p>
              <p className="text-2xl font-extrabold text-hive-800">
                {formatCurrency(totalSavings)}{" "}
                <span className="text-base font-semibold text-hive-400">
                  / {formatCurrency(totalTarget)}
                </span>
              </p>
            </div>
            <Badge variant="honey">
              {goals.length} goal{goals.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <ProgressBar
            value={totalSavings}
            max={totalTarget}
            variant="savings"
            size="lg"
            showPercentage
          />
        </Card>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          title="No savings goals yet"
          description="Create your first savings goal and start building your honey pot! Every little bit counts. 🐝"
          action={
            <Button onClick={() => openGoalModal()}>
              <Plus className="w-4 h-4" />
              Create First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const progress = getSavingsProgress(
              goal.currentAmount,
              goal.targetAmount
            );
            const isComplete = progress >= 100;

            return (
              <Card key={goal.id} hover className="group relative">
                {/* Delete button */}
                <button
                  onClick={() => setDeleteId(goal.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-hive-300 hover:text-status-danger transition-honey"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <DynamicIcon
                      name={goal.icon}
                      size={22}
                      color={goal.color}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-hive-800 truncate">
                      {goal.name}
                    </p>
                    {goal.targetDate && (
                      <p className="text-xs text-hive-400">
                        Target: {formatDate(goal.targetDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-lg font-extrabold text-hive-800">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-sm text-hive-400">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.currentAmount}
                    max={goal.targetAmount}
                    variant="savings"
                    size="md"
                    showPercentage
                    customColor={goal.color}
                  />
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-cream-darker">
                  {isComplete ? (
                    <Badge variant="safe">🎉 Goal Reached!</Badge>
                  ) : (
                    <span className="text-xs text-hive-400">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)} to
                      go
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDepositModal(goal.id)}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Deposit
                  </Button>
                </div>

                {/* Recent Deposits */}
                {goal.deposits && goal.deposits.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cream-darker">
                    <p className="text-xs font-semibold text-hive-400 mb-2">
                      Recent Deposits
                    </p>
                    <div className="space-y-1.5">
                      {goal.deposits.slice(0, 3).map((deposit) => (
                        <div
                          key={deposit.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-hive-500">
                            {deposit.note || formatDate(deposit.date)}
                          </span>
                          <span className="font-semibold text-status-safe">
                            +{formatCurrency(deposit.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? "Edit Savings Goal" : "New Savings Goal"}
      >
        <form
          onSubmit={goalForm.handleSubmit(onGoalSubmit)}
          className="space-y-4"
        >
          <Input
            id="goalName"
            label="Goal Name"
            placeholder="e.g. Emergency Fund, Vacation"
            error={goalForm.formState.errors.name?.message}
            {...goalForm.register("name")}
          />

          <Input
            id="targetAmount"
            label="Target Amount"
            type="number"
            step="any"
            placeholder="e.g. 5000000"
            error={goalForm.formState.errors.targetAmount?.message}
            {...goalForm.register("targetAmount")}
          />

          <Input
            id="targetDate"
            label="Target Date (Optional)"
            type="date"
            error={goalForm.formState.errors.targetDate?.message}
            {...goalForm.register("targetDate")}
          />

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-hive-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {SAVINGS_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => goalForm.setValue("color", color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-honey",
                    goalForm.watch("color") === color
                      ? "ring-2 ring-offset-2 ring-hive-400 scale-110"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-semibold text-hive-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {SAVINGS_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => goalForm.setValue("icon", icon)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-honey",
                    goalForm.watch("icon") === icon
                      ? "bg-honey-100 ring-2 ring-honey-400"
                      : "bg-cream-dark hover:bg-honey-50"
                  )}
                >
                  <DynamicIcon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsGoalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={goalForm.formState.isSubmitting}
            >
              {editingGoal ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Add Deposit 🍯"
        size="sm"
      >
        <form
          onSubmit={depositForm.handleSubmit(onDepositSubmit)}
          className="space-y-4"
        >
          <Input
            id="depositAmount"
            label="Amount"
            type="number"
            step="any"
            placeholder="e.g. 100000"
            error={depositForm.formState.errors.amount?.message}
            {...depositForm.register("amount")}
          />

          <Input
            id="depositNote"
            label="Note (Optional)"
            placeholder="e.g. Monthly deposit"
            {...depositForm.register("note")}
          />

          <Input
            id="depositDate"
            label="Date"
            type="date"
            error={depositForm.formState.errors.date?.message}
            {...depositForm.register("date")}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsDepositModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={depositForm.formState.isSubmitting}
            >
              Add Deposit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Savings Goal"
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-3">😢</div>
          <p className="text-sm text-hive-600 mb-6">
            Are you sure you want to delete this savings goal? All deposits will
            also be deleted. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Keep It
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
