import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncUserGmailReceipts } from "@/services/gmail.service";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncUserGmailReceipts(session.user.id);

    return NextResponse.json({
      message: `Successfully synced ${result.syncedCount} new transaction(s) from Gmail! 📧`,
      ...result,
    });
  } catch (error: unknown) {
    console.error("Error syncing Gmail receipts:", error);
    const msg = error instanceof Error ? error.message : "Failed to sync Gmail receipts";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await prisma.gmailToken.findUnique({
      where: { userId: session.user.id },
      select: { lastSyncedAt: true, id: true },
    });

    return NextResponse.json({
      isConnected: !!token,
      lastSyncedAt: token?.lastSyncedAt || null,
    });
  } catch (error) {
    console.error("Error checking Gmail connection:", error);
    return NextResponse.json({ isConnected: false }, { status: 500 });
  }
}
