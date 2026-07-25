import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with default categories
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          create: [
            ...DEFAULT_CATEGORIES.map((cat) => ({
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              isDefault: true,
            })),
            ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              isDefault: true,
            })),
          ],
        },
      },
    });

    return NextResponse.json(
      { message: "Account created successfully! Welcome to the hive! 🐝", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error && (error.message.includes("ECONNREFUSED") || error.message.includes("database") || error.message.includes("password authentication") || error.message.includes("Can't reach database"))
        ? "Database connection failed. Please update DATABASE_URL in .env with your PostgreSQL credentials (Supabase/Neon/Local)."
        : "Failed to create account. Please check database connection in .env.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
