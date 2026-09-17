"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Bot } from "lucide-react";
import Image from "next/image";

export function AiInsightsWidget() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const fetchInsights = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/ai/insights");
      const data = await res.json();
      if (res.ok && Array.isArray(data.insights)) {
        setInsights(data.insights);
        setIsAiGenerated(!!data.isAiGenerated);
        localStorage.setItem("budgetbee_insights", JSON.stringify({
          insights: data.insights,
          isAiGenerated: !!data.isAiGenerated,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("budgetbee_insights");
    let hasValidCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.insights && parsed.insights.length > 0) {
          setInsights(parsed.insights);
          setIsAiGenerated(parsed.isAiGenerated);
          setLoading(false);
          hasValidCache = true;
        }
      } catch (e) {
        console.error("Failed to parse cached insights", e);
      }
    }

    if (!hasValidCache) {
      fetchInsights();
    } else {
      // Refresh in background if cache is older than 1 hour
      try {
        const parsed = JSON.parse(cached!);
        if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
          fetchInsights(true);
        }
      } catch (e) {}
    }
  }, []);

  return (
    <Card className="relative overflow-hidden border border-honey-300/60 bg-gradient-to-br from-honey-50/90 via-white to-honey-100/40 shadow-honey/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-honey-400/20 flex items-center justify-center border border-honey-300/50">
            <Image
              src="/logo_budgetbee.svg"
              alt="HiveMind AI"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-hive-900 font-extrabold text-base sm:text-lg">
                HiveMind AI Financial Coach
              </CardTitle>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-honey-200 text-hive-800 border border-honey-300">
                <Sparkles className="w-3 h-3 text-honey-600 animate-pulse" />
                {isAiGenerated ? "Gemini AI" : "Smart Rules"}
              </span>
            </div>
            <p className="text-xs text-hive-500 font-medium">
              Real-time AI analysis & personalized saving tips for this month
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          isLoading={loading}
          className="text-hive-600 hover:text-hive-900"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2 py-2">
          <div className="h-4 bg-honey-200/50 rounded-lg animate-pulse w-3/4" />
          <div className="h-4 bg-honey-200/50 rounded-lg animate-pulse w-5/6" />
          <div className="h-4 bg-honey-200/50 rounded-lg animate-pulse w-2/3" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/80 border border-honey-200/60 shadow-xs text-xs sm:text-sm font-semibold text-hive-800 leading-relaxed flex items-start gap-2.5"
            >
              <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
              <span className="flex-1">{tip.replace(/^[🎯🐝💡⚠️✨\s]+/, "")}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
