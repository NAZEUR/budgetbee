import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleOAuthClient, GMAIL_SCOPES } from "@/lib/google";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = getGoogleOAuthClient();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SCOPES,
      state: session.user.id,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google Auth URL:", error);
    return NextResponse.json(
      { error: "Failed to connect to Google" },
      { status: 500 }
    );
  }
}
