"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { AiInsightsWidget } from "@/components/dashboard/ai-insights";
import { ExportReportModal } from "@/components/reports/export-report-modal";
import { FileText } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getBudgetStatus,
  getSavingsProgress,
  getMonthDisplayName,
  cn,
} from "@/lib/utils";
import type { DashboardData } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Target,
  Receipt,
  PieChart as PieIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <PageLoading />;

  if (!data) {
    return (
      <EmptyState
        title="Something went wrong"
        description="We couldn't load your dashboard data. Please try again."
      />
    );
  }

  const budgetStatus = data.totalBudget > 0
    ? getBudgetStatus(data.totalBudgetSpent, data.totalBudget)
    : "safe";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-hive-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-hive-400 font-medium mt-1">
            Here&apos;s your financial overview for this month
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => setIsExportModalOpen(true)}
        >
          <FileText className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* HiveMind AI Coach Widget */}
      <AiInsightsWidget />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expense */}
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-hive-400 uppercase tracking-wide">
                Expenses
              </p>
              <p className="text-2xl font-extrabold text-hive-800 mt-1">
                {formatCurrency(data.totalExpenseThisMonth)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-status-danger" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-danger/20">
            <div className="h-full bg-status-danger" style={{ width: "100%" }} />
          </div>
        </Card>

        {/* Income */}
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-hive-400 uppercase tracking-wide">
                Income
              </p>
              <p className="text-2xl font-extrabold text-hive-800 mt-1">
                {formatCurrency(data.totalIncomeThisMonth)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-status-safe" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-safe/20">
            <div className="h-full bg-status-safe" style={{ width: "100%" }} />
          </div>
        </Card>

        {/* Budget */}
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-hive-400 uppercase tracking-wide">
                Budget Left
              </p>
              <p className="text-2xl font-extrabold text-hive-800 mt-1">
                {formatCurrency(Math.max(data.totalBudget - data.totalBudgetSpent, 0))}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-cat-bills" />
            </div>
          </div>
          {data.totalBudget > 0 && (
            <div className="mt-3">
              <ProgressBar
                value={data.totalBudgetSpent}
                max={data.totalBudget}
                size="sm"
                showPercentage={false}
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cat-bills/20">
            <div className={cn(
              "h-full",
              budgetStatus === "safe" ? "bg-status-safe" : budgetStatus === "warning" ? "bg-status-warning" : "bg-status-danger"
            )} style={{ width: "100%" }} />
          </div>
        </Card>

        {/* Savings */}
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-hive-400 uppercase tracking-wide">
                Total Savings
              </p>
              <p className="text-2xl font-extrabold text-hive-800 mt-1">
                {formatCurrency(data.totalSavings)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-honey-50 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-honey-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-honey-200">
            <div className="h-full progress-honey" style={{ width: "100%" }} />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Category Breakdown */}
        <Card>
          <h3 className="text-lg font-bold text-hive-800 mb-4">
            Spending by Category
          </h3>
          {data.categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-honey-100 flex items-center justify-center mb-3 border border-honey-200">
                <PieIcon className="w-6 h-6 text-honey-600" />
              </div>
              <p className="text-sm text-hive-400">
                No expenses this month yet. Start tracking!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="categoryName"
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.categoryColor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value || 0))}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #F5EFDC",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                {data.categoryBreakdown.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.categoryColor }}
                    />
                    <span className="text-hive-600 truncate">{cat.categoryName}</span>
                    <span className="text-hive-400 ml-auto text-xs">
                      {Math.round(cat.percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Bar Chart - Monthly Trend */}
        <Card>
          <h3 className="text-lg font-bold text-hive-800 mb-4">
            Monthly Trend
          </h3>
          {data.monthlyTrend.every((m) => m.expense === 0 && m.income === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-honey-100 flex items-center justify-center mb-3 border border-honey-200">
                <BarChart3 className="w-6 h-6 text-honey-600" />
              </div>
              <p className="text-sm text-hive-400">
                No data yet. Add transactions to see trends!
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFDC" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [, m] = value.split("-");
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    return months[parseInt(m) - 1];
                  }}
                  tick={{ fill: "#7A6F5B", fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}K`
                      : value.toString()
                  }
                  tick={{ fill: "#7A6F5B", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value || 0))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #F5EFDC",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#F87171"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#34D399"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Goals */}
        <Card>
          <h3 className="text-lg font-bold text-hive-800 mb-4">
            Savings Goals
          </h3>
          {data.savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-honey-100 flex items-center justify-center mb-2 border border-honey-200">
                <Target className="w-5 h-5 text-honey-600" />
              </div>
              <p className="text-sm text-hive-400">
                No savings goals yet. Create one to start saving!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.savingsGoals.slice(0, 4).map((goal) => {
                const progress = getSavingsProgress(
                  goal.currentAmount,
                  goal.targetAmount
                );
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-cream-dark/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <DynamicIcon
                          name={goal.icon}
                          size={16}
                          color={goal.color}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-hive-700 truncate">
                          {goal.name}
                        </p>
                        <p className="text-xs text-hive-400">
                          {formatCurrency(goal.currentAmount)} /{" "}
                          {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <Badge variant={progress >= 100 ? "safe" : "honey"}>
                        {Math.round(progress)}%
                      </Badge>
                    </div>
                    <ProgressBar
                      value={goal.currentAmount}
                      max={goal.targetAmount}
                      variant="savings"
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <h3 className="text-lg font-bold text-hive-800 mb-4">
            Recent Transactions
          </h3>
          {data.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-honey-100 flex items-center justify-center mb-2 border border-honey-200">
                <Receipt className="w-5 h-5 text-honey-600" />
              </div>
              <p className="text-sm text-hive-400">
                No transactions yet. Start buzzing!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-dark/50 transition-honey"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tx.category.color}20`,
                    }}
                  >
                    <DynamicIcon
                      name={tx.category.icon}
                      size={16}
                      color={tx.category.color}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-hive-700 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-hive-400">
                      {tx.category.name} • {formatDate(tx.date)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      tx.type === "expense"
                        ? "text-status-danger"
                        : "text-status-safe"
                    )}
                  >
                    {tx.type === "expense" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
