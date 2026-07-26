import { NextRequest, NextResponse } from "next/server";
import { sendMonthlyRecapToAllUsers } from "@/services/email-recap.service";

/**
 * GET /api/cron/monthly-recap
 *
 * Endpoint untuk dijadwalkan via cron-job.org atau Vercel Cron.
 * Kirim rekap bulanan ke semua user yang mengaktifkan fitur ini.
 *
 * Keamanan: Harus menyertakan header Authorization: Bearer <CRON_SECRET>
 *
 * Konfigurasi cron-job.org:
 * - URL: https://yourdomain.com/api/cron/monthly-recap
 * - Schedule: Tanggal 1 setiap bulan jam 08:00 WIB (01:00 UTC)
 * - Method: GET
 * - Header: Authorization: Bearer <nilai CRON_SECRET di .env>
 */
export async function GET(request: NextRequest) {
  // Verifikasi cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting monthly recap job...");
    const result = await sendMonthlyRecapToAllUsers();
    console.log(`[Cron] Monthly recap done: ${result.sent} sent, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Monthly recap sent to ${result.sent} users. ${result.failed} failed.`,
      ...result,
    });
  } catch (error) {
    console.error("[Cron] Monthly recap failed:", error);
    return NextResponse.json(
      { error: "Failed to send monthly recap" },
      { status: 500 }
    );
  }
}
