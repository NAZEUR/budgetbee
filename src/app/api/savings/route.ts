import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savingsGoalSchema, depositSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: session.user.id },
      include: {
        deposits: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savingsGoals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings goals" },
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

    // Check if this is a deposit or a new goal
    if (body.savingsGoalId) {
      // This is a deposit
      const result = depositSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }

      // Verify the goal belongs to the user
      const goal = await prisma.savingsGoal.findFirst({
        where: { id: body.savingsGoalId, userId: session.user.id },
      });

      if (!goal) {
        return NextResponse.json(
          { error: "Savings goal not found" },
          { status: 404 }
        );
      }

      // Create deposit and update currentAmount
      const [deposit] = await prisma.$transaction([
        prisma.savingsDeposit.create({
          data: {
            savingsGoalId: body.savingsGoalId,
            amount: result.data.amount,
            date: new Date(result.data.date),
            note: result.data.note || null,
          },
        }),
        prisma.savingsGoal.update({
          where: { id: body.savingsGoalId },
          data: {
            currentAmount: { increment: result.data.amount },
          },
        }),
      ]);

      return NextResponse.json(deposit, { status: 201 });
    } else {
      // This is a new savings goal
      const result = savingsGoalSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }

      const goal = await prisma.savingsGoal.create({
        data: {
          userId: session.user.id,
          name: result.data.name,
          targetAmount: result.data.targetAmount,
          targetDate: result.data.targetDate
            ? new Date(result.data.targetDate)
            : null,
          color: result.data.color,
          icon: result.data.icon,
        },
      });

      return NextResponse.json(goal, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating savings:", error);
    return NextResponse.json(
      { error: "Failed to create savings entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const result = savingsGoalSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.update({
      where: { id, userId: session.user.id },
      data: {
        name: result.data.name,
        targetAmount: result.data.targetAmount,
        targetDate: result.data.targetDate
          ? new Date(result.data.targetDate)
          : null,
        color: result.data.color,
        icon: result.data.icon,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating savings goal:", error);
    return NextResponse.json(
      { error: "Failed to update savings goal" },
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
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Delete deposits first, then goal
    await prisma.$transaction([
      prisma.savingsDeposit.deleteMany({
        where: { savingsGoalId: id },
      }),
      prisma.savingsGoal.delete({
        where: { id, userId: session.user.id },
      }),
    ]);

    return NextResponse.json({ message: "Savings goal deleted" });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    return NextResponse.json(
      { error: "Failed to delete savings goal" },
      { status: 500 }
    );
  }
}
