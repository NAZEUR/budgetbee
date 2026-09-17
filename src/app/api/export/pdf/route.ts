import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, getMonthDisplayName } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // "YYYY-MM"

    const now = new Date();
    const targetMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [transactions, budgets, user] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.budget.findMany({
        where: { userId: session.user.id, month: targetMonth },
        include: { category: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      }),
    ]);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const netBalance = totalIncome - totalExpense;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BudgetBee Monthly Financial Report - ${targetMonth}</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .container { box-shadow: none !important; border: none !important; padding: 0 !important; }
    }
    body {
      font-family: "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 40px;
      background: #FFF8EE;
      color: #2C1810;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: white;
      padding: 48px;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: 1px solid #F5E6C8;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #F5A623;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 900;
      color: #2C1810;
      letter-spacing: -0.5px;
    }
    .report-title {
      text-align: right;
    }
    .report-title h2 { margin: 0; font-size: 22px; font-weight: 800; color: #2C1810; }
    .report-title p { margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #9B9284; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .card {
      background: #FFF8EE;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #F5E6C8;
    }
    .card label { font-size: 12px; text-transform: uppercase; font-weight: 800; color: #9B9284; letter-spacing: 0.5px; }
    .card p { font-size: 20px; font-weight: 900; margin: 8px 0 0 0; color: #2C1810; }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 16px;
      font-size: 14px;
      border: 1px solid #F5E6C8;
      border-radius: 12px;
      overflow: hidden;
    }
    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #F5E6C8;
    }
    tr:last-child td {
      border-bottom: none;
    }
    th {
      background: #F5E6C8;
      font-weight: 800;
      color: #4A3728;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    td { font-weight: 600; color: #4A3728; }
    .type-expense { color: #E53E3E; font-weight: 800; }
    .type-income { color: #38A169; font-weight: 800; }
    
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #F5A623, #E8901A);
      color: #ffffff;
      font-weight: 800;
      border: none;
      padding: 16px 32px;
      border-radius: 16px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(240, 180, 41, 0.4);
      font-size: 15px;
      transition: transform 0.2s;
    }
    .print-btn:hover { transform: translateY(-2px); }
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #9B9284;
      border-top: 1px dashed #F5E6C8;
      padding-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo_budgetbee.svg" alt="BudgetBee Logo" width="36" height="36" />
        <h1>BudgetBee</h1>
      </div>
      <div class="report-title">
        <h2>Financial Statement</h2>
        <p>${getMonthDisplayName(targetMonth)} &middot; User: ${user?.name || "User"}</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <label>Total Income</label>
        <p style="color: #34D399">${formatCurrency(totalIncome)}</p>
      </div>
      <div class="card">
        <label>Total Expenses</label>
        <p style="color: #F87171">${formatCurrency(totalExpense)}</p>
      </div>
      <div class="card">
        <label>Net Balance</label>
        <p>${formatCurrency(netBalance)}</p>
      </div>
      <div class="card">
        <label>Total Budget Limit</label>
        <p>${formatCurrency(totalBudget)}</p>
      </div>
    </div>

    <h3 style="margin-bottom: 12px; font-size: 16px; color: #1A1610;">Transaction Ledger (${transactions.length})</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${
          transactions.length === 0
            ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#7A6F5B;">No transactions recorded for this month.</td></tr>'
            : transactions
                .map(
                  (t) => `
          <tr>
            <td>${formatDate(t.date)}</td>
            <td class="${t.type === "expense" ? "type-expense" : "type-income"}">${t.type.toUpperCase()}</td>
            <td>${t.category.name}</td>
            <td>${t.description}</td>
            <td style="text-align: right; font-weight: bold;">${t.type === "expense" ? "-" : "+"}${formatCurrency(t.amount)}</td>
          </tr>`
                )
                .join("")
        }
      </tbody>
    </table>

    <div class="footer">
      <p>Generated automatically by BudgetBee • Bee Smart with Your Money</p>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">Print / Save PDF 🖨️</button>
</body>
</html>
`;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  }
}
