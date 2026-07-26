import { google } from "googleapis";

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  
  let baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!baseUrl) {
    baseUrl = "http://localhost:3000";
  }

  const redirectUri = `${baseUrl}/api/integrations/gmail/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
];
