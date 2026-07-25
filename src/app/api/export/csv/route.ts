import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // format "YYYY-MM"

    const now = new Date();
    const targetMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    // Build CSV Content
    const headers = ["Date", "Type", "Category", "Description", "Amount (IDR)"];
    const rows = transactions.map((t) => [
      `"${formatDate(t.date)}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.category.name.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toString(),
    ]);

    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="budgetbee_report_${targetMonth}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV report:", error);
    return NextResponse.json({ error: "Failed to export CSV report" }, { status: 500 });
  }
}
