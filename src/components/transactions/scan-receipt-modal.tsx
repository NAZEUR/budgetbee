"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Camera, Upload, CheckCircle2, X, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScanReceiptModal({ isOpen, onClose, onSuccess }: ScanReceiptModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<{
    amount: number;
    description: string;
    type: "expense";
    categoryId: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMsg("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setMimeType(file.type);
      setStatusMsg("");
      setParsedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleParseReceipt = async () => {
    if (!imageBase64 || !mimeType) return;
    
    setLoading(true);
    setStatusMsg("");
    setParsedData(null);

    try {
      const res = await fetch("/api/ai/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mimeType }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.amount) {
        setParsedData(data);
      } else {
        setStatusMsg(data.error || "Could not read the receipt clearly. Please try a better photo.");
      }
    } catch {
      setStatusMsg("Error connecting to AI Vision. Please try again.");
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
        handleCloseModal();
      } else {
        setStatusMsg("Failed to save transaction.");
      }
    } catch (err) {
      console.error("Failed to save AI transaction:", err);
      setStatusMsg("Failed to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setImagePreview(null);
    setImageBase64(null);
    setParsedData(null);
    setStatusMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Scan Receipt 📸" size="md">
      <div className="space-y-4">
        {!imagePreview ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-honey-300 rounded-2xl p-8 bg-honey-50/50 hover:bg-honey-50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-honey-200/50 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-honey-600" />
            </div>
            <p className="text-sm font-semibold text-hive-800 text-center mb-1">
              Take a photo or upload a receipt
            </p>
            <p className="text-xs text-hive-500 text-center mb-6 max-w-[250px]">
              Our AI will automatically extract the total amount and merchant name.
            </p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border-2 border-honey-200 bg-black/5 aspect-[3/4] sm:aspect-[4/3] flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Receipt Preview"
                className="max-w-full max-h-[300px] object-contain"
              />
              {!parsedData && !loading && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!parsedData ? (
              <Button onClick={handleParseReceipt} isLoading={loading} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Receipt
              </Button>
            ) : (
              <div className="p-4 rounded-2xl bg-honey-50 border border-honey-300 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-honey-200 pb-2">
                  <span className="text-xs font-bold text-hive-500 uppercase tracking-wider">AI Extracted Result</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-honey-200 text-hive-800">
                    EXPENSE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-hive-400 font-medium">Amount</p>
                    <p className="font-extrabold text-hive-900 text-lg">{formatCurrency(parsedData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-hive-400 font-medium">Merchant</p>
                    <p className="font-bold text-hive-800 truncate">{parsedData.description}</p>
                  </div>
                </div>

                <Button onClick={handleConfirmSave} isLoading={loading} className="w-full mt-2" size="md">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Transaction
                </Button>
              </div>
            )}
          </div>
        )}

        {statusMsg && <p className="text-xs text-status-danger font-bold text-center mt-2">{statusMsg}</p>}
      </div>
    </Modal>
  );
}
