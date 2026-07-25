import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Run all queries in parallel
    const [
      expenseThisMonth,
      incomeThisMonth,
      categoryBreakdown,
      budgets,
      savingsGoals,
      recentTransactions,
      monthlyData,
    ] = await Promise.all([
      // Total expense this month
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "expense",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Total income this month
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "income",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Category breakdown (expense only)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "expense",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Budgets for current month
      prisma.budget.findMany({
        where: { userId, month: currentMonth },
        include: { category: true },
      }),

      // Savings goals
      prisma.savingsGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),

      // Monthly trends (last 6 months)
      (() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            start: new Date(d.getFullYear(), d.getMonth(), 1),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
            label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          });
        }
        return Promise.all(
          months.map(async (m) => {
            const [expenses, income] = await Promise.all([
              prisma.transaction.aggregate({
                where: {
                  userId,
                  type: "expense",
                  date: { gte: m.start, lte: m.end },
                },
                _sum: { amount: true },
              }),
              prisma.transaction.aggregate({
                where: {
                  userId,
                  type: "income",
                  date: { gte: m.start, lte: m.end },
                },
                _sum: { amount: true },
              }),
            ]);
            return {
              month: m.label,
              expense: expenses._sum.amount || 0,
              income: income._sum.amount || 0,
            };
          })
        );
      })(),
    ]);

    // Enrich category breakdown with category details
    const categories = await prisma.category.findMany({
      where: { userId },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const totalExpense = expenseThisMonth._sum.amount || 0;
    const enrichedCategoryBreakdown = categoryBreakdown
      .map((item) => {
        const cat = categoryMap.get(item.categoryId);
        const amount = item._sum.amount || 0;
        return {
          categoryId: item.categoryId,
          categoryName: cat?.name || "Unknown",
          categoryColor: cat?.color || "#9B9284",
          categoryIcon: cat?.icon || "MoreHorizontal",
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Calculate total budget and spent
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalBudgetSpent = totalExpense;
    const totalSavings = savingsGoals.reduce(
      (sum, g) => sum + g.currentAmount,
      0
    );

    return NextResponse.json({
      totalExpenseThisMonth: totalExpense,
      totalIncomeThisMonth: incomeThisMonth._sum.amount || 0,
      totalBudget,
      totalBudgetSpent,
      totalSavings,
      categoryBreakdown: enrichedCategoryBreakdown,
      monthlyTrend: monthlyData,
      savingsGoals,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
