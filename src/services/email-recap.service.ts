import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { formatCurrency } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CategoryStat {
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

interface WeeklyRecapData {
  user: { name: string; email: string };
  weekStart: Date;
  weekEnd: Date;
  totalExpense: number;
  totalIncome: number;
  netBalance: number;
  topCategories: CategoryStat[];
  transactionCount: number;
  biggestExpense: { description: string; amount: number; categoryName: string } | null;
}

interface MonthlyRecapData {
  user: { name: string; email: string };
  month: string; // "YYYY-MM"
  monthLabel: string;
  totalExpense: number;
  totalIncome: number;
  netBalance: number;
  prevMonthExpense: number;
  expenseChange: number; // persentase perubahan
  categoryBreakdown: CategoryStat[];
  budgetStatus: {
    categoryName: string;
    limit: number;
    spent: number;
    percentage: number;
    status: "safe" | "warning" | "danger";
  }[];
  savingsProgress: {
    name: string;
    currentAmount: number;
    targetAmount: number;
    percentage: number;
  }[];
  totalSavings: number;
}

// ─────────────────────────────────────────────
// Data Fetchers
// ─────────────────────────────────────────────
export async function generateWeeklyRecapData(userId: string): Promise<WeeklyRecapData> {
  const now = new Date();
  // Start of current week (Monday)
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user) throw new Error("User not found");

  const [expenseAgg, incomeAgg, categoryBreakdown, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "expense", date: { gte: weekStart, lte: weekEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "income", date: { gte: weekStart, lte: weekEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "expense", date: { gte: weekStart, lte: weekEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: "expense", date: { gte: weekStart, lte: weekEnd } },
      include: { category: true },
      orderBy: { amount: "desc" },
      take: 1,
    }),
  ]);

  const categories = await prisma.category.findMany({ where: { userId } });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalExpense = expenseAgg._sum.amount || 0;
  const topCategories = categoryBreakdown
    .map((item) => {
      const cat = categoryMap.get(item.categoryId);
      const amount = item._sum.amount || 0;
      return {
        categoryName: cat?.name || "Other",
        categoryColor: cat?.color || "#9B9284",
        categoryIcon: cat?.icon || "Circle",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const biggest = transactions[0];

  return {
    user,
    weekStart,
    weekEnd,
    totalExpense,
    totalIncome: incomeAgg._sum.amount || 0,
    netBalance: (incomeAgg._sum.amount || 0) - totalExpense,
    topCategories,
    transactionCount: categoryBreakdown.reduce((s, c) => s + 1, 0),
    biggestExpense: biggest
      ? { description: biggest.description, amount: biggest.amount, categoryName: biggest.category.name }
      : null,
  };
}

export async function generateMonthlyRecapData(userId: string): Promise<MonthlyRecapData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrevMonth = prevMonthDate;
  const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user) throw new Error("User not found");

  const [expenseAgg, incomeAgg, prevExpenseAgg, categoryBreakdown, budgets, savingsGoals] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "expense", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "income", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "expense", date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "expense", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({
      where: { userId, month },
      include: { category: true },
    }),
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const categories = await prisma.category.findMany({ where: { userId } });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalExpense = expenseAgg._sum.amount || 0;
  const prevMonthExpense = prevExpenseAgg._sum.amount || 0;
  const expenseChange =
    prevMonthExpense > 0 ? ((totalExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

  const categoryBreakdownMapped = categoryBreakdown
    .map((item) => {
      const cat = categoryMap.get(item.categoryId);
      const amount = item._sum.amount || 0;
      return {
        categoryName: cat?.name || "Other",
        categoryColor: cat?.color || "#9B9284",
        categoryIcon: cat?.icon || "Circle",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Budget status with spent per category
  const budgetStatus = budgets.map((b) => {
    const catBreakdown = categoryBreakdown.find((c) => c.categoryId === b.categoryId);
    const spent = catBreakdown?._sum.amount || 0;
    const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    let status: "safe" | "warning" | "danger" = "safe";
    if (percentage > 90) status = "danger";
    else if (percentage > 70) status = "warning";
    return {
      categoryName: b.category.name,
      limit: b.monthlyLimit,
      spent,
      percentage,
      status,
    };
  });

  const savingsProgress = savingsGoals.map((g) => ({
    name: g.name,
    currentAmount: g.currentAmount,
    targetAmount: g.targetAmount,
    percentage: g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0,
  }));

  return {
    user,
    month,
    monthLabel,
    totalExpense,
    totalIncome: incomeAgg._sum.amount || 0,
    netBalance: (incomeAgg._sum.amount || 0) - totalExpense,
    prevMonthExpense,
    expenseChange,
    categoryBreakdown: categoryBreakdownMapped,
    budgetStatus,
    savingsProgress,
    totalSavings: savingsGoals.reduce((s, g) => s + g.currentAmount, 0),
  };
}

// ─────────────────────────────────────────────
// HTML Email Builders
// ─────────────────────────────────────────────
function emailBase(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BudgetBee</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FFF8EE;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8EE;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#F5A623 0%,#E8901A 100%);border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-size:32px;">🐝</span>
                      <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">BudgetBee</span>
                    </div>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">Bee Smart with Your Money</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#ffffff;padding:0;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9B9284;font-size:12px;">
                Email ini dikirim secara otomatis oleh BudgetBee.<br/>
                Kamu bisa mengatur preferensi email di <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#F5A623;text-decoration:none;font-weight:600;">halaman Settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statBox(label: string, value: string, color: string, emoji: string): string {
  return `<td style="text-align:center;padding:0 8px;">
    <div style="background:#FFF8EE;border:1.5px solid #F5E6C8;border-radius:16px;padding:18px 12px;">
      <div style="font-size:24px;margin-bottom:6px;">${emoji}</div>
      <div style="font-size:20px;font-weight:900;color:${color};">${value}</div>
      <div style="font-size:11px;color:#9B9284;font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    </div>
  </td>`;
}

function categoryBar(name: string, amount: number, percentage: number, color: string): string {
  const pct = Math.min(Math.round(percentage), 100);
  return `<tr>
    <td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;font-weight:600;color:#4A3728;width:140px;">${name}</td>
          <td style="padding:0 12px;">
            <div style="background:#F5E6C8;border-radius:99px;height:8px;overflow:hidden;">
              <div style="background:${color};width:${pct}%;height:8px;border-radius:99px;"></div>
            </div>
          </td>
          <td style="font-size:12px;font-weight:700;color:#4A3728;white-space:nowrap;text-align:right;">${formatCurrency(amount)}</td>
          <td style="font-size:11px;color:#9B9284;white-space:nowrap;text-align:right;width:36px;">${pct}%</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function buildWeeklyRecapHtml(data: WeeklyRecapData): string {
  const { user, weekStart, weekEnd, totalExpense, totalIncome, netBalance, topCategories, biggestExpense } = data;

  const fmt = (d: Date) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(d);
  const weekRange = `${fmt(weekStart)} – ${fmt(weekEnd)}`;
  const isPositive = netBalance >= 0;

  const motivationMessages = isPositive
    ? ["Luar biasa! Keuanganmu sehat minggu ini. Pertahankan! 🎉", "Hebat! Pengeluaranmu terkontrol. Keep it up! 🏆", "Mantap! Saldo positif minggu ini. Terus semangat! 💪"]
    : ["Jangan khawatir, minggu depan lebih baik! Yuk evaluasi pengeluaranmu. 💡", "Setiap langkah kecil menuju keuangan sehat itu berarti. Tetap semangat! 🌱", "Coba tinjau pengeluaran terbesarmu dan cari cara berhemat minggu depan. 🔍"];
  const motivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  const categoriesHtml = topCategories.length > 0
    ? topCategories.map((c) => categoryBar(c.categoryName, c.amount, c.percentage, c.categoryColor)).join("")
    : `<tr><td style="text-align:center;color:#9B9284;font-size:13px;padding:16px 0;">Tidak ada transaksi pengeluaran minggu ini.</td></tr>`;

  const content = `
    <div style="padding:32px 40px;">
      <!-- Greeting -->
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#2C1810;">Rekap Mingguan 📋</h1>
      <p style="margin:0 0 24px;color:#9B9284;font-size:14px;">Hai, <strong style="color:#4A3728;">${user.name}</strong>! Ini ringkasan keuanganmu untuk</p>
      <div style="background:linear-gradient(135deg,#FFF1D6,#FFE4A8);border-radius:12px;padding:10px 16px;display:inline-block;margin-bottom:28px;">
        <span style="font-weight:700;color:#7A4F00;font-size:14px;">📅 ${weekRange}</span>
      </div>

      <!-- Stats -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          ${statBox("Pengeluaran", formatCurrency(totalExpense), "#E53E3E", "💸")}
          ${statBox("Pemasukan", formatCurrency(totalIncome), "#38A169", "💰")}
          ${statBox("Saldo Bersih", formatCurrency(Math.abs(netBalance)), isPositive ? "#38A169" : "#E53E3E", isPositive ? "📈" : "📉")}
        </tr>
      </table>

      ${topCategories.length > 0 ? `
      <!-- Top Categories -->
      <div style="margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:800;color:#2C1810;text-transform:uppercase;letter-spacing:0.5px;">🏷️ Top Kategori Pengeluaran</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${categoriesHtml}
        </table>
      </div>` : ""}

      ${biggestExpense ? `
      <!-- Biggest Expense -->
      <div style="background:#FFF8EE;border:1.5px solid #F5E6C8;border-radius:16px;padding:18px;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9B9284;text-transform:uppercase;letter-spacing:0.5px;">💳 Pengeluaran Terbesar</p>
        <p style="margin:0;font-size:16px;font-weight:800;color:#2C1810;">${biggestExpense.description}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#9B9284;">${biggestExpense.categoryName} &middot; <strong style="color:#E53E3E;">${formatCurrency(biggestExpense.amount)}</strong></p>
      </div>` : ""}

      <!-- Motivation -->
      <div style="background:linear-gradient(135deg,#F5A623,#E8901A);border-radius:16px;padding:20px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;line-height:1.6;">${motivation}</p>
      </div>
    </div>
  `;

  return emailBase(content, `Rekap mingguan ${weekRange}: Pengeluaran ${formatCurrency(totalExpense)}, Pemasukan ${formatCurrency(totalIncome)}`);
}

export function buildMonthlyRecapHtml(data: MonthlyRecapData): string {
  const { user, monthLabel, totalExpense, totalIncome, netBalance, prevMonthExpense, expenseChange, categoryBreakdown, budgetStatus, savingsProgress, totalSavings } = data;

  const isPositive = netBalance >= 0;
  const expenseDown = expenseChange <= 0;

  const categoriesHtml = categoryBreakdown.slice(0, 5).map((c) => categoryBar(c.categoryName, c.amount, c.percentage, c.categoryColor)).join("");

  const budgetStatusHtml = budgetStatus.length > 0
    ? budgetStatus.map((b) => {
        const statusColor = b.status === "safe" ? "#38A169" : b.status === "warning" ? "#D69E2E" : "#E53E3E";
        const statusEmoji = b.status === "safe" ? "✅" : b.status === "warning" ? "⚠️" : "🚨";
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #F5E6C8;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;font-weight:600;color:#4A3728;">${statusEmoji} ${b.categoryName}</td>
                <td style="text-align:right;">
                  <span style="font-size:12px;color:#9B9284;">${formatCurrency(b.spent)} / ${formatCurrency(b.limit)}</span>
                  <span style="margin-left:8px;background:${statusColor}20;color:${statusColor};font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;">${Math.round(b.percentage)}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td style="text-align:center;color:#9B9284;font-size:13px;padding:12px 0;">Belum ada budget yang diatur.</td></tr>`;

  const savingsHtml = savingsProgress.length > 0
    ? savingsProgress.slice(0, 3).map((s) => `
      <tr>
        <td style="padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;font-weight:600;color:#4A3728;">${s.name}</td>
              <td style="text-align:right;font-size:12px;color:#9B9284;">${formatCurrency(s.currentAmount)} / ${formatCurrency(s.targetAmount)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:6px;">
                <div style="background:#F5E6C8;border-radius:99px;height:6px;overflow:hidden;">
                  <div style="background:linear-gradient(90deg,#F5A623,#E8901A);width:${Math.round(s.percentage)}%;height:6px;border-radius:99px;"></div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join("")
    : `<tr><td style="text-align:center;color:#9B9284;font-size:13px;padding:12px 0;">Belum ada tabungan yang diatur.</td></tr>`;

  const content = `
    <div style="padding:32px 40px;">
      <!-- Greeting -->
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#2C1810;">Rekap Bulanan 📊</h1>
      <p style="margin:0 0 24px;color:#9B9284;font-size:14px;">Hai, <strong style="color:#4A3728;">${user.name}</strong>! Berikut ringkasan keuanganmu di</p>
      <div style="background:linear-gradient(135deg,#FFF1D6,#FFE4A8);border-radius:12px;padding:10px 16px;display:inline-block;margin-bottom:28px;">
        <span style="font-weight:700;color:#7A4F00;font-size:14px;">📅 ${monthLabel}</span>
      </div>

      <!-- Stats -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr>
          ${statBox("Pengeluaran", formatCurrency(totalExpense), "#E53E3E", "💸")}
          ${statBox("Pemasukan", formatCurrency(totalIncome), "#38A169", "💰")}
          ${statBox("Saldo Bersih", formatCurrency(Math.abs(netBalance)), isPositive ? "#38A169" : "#E53E3E", isPositive ? "📈" : "📉")}
        </tr>
      </table>

      <!-- vs Last Month -->
      <div style="text-align:center;margin-bottom:28px;">
        <span style="background:${expenseDown ? "#F0FFF4" : "#FFF5F5"};color:${expenseDown ? "#38A169" : "#E53E3E"};font-size:12px;font-weight:700;padding:6px 14px;border-radius:99px;border:1.5px solid ${expenseDown ? "#C6F6D5" : "#FED7D7"};">
          ${expenseDown ? "📉" : "📈"} Pengeluaran ${expenseDown ? "turun" : "naik"} ${Math.abs(Math.round(expenseChange))}% vs bulan lalu
        </span>
      </div>

      <!-- Category Breakdown -->
      ${categoryBreakdown.length > 0 ? `
      <div style="margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:800;color:#2C1810;text-transform:uppercase;letter-spacing:0.5px;">🏷️ Pengeluaran per Kategori</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${categoriesHtml}
        </table>
      </div>` : ""}

      <!-- Budget Status -->
      ${budgetStatus.length > 0 ? `
      <div style="margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:800;color:#2C1810;text-transform:uppercase;letter-spacing:0.5px;">🎯 Status Budget</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${budgetStatusHtml}
        </table>
      </div>` : ""}

      <!-- Savings -->
      <div style="background:#FFF8EE;border:1.5px solid #F5E6C8;border-radius:16px;padding:20px;margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:800;color:#2C1810;text-transform:uppercase;letter-spacing:0.5px;">🍯 Progress Tabungan</h2>
        ${totalSavings > 0 ? `<p style="margin:0 0 12px;font-size:13px;color:#9B9284;">Total tabungan: <strong style="color:#F5A623;">${formatCurrency(totalSavings)}</strong></p>` : ""}
        <table width="100%" cellpadding="0" cellspacing="0">
          ${savingsHtml}
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#E8901A);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;">
          Lihat Dashboard Lengkap →
        </a>
      </div>
    </div>
  `;

  return emailBase(content, `Rekap ${monthLabel}: Pengeluaran ${formatCurrency(totalExpense)}, Pemasukan ${formatCurrency(totalIncome)}, Saldo ${formatCurrency(Math.abs(netBalance))}`);
}

// ─────────────────────────────────────────────
// Senders
// ─────────────────────────────────────────────
export async function sendWeeklyRecapToUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await generateWeeklyRecapData(userId);
    const html = buildWeeklyRecapHtml(data);

    const fmt = (d: Date) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(d);
    const subject = `🐝 Rekap Mingguan BudgetBee – ${fmt(data.weekStart)} s/d ${fmt(data.weekEnd)}`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.user.email,
      subject,
      html,
    });

    if (error) return { success: false, error: error.message };

    // Update lastWeeklySent
    await prisma.emailPreference.upsert({
      where: { userId },
      update: { lastWeeklySent: new Date() },
      create: { userId, lastWeeklySent: new Date() },
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function sendMonthlyRecapToUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await generateMonthlyRecapData(userId);
    const html = buildMonthlyRecapHtml(data);
    const subject = `🐝 Rekap Bulanan BudgetBee – ${data.monthLabel}`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.user.email,
      subject,
      html,
    });

    if (error) return { success: false, error: error.message };

    await prisma.emailPreference.upsert({
      where: { userId },
      update: { lastMonthlySent: new Date() },
      create: { userId, lastMonthlySent: new Date() },
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function sendWeeklyRecapToAllUsers(): Promise<{ sent: number; failed: number }> {
  const users = await prisma.user.findMany({
    select: { id: true },
    where: {
      OR: [
        { emailPreference: null },
        { emailPreference: { weeklyRecap: true } },
      ],
    },
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const result = await sendWeeklyRecapToUser(user.id);
    if (result.success) sent++;
    else {
      failed++;
      console.error(`[WeeklyRecap] Failed for user ${user.id}:`, result.error);
    }
  }

  return { sent, failed };
}

export async function sendMonthlyRecapToAllUsers(): Promise<{ sent: number; failed: number }> {
  const users = await prisma.user.findMany({
    select: { id: true },
    where: {
      OR: [
        { emailPreference: null },
        { emailPreference: { monthlyRecap: true } },
      ],
    },
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const result = await sendMonthlyRecapToUser(user.id);
    if (result.success) sent++;
    else {
      failed++;
      console.error(`[MonthlyRecap] Failed for user ${user.id}:`, result.error);
    }
  }

  return { sent, failed };
}
