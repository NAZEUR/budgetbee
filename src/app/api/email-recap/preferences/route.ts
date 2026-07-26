import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/email-recap/preferences
 * Ambil preferensi email recap user yang sedang login.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pref = await prisma.emailPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Return default values jika belum ada preferensi
    return NextResponse.json({
      weeklyRecap: pref?.weeklyRecap ?? true,
      monthlyRecap: pref?.monthlyRecap ?? true,
      dayOfWeek: pref?.dayOfWeek ?? 1,
      sendHour: pref?.sendHour ?? 8,
      lastWeeklySent: pref?.lastWeeklySent ?? null,
      lastMonthlySent: pref?.lastMonthlySent ?? null,
    });
  } catch (error) {
    console.error("[EmailPreferences] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

/**
 * PUT /api/email-recap/preferences
 * Update preferensi email recap user yang sedang login.
 * Body: { weeklyRecap?: boolean, monthlyRecap?: boolean, dayOfWeek?: number, sendHour?: number }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weeklyRecap, monthlyRecap, dayOfWeek, sendHour } = body;

    const pref = await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...(typeof weeklyRecap === "boolean" && { weeklyRecap }),
        ...(typeof monthlyRecap === "boolean" && { monthlyRecap }),
        ...(typeof dayOfWeek === "number" && { dayOfWeek }),
        ...(typeof sendHour === "number" && { sendHour }),
      },
      create: {
        userId: session.user.id,
        weeklyRecap: weeklyRecap ?? true,
        monthlyRecap: monthlyRecap ?? true,
        dayOfWeek: dayOfWeek ?? 1,
        sendHour: sendHour ?? 8,
      },
    });

    return NextResponse.json({
      success: true,
      weeklyRecap: pref.weeklyRecap,
      monthlyRecap: pref.monthlyRecap,
      dayOfWeek: pref.dayOfWeek,
      sendHour: pref.sendHour,
    });
  } catch (error) {
    console.error("[EmailPreferences] PUT failed:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
