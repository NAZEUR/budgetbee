import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiResponse } from "@/lib/gemini";

export const maxDuration = 30; // 30 seconds for Vercel

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText) {
      return NextResponse.json({ error: "extractedText is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    });

    const categoryListStr = categories.map((c) => `ID: "${c.id}" (Name: "${c.name}")`).join(", ");

    const systemInstruction = `Kamu adalah AI pengekstrak struk belanja (receipt parser).
Tugasmu adalah membaca teks mentah hasil OCR (Optical Character Recognition) dari sebuah struk dan mengekstrak total belanja, deskripsi merchant, dan mengkategorikannya.
Daftar Kategori User: [${categoryListStr}]

Output WAJIB berupa JSON murni tanpa markdown wrapper atau penjelasan lain, dengan format persis:
{
  "amount": number,
  "description": string,
  "type": "expense",
  "categoryId": string
}

Aturan:
- "amount" adalah total akhir tagihan (grand total) dalam angka (tanpa Rp atau koma/titik ribuan).
- "description" adalah nama merchant/toko atau ringkasan pembelian (misal: "Indomaret", "Starbucks", "Makan Siang XYZ").
- "type" selalu "expense".
- Pilih categoryId yang paling cocok dari daftar kategori di atas berdasarkan nama merchant atau item di struk. Jika tidak ada yang cocok, gunakan categoryId kategori "Lainnya" / "Other" / kategori pertama.`;

    const aiResponse = await generateAiResponse(
      `Tolong analisis teks hasil OCR dari struk ini:\n\n"${extractedText}"\n\nAbaikan teks yang tidak terbaca dengan jelas (typo), cukup fokus cari Total Belanja dan Nama Tokonya.`,
      systemInstruction
    );

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.amount && parsed.description) {
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn("Failed to parse Gemini Vision JSON output:", err);
        return NextResponse.json({ error: "Failed to parse receipt correctly" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Could not read the receipt" }, { status: 500 });
  } catch (error) {
    console.error("Error in AI Parse Receipt:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
