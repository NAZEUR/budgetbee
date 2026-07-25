import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required (YYYY-MM)" },
        { status: 400 }
      );
    }

    // Get budgets for the month
    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id, month },
      include: { category: true },
    });

    // Calculate spent amounts for each category in this month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const spentByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: session.user.id,
        type: "expense",
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { amount: true },
    });

    const spentMap = new Map(
      spentByCategory.map((s) => [s.categoryId, s._sum.amount || 0])
    );

    const budgetsWithSpent = budgets.map((budget) => ({
      ...budget,
      spent: spentMap.get(budget.categoryId) || 0,
    }));

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = budgetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Upsert: create or update budget for this category+month
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId: session.user.id,
          categoryId: result.data.categoryId,
          month: result.data.month,
        },
      },
      update: { monthlyLimit: result.data.monthlyLimit },
      create: {
        userId: session.user.id,
        ...result.data,
      },
      include: { category: true },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    await prisma.budget.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: "Budget deleted" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
