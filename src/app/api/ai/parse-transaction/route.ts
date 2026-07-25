import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiResponse } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    });

    const categoryListStr = categories.map((c) => `ID: "${c.id}" (Name: "${c.name}")`).join(", ");

    const systemInstruction = `Kamu adalah parser transaksi keuangan cerdas.
Tugasmu adalah mengubah teks bahasa Indonesia mentah menjadi objek JSON transaksi yang valid.
Daftar Kategori User: [${categoryListStr}]

Output WAJIB berupa JSON murni tanpa markdown wrapper atau penjelasan lain, dengan format persis:
{
  "amount": number,
  "description": string,
  "type": "expense" | "income",
  "categoryId": string
}

Aturan nominal:
- "45rb" / "45k" = 45000
- "1.5jt" / "1,5juta" = 1500000
- Jika tipe transaksi adalah gaji/terima/dapat/inflow, gunakan type="income". Selain itu default "expense".
- Pilih categoryId yang paling cocok dari daftar kategori di atas. Jika tidak ada yang cocok, gunakan categoryId kategori "Other" / "Lainnya" / kategori pertama.`;

    const aiResponse = await generateAiResponse(
      `Ekstrak transaksi dari kalimat ini: "${text}"`,
      systemInstruction
    );

    if (aiResponse) {
      try {
        const cleanedJsonStr = aiResponse.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedJsonStr);
        if (parsed.amount && parsed.description) {
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.warn("Failed to parse Gemini JSON output, falling back to rule engine:", err);
      }
    }

    // Fallback rule-based parsing engine if AI is unavailable
    const lower = text.toLowerCase();
    
    // Extract amount
    let amount = 0;
    const jtMatch = lower.match(/([0-9]+(?:[\.\,][0-9]+)?)\s*(?:jt|juta)/);
    const rbMatch = lower.match(/([0-9]+(?:[\.\,][0-9]+)?)\s*(?:rb|ribu|k)/);
    const numMatch = lower.match(/(?:rp|idr)?\s*([0-9]{1,3}(?:[\.\,][0-9]{3})+|[0-9]+)/);

    if (jtMatch) {
      amount = parseFloat(jtMatch[1].replace(",", ".")) * 1000000;
    } else if (rbMatch) {
      amount = parseFloat(rbMatch[1].replace(",", ".")) * 1000;
    } else if (numMatch) {
      amount = parseFloat(numMatch[1].replace(/[\.\,]/g, ""));
    }

    const type = lower.includes("gaji") || lower.includes("terima") || lower.includes("dapat") || lower.includes("transfer masuk") ? "income" : "expense";

    let matchedCategory = categories[0]?.id || "";
    if (lower.includes("makan") || lower.includes("kopi") || lower.includes("boba") || lower.includes("starbucks") || lower.includes("food")) {
      const match = categories.find((c) => c.name.toLowerCase().includes("food") || c.name.toLowerCase().includes("makan"));
      if (match) matchedCategory = match.id;
    } else if (lower.includes("bensin") || lower.includes("gojek") || lower.includes("grab") || lower.includes("parkir")) {
      const match = categories.find((c) => c.name.toLowerCase().includes("transport"));
      if (match) matchedCategory = match.id;
    }

    return NextResponse.json({
      amount: amount || 50000,
      description: text.slice(0, 60),
      type,
      categoryId: matchedCategory,
    });
  } catch (error) {
    console.error("Error in AI Parse Transaction:", error);
    return NextResponse.json({ error: "Failed to parse transaction" }, { status: 500 });
  }
}
