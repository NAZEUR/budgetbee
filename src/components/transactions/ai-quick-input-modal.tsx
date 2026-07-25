"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AiQuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AiQuickInputModal({ isOpen, onClose, onSuccess }: AiQuickInputModalProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<{
    amount: number;
    description: string;
    type: "expense" | "income";
    categoryId: string;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setParsedData(null);
    setStatusMsg("");

    try {
      const res = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (res.ok && data.amount) {
        setParsedData(data);
      } else {
        setStatusMsg("Could not extract transaction details. Try typing e.g. 'Jajan McD 50rb'");
      }
    } catch {
      setStatusMsg("Error connecting to AI Parser.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedData) return;
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedData.amount,
          description: parsedData.description,
          type: parsedData.type,
          categoryId: parsedData.categoryId,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setInputText("");
        setParsedData(null);
      }
    } catch (err) {
      console.error("Failed to save AI transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Quick Transaction ⚡" size="md">
      <div className="space-y-4">
        <p className="text-sm text-hive-500 font-medium">
          Type your transaction in natural language (e.g., <span className="font-bold text-hive-800">&quot;Jajan boba starbucks 45rb kemarin&quot;</span> or <span className="font-bold text-hive-800">&quot;Terima gaji 5 juta&quot;</span>):
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="e.g. Beli bensin Pertamax 50rb"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParse()}
            className="flex-1"
          />
          <Button onClick={handleParse} isLoading={loading} disabled={!inputText.trim()}>
            <Sparkles className="w-4 h-4" />
            Extract
          </Button>
        </div>

        {statusMsg && <p className="text-xs text-status-danger font-bold">{statusMsg}</p>}

        {parsedData && (
          <div className="p-4 rounded-2xl bg-honey-50 border border-honey-300 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-honey-200 pb-2">
              <span className="text-xs font-bold text-hive-500 uppercase tracking-wider">AI Extracted Result</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-honey-200 text-hive-800">
                {parsedData.type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-hive-400 font-medium">Amount</p>
                <p className="font-extrabold text-hive-900 text-base">{formatCurrency(parsedData.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-hive-400 font-medium">Description</p>
                <p className="font-bold text-hive-800 truncate">{parsedData.description}</p>
              </div>
            </div>

            <Button onClick={handleConfirmSave} isLoading={loading} className="w-full mt-2" size="md">
              <CheckCircle2 className="w-4 h-4" />
              Save Transaction
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
