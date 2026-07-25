import { google } from "googleapis";

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = `${process.env.AUTH_URL || "http://localhost:3000"}/api/integrations/gmail/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
];
