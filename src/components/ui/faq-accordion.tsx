"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Apakah BudgetBee benar-benar 100% gratis?",
    answer:
      "Ya! BudgetBee dapat digunakan secara gratis untuk mencatat transaksi, mengatur limit budget, mencatat target tabungan, hingga menggunakan asisten AI BeeBot.",
  },
  {
    question: "Bagaimana cara BeeBot AI membantu pencatatan keuangan saya?",
    answer:
      "BeeBot AI menganalisis data pengeluaran bulananmu dan memberikan saran hemat praktis serta menjawab pertanyaan seputar sisa budget atau rekomendasi alokasi tabungan secara real-time.",
  },
  {
    question: "Apakah saya bisa mengunduh laporan keuangan?",
    answer:
      "Tentu saja! Anda bisa mengeksport riwayat transaksi bulanan dalam format Excel (.xlsx) atau laporan ringkas format PDF yang siap dicetak dari menu Transaksi.",
  },
  {
    question: "Apakah data transaksi saya terjamin amannya?",
    answer:
      "Data Anda dilindungi enkripsi standar NextAuth dan database terenkripsi modern. Kami menjaga privasi catatan finansial Anda tanpa menjual data ke pihak ketiga.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-honey-200/80 overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-hive-900 text-sm sm:text-base hover:bg-cream/40 transition-colors"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-honey-600 transition-transform duration-300 shrink-0 ml-3 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-xs sm:text-sm text-hive-600 leading-relaxed border-t border-honey-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
