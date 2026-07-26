/**
 * Helper to call Grok AI API by default, with fallback to Gemini AI API
 * Supports both Grok (xAI) Keys (grok-...) and Gemini Keys (AIzaSy..., AQ....)
 */
export async function generateAiResponse(
  prompt: string,
  systemInstruction?: string
): Promise<string | null> {
  const apiKey = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GEMINI_API_KEY)?.trim();
  if (!apiKey) {
    console.warn("GROK_API_KEY, XAI_API_KEY, or GEMINI_API_KEY is missing in .env");
    return null;
  }

  // If it's a Gemini key, skip Grok and run Gemini directly
  const isGeminiKey = apiKey.startsWith("AIzaSy") || apiKey.startsWith("AQ.");

  if (!isGeminiKey) {
    // Try Grok (xAI) API
    try {
      const url = "https://api.x.ai/v1/chat/completions";
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];
      
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-beta", // Standard Grok API model name
          messages,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log("Successfully generated content using Grok API");
        return data.choices[0].message.content as string;
      } else {
        console.warn("Grok API response warning/error:", data.error || data);
      }
    } catch (error) {
      console.error("Error calling Grok API:", error);
    }
  }

  // Fallback to Gemini API (using GEMINI_API_KEY if the primary key was Grok, or using the apiKey itself)
  const geminiKey = (isGeminiKey ? apiKey : process.env.GEMINI_API_KEY?.trim());
  if (!geminiKey) {
    console.warn("No fallback Gemini API key available");
    return null;
  }

  const isAuthKey = geminiKey.startsWith("AQ.");
  const apiVersions = ["v1beta", "v1"];
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

  for (const apiVersion of apiVersions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${geminiKey}`;

        const payload: {
          contents: { parts: { text: string }[] }[];
          systemInstruction?: { parts: { text: string }[] };
        } = {
          contents: [{ parts: [{ text: prompt }] }],
        };

        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        };

        if (isAuthKey) {
          headers["Authorization"] = `Bearer ${geminiKey}`;
        }

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`Successfully generated content using Gemini ${apiVersion}/${model} (fallback)`);
          return data.candidates[0].content.parts[0].text as string;
        }
      } catch (error) {
        console.error(`Error calling Gemini API [${apiVersion}/${model}]:`, error);
      }
    }
  }

  return null;
}
