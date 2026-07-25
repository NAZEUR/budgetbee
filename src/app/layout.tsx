import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BudgetBee — Bee Smart with Your Money",
  description:
    "Track your expenses, build better habits, and watch your savings grow—one small step at a time. A personal budgeting app that makes managing money feel rewarding.",
  keywords: ["budgeting", "personal finance", "expense tracker", "savings goals"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-display bg-cream text-hive-800">
        {children}
      </body>
    </html>
  );
}
