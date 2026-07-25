/**
 * Helper to call Gemini AI API with fallback models & endpoints
 * Supports both Standard Keys (AIzaSy...) and Auth Keys (AQ.Ab8RN...)
 */
export async function generateAiResponse(
  prompt: string,
  systemInstruction?: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing in .env");
    return null;
  }

  const isAuthKey = apiKey.startsWith("AQ.");
  const apiVersions = ["v1beta", "v1"];
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

  for (const apiVersion of apiVersions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

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
          "x-goog-api-key": apiKey,
        };

        // For Google AI Studio Auth Keys (AQ.Ab8RN...), attach Authorization Bearer token
        if (isAuthKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`Successfully generated content using ${apiVersion}/${model}`);
          return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          console.warn(`Gemini API [${apiVersion}/${model}] notice:`, data.error.message);
        }
      } catch (error) {
        console.error(`Error calling Gemini API [${apiVersion}/${model}]:`, error);
      }
    }
  }

  return null;
}
