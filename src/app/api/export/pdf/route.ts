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
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 40px;
      background: #FFFBEA;
      color: #2B2416;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #F5EFDC;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #F0B429;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h1 {
      margin: 0;
      font-size: 26px;
      color: #1A1610;
    }
    .brand span { color: #F0B429; }
    .report-title {
      text-align: right;
    }
    .report-title h2 { margin: 0; font-size: 20px; color: #1A1610; }
    .report-title p { margin: 4px 0 0 0; font-size: 13px; color: #7A6F5B; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .card {
      background: #FFFBEA;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid #F5EFDC;
    }
    .card label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #7A6F5B; }
    .card p { font-size: 18px; font-weight: 800; margin: 6px 0 0 0; color: #1A1610; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #F5EFDC;
    }
    th {
      background: #FFF8E1;
      font-weight: bold;
      color: #352F22;
      text-transform: uppercase;
      font-size: 11px;
    }
    .type-expense { color: #F87171; font-weight: bold; }
    .type-income { color: #34D399; font-weight: bold; }
    
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #F0B429;
      color: #1A1610;
      font-weight: bold;
      border: none;
      padding: 14px 28px;
      border-radius: 16px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(240, 180, 41, 0.4);
      font-size: 15px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #7A6F5B;
      border-top: 1px solid #F5EFDC;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <h1>Budget<span>Bee</span> 🐝</h1>
      </div>
      <div class="report-title">
        <h2>Financial Statement</h2>
        <p>${getMonthDisplayName(targetMonth)} • User: ${user?.name || "User"}</p>
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
