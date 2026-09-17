"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "beebot";
  text: string;
}

export function BeeBotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "beebot",
      text: "Bzz! 🐝 Hai! Aku BeeBot, asisten keuangan pribadimu. Ada yang bisa aku bantu seputar budget atau tabunganmu hari ini? 🍯",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "beebot",
            text: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "beebot",
            text: "Maaf, terjadi masalah koneksi ke BeeBot. Coba lagi sebentar ya! 🐝",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "beebot",
          text: "Bzz! Maaf ada kendala jaringan.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Mascot Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        {/* Tooltip Speech Bubble (Visible when closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-hive-900 text-cream font-bold text-xs px-3 py-1.5 rounded-2xl shadow-lg border border-honey-400/40 flex items-center gap-1.5 select-none hover:bg-hive-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-honey-400" />
            <span>Tanya BeeBot AI! 🐝</span>
          </div>
        )}

        {/* Outer Pulsing Glow Ring on Yellow Circle */}
        <div className="relative">
          {!isOpen && (
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-honey-300 via-honey-400 to-honey-500 opacity-80 blur-sm" />
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 rounded-full bg-hive-900 border-2 border-honey-400 shadow-honey hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center overflow-hidden"
            title="Chat with BeeBot AI"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-honey-400" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-honey-400 shadow-inner">
                <Image
                  src="/logo_budgetbee.svg"
                  alt="BeeBot AI"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-300"
                />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Chat Drawer Widget */}
      {isOpen && (
        <div className="fixed bottom-22 right-3 left-3 sm:left-auto sm:right-6 z-50 w-auto sm:w-[390px] h-[500px] max-h-[75vh] bg-white rounded-3xl shadow-2xl border-2 border-honey-300 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-hive-900 text-cream px-4 py-3.5 border-b border-honey-400/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-sm border border-honey-400">
                <Image
                  src="/logo_budgetbee.svg"
                  alt="BeeBot Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                  BeeBot AI Assistant
                  <Sparkles className="w-4 h-4 text-honey-400" />
                </h3>
                <p className="text-[11px] text-honey-300 font-medium">Financial Mascot Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-honey-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-cream-dark/30 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "beebot" && (
                  <div className="w-8 h-8 rounded-2xl bg-white border border-honey-300 p-1 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Image
                      src="/logo_budgetbee.svg"
                      alt="BeeBot"
                      width={20}
                      height={20}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-hive-900 text-cream font-medium rounded-br-none shadow-xs"
                      : "bg-white border border-honey-200/80 text-hive-900 font-semibold shadow-xs leading-relaxed"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start items-center text-xs text-hive-500 font-bold p-2">
                <div className="w-7 h-7 rounded-xl bg-white border border-honey-300 flex items-center justify-center animate-spin p-1">
                  <Image
                    src="/logo_budgetbee.svg"
                    alt="BeeBot thinking"
                    width={18}
                    height={18}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>BeeBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-cream-darker flex items-center gap-2">
            <input
              type="text"
              placeholder="Tanya BeeBot e.g., Berapa sisa budget makan?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-cream-darker bg-cream/40 text-xs sm:text-sm font-semibold text-hive-900 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
            <Button size="sm" onClick={handleSend} isLoading={loading} disabled={!inputText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
