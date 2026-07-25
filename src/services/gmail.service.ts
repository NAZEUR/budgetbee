import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthClient } from "@/lib/google";
import { createTransaction } from "./transaction.service";

interface ParsedReceipt {
  amount: number;
  description: string;
  date: Date;
  merchant: string;
}

/**
 * Helper to auto-categorize description based on keywords
 */
function determineCategory(description: string, categories: { id: string; name: string }[]): string {
  const lower = description.toLowerCase();
  
  const rules: { keywords: string[]; categoryName: string }[] = [
    { keywords: ["gofood", "grabfood", "kopi", "resto", "makanan", "starbucks", "mcd", "kfc", "boba", "kuliner", "food"], categoryName: "Food & Drinks" },
    { keywords: ["gojek", "grab", "go-car", "go-ride", "bensin", "pertamina", "parkir", "toll", "e-toll", "transport"], categoryName: "Transportation" },
    { keywords: ["tokopedia", "shopee", "blibli", "lazada", "zalora", "uniqlo", "baju", "shopping", "store"], categoryName: "Shopping" },
    { keywords: ["pln", "pdam", "indihome", "biznet", "pulsa", "telkomsel", "kuota", "listrik", "air", "bill"], categoryName: "Bills & Utilities" },
    { keywords: ["netflix", "spotify", "cinema", "xxi", "game", "steam", "playstation", "cinema21"], categoryName: "Entertainment" },
    { keywords: ["apotek", "dokter", "halodoc", "rumah sakit", "obat", "health"], categoryName: "Health" },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const match = categories.find((c) => c.name.toLowerCase() === rule.categoryName.toLowerCase());
      if (match) return match.id;
    }
  }

  // Default to "Other" or first category
  const otherCat = categories.find((c) => c.name.toLowerCase().includes("other") || c.name.toLowerCase().includes("lain"));
  return otherCat ? otherCat.id : categories[0]?.id || "";
}

/**
 * Parse email body text to extract amount, merchant, and date
 */
function parseEmailReceiptContent(subject: string, bodyText: string, dateHeader: string): ParsedReceipt | null {
  const text = `${subject}\n${bodyText}`;

  // 1. Amount Extraction (Look for Rp XX.XXX, IDR XX.XXX, or RpXX.XXX)
  const amountRegex = /(?:Rp|IDR)\s*[\.\,]?\s*([0-9]{1,3}(?:[\.\,][0-9]{3})+|[0-9]{4,})/gi;
  const matches = [...text.matchAll(amountRegex)];
  
  if (matches.length === 0) return null;

  // Extract numeric value from match
  const rawAmountStr = matches[0][1].replace(/[\.\,]/g, "");
  const amount = parseFloat(rawAmountStr);

  if (isNaN(amount) || amount <= 0) return null;

  // 2. Merchant / Subject Description
  let merchant = subject.replace(/^(Fwd:|Re:|Invoice|Receipt|Pembayaran|Bukti Pembayaran|Nota|Order|Pesanan)\s*:?/i, "").trim();
  if (!merchant || merchant.length < 3) {
    merchant = "Online Receipt Payment";
  }

  // 3. Date
  const date = dateHeader ? new Date(dateHeader) : new Date();

  return {
    amount,
    description: merchant.slice(0, 100),
    date,
    merchant,
  };
}

/**
 * Sync Gmail payment receipts for a user
 */
export async function syncUserGmailReceipts(userId: string) {
  const token = await prisma.gmailToken.findUnique({
    where: { userId },
  });

  if (!token || !token.refreshToken) {
    throw new Error("Gmail account not connected. Please connect Gmail first.");
  }

  const oauth2Client = getGoogleOAuthClient();
  oauth2Client.setCredentials({
    access_token: token.accessToken || undefined,
    refresh_token: token.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Get user categories for auto-matching
  const userCategories = await prisma.category.findMany({
    where: { userId },
  });

  // Search query for payment receipts (searches across full message text & subjects)
  const query = 'pembayaran OR nota OR receipt OR invoice OR "bukti transfer" OR shopee OR tokopedia OR gopay OR bca OR ovo OR grab OR gojek OR pesanan OR order OR kuitansi OR bill';
  
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 30,
  });

  const messages = response.data.messages || [];
  let syncedCount = 0;

  for (const msg of messages) {
    if (!msg.id) continue;

    const msgDetail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const headers = msgDetail.data.payload?.headers || [];
    const subjectHeader = headers.find((h: { name?: string | null; value?: string | null }) => h.name?.toLowerCase() === "subject")?.value || "";
    const dateHeader = headers.find((h: { name?: string | null; value?: string | null }) => h.name?.toLowerCase() === "date")?.value || "";

    // Extract body text snippet or payload body
    const bodyText = msgDetail.data.snippet || "";

    const parsed = parseEmailReceiptContent(subjectHeader, bodyText, dateHeader);
    if (!parsed) continue;

    // Check if transaction already exists for this exact amount & date/description
    const existing = await prisma.transaction.findFirst({
      where: {
        userId,
        amount: parsed.amount,
        description: parsed.description,
      },
    });

    if (!existing) {
      const categoryId = determineCategory(parsed.description, userCategories);
      await createTransaction({
        userId,
        categoryId,
        amount: parsed.amount,
        description: parsed.description,
        type: "expense",
        date: parsed.date,
      });
      syncedCount++;
    }
  }

  // Update lastSyncedAt timestamp
  await prisma.gmailToken.update({
    where: { userId },
    data: { lastSyncedAt: new Date() },
  });

  return { syncedCount, totalMessagesChecked: messages.length };
}
