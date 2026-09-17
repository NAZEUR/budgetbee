"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  getToday,
  cn,
} from "@/lib/utils";
import type { Transaction, Category, TransactionFilter } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionFormInput } from "@/lib/validators";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Sparkles,
  FileText,
} from "lucide-react";
import { AiQuickInputModal } from "@/components/transactions/ai-quick-input-modal";
import { ExportReportModal } from "@/components/reports/export-report-modal";
import { useLanguage } from "@/providers/language-provider";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSyncGmail = async () => {
    setIsSyncingGmail(true);
    try {
      const res = await fetch("/api/integrations/gmail/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || t("generic.success"));
        fetchTransactions();
      } else {
        if (data.error?.includes("connect")) {
          if (confirm("Gmail not connected. Connect your Gmail account now?")) {
            window.location.href = "/api/integrations/gmail/connect";
          }
        } else {
          alert(data.error || t("generic.error"));
        }
      }
    } catch {
      alert(t("generic.error"));
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: getToday(),
    },
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams({ page: page.toString(), limit: "15" });
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.type) params.set("type", filters.type);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openCreateModal = () => {
    setEditingTransaction(null);
    reset({ type: "expense", date: getToday(), amount: undefined, description: "", categoryId: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    reset({
      amount: tx.amount,
      description: tx.description,
      type: tx.type,
      categoryId: tx.categoryId,
      date: new Date(tx.date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TransactionFormInput) => {
    try {
      const url = "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";
      const body = editingTransaction
        ? { id: editingTransaction.id, ...data }
        : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/transactions?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const filteredCategoryOptions = categories
    .filter((c) => {
      const currentType = editingTransaction?.type;
      return true;
    })
    .map((c) => ({
      value: c.id,
      label: c.name,
    }));

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-hive-900 tracking-tight">
            {t("transactions.title")}
          </h1>
          <p className="text-sm sm:text-base text-hive-400 font-medium mt-1">
            {t("transactions.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiModalOpen(true)}
            className="flex-1 sm:flex-initial justify-center border-honey-400 text-hive-900 bg-honey-100/50 hover:bg-honey-200/60 font-bold"
          >
            <Sparkles className="w-4 h-4 text-honey-600 animate-pulse" />
            AI Quick Add
          </Button>
          <Button onClick={openCreateModal} size="sm" className="flex-1 sm:flex-initial justify-center">
            <Plus className="w-4 h-4" />
            {t("transactions.add")}
          </Button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-row flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-white border border-cream-darker shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncGmail}
            isLoading={isSyncingGmail}
            className="px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            <Mail className="w-4 h-4 text-hive-600" />
            Sync Gmail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            <FileText className="w-4 h-4 text-hive-600" />
            {t("dashboard.exportReport")}
          </Button>
        </div>
      </div>

      <AiQuickInputModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={() => fetchTransactions()}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Filters */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label={t("transactions.category")}
              options={[
                { value: "", label: t("transactions.all") },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={filters.categoryId || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  categoryId: e.target.value || undefined,
                }))
              }
            />
            <Select
              label={t("transactions.type")}
              options={[
                { value: "", label: t("transactions.all") },
                { value: "expense", label: t("transactions.expense") },
                { value: "income", label: t("transactions.income") },
              ]}
              value={filters.type || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  type: (e.target.value as "expense" | "income") || undefined,
                }))
              }
            />
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  startDate: e.target.value || undefined,
                }))
              }
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  endDate: e.target.value || undefined,
                }))
              }
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <EmptyState
          title={t("dashboard.noTransactions")}
          description="Add your first transaction to begin tracking your money."
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              {t("transactions.add")}
            </Button>
          }
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-cream-darker">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-cream-dark/30 transition-honey group"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${tx.category.color}15` }}
                  >
                    <DynamicIcon
                      name={tx.category.icon}
                      size={18}
                      color={tx.category.color}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-hive-700 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={tx.type === "expense" ? "danger" : "safe"}
                      >
                        {tx.type === "expense" ? t("transactions.expense") : t("transactions.income")}
                      </Badge>
                      <span className="text-xs text-hive-400">
                        {tx.category.name}
                      </span>
                      <span className="text-xs text-hive-300 hidden sm:inline">
                        • {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <p
                    className={cn(
                      "text-sm font-bold whitespace-nowrap",
                      tx.type === "expense"
                        ? "text-status-danger"
                        : "text-status-safe"
                    )}
                  >
                    {tx.type === "expense" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(tx)}
                      className="p-1.5 rounded-lg hover:bg-cream-dark text-hive-400 hover:text-hive-700 transition-honey"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-hive-400 hover:text-status-danger transition-honey"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-hive-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? t("generic.edit") : t("transactions.add")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-honey",
              "has-[:checked]:border-status-danger has-[:checked]:bg-red-50",
              "border-cream-darker hover:border-hive-200"
            )}>
              <input type="radio" value="expense" {...register("type")} className="sr-only" />
              <span className="text-sm font-semibold">{t("transactions.expense")}</span>
            </label>
            <label className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-honey",
              "has-[:checked]:border-status-safe has-[:checked]:bg-emerald-50",
              "border-cream-darker hover:border-hive-200"
            )}>
              <input type="radio" value="income" {...register("type")} className="sr-only" />
              <span className="text-sm font-semibold">{t("transactions.income")}</span>
            </label>
          </div>

          <Input
            id="amount"
            label={t("transactions.amount")}
            type="number"
            step="any"
            placeholder="0"
            error={errors.amount?.message}
            {...register("amount")}
          />

          <Input
            id="description"
            label="Description"
            placeholder="e.g. Lunch at restaurant"
            error={errors.description?.message}
            {...register("description")}
          />

          <Select
            id="categoryId"
            label={t("transactions.category")}
            placeholder="Select a category"
            options={filteredCategoryOptions}
            error={errors.categoryId?.message}
            {...register("categoryId")}
          />

          <Input
            id="date"
            label={t("transactions.date")}
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              {t("generic.cancel")}
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingTransaction ? t("generic.save") : t("transactions.add")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t("generic.delete")}
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center border border-red-200">
            <Trash2 className="w-6 h-6 text-status-danger" />
          </div>
          <p className="text-sm text-hive-600 mb-6">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              {t("generic.cancel")}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
            >
              {t("generic.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
