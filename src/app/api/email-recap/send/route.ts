import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendWeeklyRecapToUser, sendMonthlyRecapToUser } from "@/services/email-recap.service";

/**
 * POST /api/email-recap/send
 *
 * Manual trigger untuk test pengiriman email rekap untuk user yang sedang login.
 * Body: { type: "weekly" | "monthly" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body as { type: "weekly" | "monthly" };

    if (!type || !["weekly", "monthly"].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "weekly" or "monthly".' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    if (type === "weekly") {
      const result = await sendWeeklyRecapToUser(userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: "Rekap mingguan berhasil dikirim! Cek inbox email kamu.",
      });
    } else {
      const result = await sendMonthlyRecapToUser(userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: "Rekap bulanan berhasil dikirim! Cek inbox email kamu.",
      });
    }
  } catch (error) {
    console.error("[EmailRecap] Manual send failed:", error);
    return NextResponse.json(
      { error: "Gagal mengirim email. Pastikan RESEND_API_KEY sudah dikonfigurasi." },
      { status: 500 }
    );
  }
}
