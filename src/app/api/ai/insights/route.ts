import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiResponse } from "@/lib/gemini";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Fetch user dashboard metrics
    const [transactions, budgets, savingsGoals] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId, month: currentMonthStr },
        include: { category: true },
      }),
      prisma.savingsGoal.findMany({
        where: { userId },
      }),
    ]);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    // Category breakdown
    const catMap = new Map<string, { name: string; spent: number; limit: number }>();
    for (const b of budgets) {
      catMap.set(b.categoryId, { name: b.category.name, spent: 0, limit: b.monthlyLimit });
    }
    for (const t of transactions) {
      if (t.type === "expense") {
        const existing = catMap.get(t.categoryId) || { name: t.category.name, spent: 0, limit: 0 };
        existing.spent += t.amount;
        catMap.set(t.categoryId, existing);
      }
    }

    const summaryText = `
User Financial Context (${currentMonthStr}):
- Total Income: ${formatCurrency(totalIncome)}
- Total Expenses: ${formatCurrency(totalExpense)}
- Total Budget Limit: ${formatCurrency(totalBudget)}
- Category Breakdown: ${Array.from(catMap.values())
      .map((c) => `${c.name}: Spent ${formatCurrency(c.spent)} / Limit ${formatCurrency(c.limit)}`)
      .join("; ")}
- Savings Goals: ${savingsGoals.map((g) => `${g.name}: ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)}`).join("; ")}
`;

    const systemInstruction = `Kamu adalah HiveMind AI, asisten keuangan pribadi yang ramah, memotivasi, dan cerdas dengan persona lebah madu BudgetBee. 
Berikan 3 poin analisis/saran keuangan yang singkat, segar, dan konkret dalam bahasa Indonesia santai.
Format jawaban persis berupa 3 bullet points diawali emoji (misal 🎯, 🐝, 💡). Jangan gunakan markdown header atau pembuka yang terlalu panjang.`;

    const aiText = await generateAiResponse(
      `Analisis kondisi keuangan user bulan ini berdasarkan data berikut:\n${summaryText}`,
      systemInstruction
    );

    if (aiText) {
      return NextResponse.json({
        insights: aiText.trim().split("\n").filter((line) => line.trim().length > 0),
        isAiGenerated: true,
      });
    }

    // Fallback smart rule-based insights if AI key is not set or API is unavailable
    const fallbackInsights = [];
    if (totalExpense > totalIncome && totalIncome > 0) {
      fallbackInsights.push(`⚠️ Pengeluaran bulan ini (${formatCurrency(totalExpense)}) sudah melebihi pemasukan. Yuk rem sedikit jajan minggu ini!`);
    } else {
      fallbackInsights.push(`🎯 Pemasukan kamu berada di angka ${formatCurrency(totalIncome)}. Pertahankan rasio tabungan di atas 20%!`);
    }

    if (totalBudget > 0) {
      const budgetPct = Math.round((totalExpense / totalBudget) * 100);
      if (budgetPct >= 80) {
        fallbackInsights.push(`🐝 Waspada! Kamu sudah terpakai ${budgetPct}% dari total limit budget bulanan.`);
      } else {
        fallbackInsights.push(`💡 Budget bulanan kamu masih aman terpakai ${budgetPct}%. Pertahankan sampai akhir bulan!`);
      }
    }

    if (savingsGoals.length > 0) {
      fallbackInsights.push(`🍯 Kamu punya ${savingsGoals.length} target tabungan aktif. Sisihkan sisa uang makan minggu ini ke sarang tabungan!`);
    } else {
      fallbackInsights.push(`✨ Belum punya target tabungan? Buat 1 target baru di menu Savings untuk mulai mengumpulkan madu!`);
    }

    return NextResponse.json({
      insights: fallbackInsights,
      isAiGenerated: false,
    });
  } catch (error) {
    console.error("Error generating AI Insights:", error);
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 });
  }
}
