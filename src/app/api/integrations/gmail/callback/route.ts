import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthClient } from "@/lib/google";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const userId = session?.user?.id || state;

    if (!userId || !code) {
      return NextResponse.redirect(new URL("/settings?error=InvalidState", request.url));
    }

    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.warn("No refresh_token returned. User might need to revoke access first.");
    }

    // Upsert Gmail tokens for the user
    await prisma.gmailToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
      },
      create: {
        userId,
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || "",
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
      },
    });

    return NextResponse.redirect(new URL("/settings?gmailConnected=true", request.url));
  } catch (error) {
    console.error("Error in Gmail OAuth callback:", error);
    return NextResponse.redirect(new URL("/settings?error=GmailConnectFailed", request.url));
  }
}
