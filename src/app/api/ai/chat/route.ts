import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiResponse } from "@/lib/gemini";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Fetch user context
    const [transactions, budgets, savingsGoals] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId, month: currentMonthStr },
        include: { category: true },
      }),
      prisma.savingsGoal.findMany({ where: { userId } }),
    ]);

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const remainingBudget = Math.max(totalBudget - totalExpense, 0);
    const netBalance = totalIncome - totalExpense;

    const contextText = `
Data Keuangan User (${session.user.name}) bulan ini (${currentMonthStr}):
- Total Pemasukan: ${formatCurrency(totalIncome)}
- Total Pengeluaran: ${formatCurrency(totalExpense)}
- Sisa Saldo Bulan Ini: ${formatCurrency(netBalance)}
- Total Limit Budget: ${formatCurrency(totalBudget)} (Sisa Budget: ${formatCurrency(remainingBudget)})
- Budgets per Kategori: ${budgets.map((b) => `${b.category.name}: Limit ${formatCurrency(b.monthlyLimit)}`).join(", ")}
- Savings Goals: ${savingsGoals.map((g) => `${g.name}: ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)}`).join(", ")}
`;

    const systemInstruction = `Kamu adalah BeeBot 🐝, asisten AI maskot lebah dari aplikasi BudgetBee.
Karaktermu: Ramah, cerdas, membantu, hemat, dan playful (sesekali gunakan emoji lebah 🐝 / madu 🍯).
Tugasmu adalah menjawab pertanyaan user seputar keuangan mereka di BudgetBee secara spesifik dan akurat berdasarkan data keuangan yang diberikan.
Jawab dengan ringkas (maksimal 2-3 paragraf pendek), ramah, dan solutif dalam Bahasa Indonesia.`;

    const fullPrompt = `${contextText}\n\nPertanyaan User: "${message}"`;

    const aiReply = await generateAiResponse(fullPrompt, systemInstruction);

    if (aiReply) {
      return NextResponse.json({ reply: aiReply.trim() });
    }

    // Dynamic smart response generator if AI key is missing/quota exceeded
    const msgLower = message.toLowerCase();
    let reply = "";

    if (msgLower.includes("sisa budget") || msgLower.includes("budget tersisa") || msgLower.includes("sisa limit")) {
      if (totalBudget === 0) {
        reply = `Bzz! 🐝 Kamu belum mengatur limit budget untuk bulan ini. Yuk atur budget di menu **Budget** agar pengeluaranmu lebih terukur! 🍯`;
      } else {
        reply = `Bzz! 🐝 Sisa budget bulananmu bulan ini adalah **${formatCurrency(remainingBudget)}**.\n\n` +
          `• Total Limit Budget: ${formatCurrency(totalBudget)}\n` +
          `• Terpakai: ${formatCurrency(totalExpense)}\n` +
          `• Persentase Terpakai: ${Math.round((totalExpense / totalBudget) * 100)}% 🎯`;
      }
    } else if (msgLower.includes("bantu") || msgLower.includes("atur") || msgLower.includes("saran") || msgLower.includes("hemat")) {
      const recSavings = Math.max(Math.round(netBalance * 0.2), 50000);
      reply = `Bzz! 🐝 Berikut 3 saran praktis dari BeeBot untuk mengelolanya:\n\n` +
        `1. 🎯 **Amankan Tabungan**: Sisihkan minimal **${formatCurrency(recSavings)}** ke target tabunganmu sebelum dipakai jajan.\n` +
        `2. 📊 **Sisa Budget**: Saldo sisa kamu saat ini ${formatCurrency(netBalance)}. Batasi pengeluaran harian maks ${formatCurrency(Math.round(netBalance / 15))}/hari.\n` +
        `3. 🍯 **Evaluasi Jajan**: Cek pengeluaran kategori Makanan & Minuman di Dashboard untuk memangkas jajan impulsif!`;
    } else if (msgLower.includes("pemasukan") || msgLower.includes("gaji") || msgLower.includes("pendapatan") || msgLower.includes("masuk")) {
      reply = `Bzz! 🐝 Total pemasukanmu bulan ini tercatat sebesar **${formatCurrency(totalIncome)}**. Kerja bagus terus tingkatkan! 🚀`;
    } else if (msgLower.includes("pengeluaran") || msgLower.includes("keluar") || msgLower.includes("habis")) {
      reply = `Bzz! 🐝 Total pengeluaranmu bulan ini tercatat sebesar **${formatCurrency(totalExpense)}** dari pemasukan ${formatCurrency(totalIncome)}.`;
    } else if (msgLower.includes("tabung") || msgLower.includes("savings") || msgLower.includes("goal")) {
      reply = `Bzz! 🐝 Kamu memiliki **${savingsGoals.length}** target tabungan aktif. Sisihkan sedikit demi sedikit madu uangmu untuk mencapai impianmu! 🍯`;
    } else {
      reply = `Bzz! 🐝 Berdasarkan data kamu bulan ini:\n` +
        `• Pemasukan: ${formatCurrency(totalIncome)}\n` +
        `• Pengeluaran: ${formatCurrency(totalExpense)}\n` +
        `• Sisa Uang: ${formatCurrency(netBalance)}\n\n` +
        `Ada yang ingin kamu tanyakan lebih spesifik tentang budget atau saran hemat? 🍯`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in BeeBot Chat API:", error);
    return NextResponse.json({ error: "Failed to communicate with BeeBot" }, { status: 500 });
  }
}
