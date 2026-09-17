"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLanguage } from "@/providers/language-provider";

const navItems = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.transactions", href: "/transactions", icon: ArrowLeftRight },
  { labelKey: "nav.budget", href: "/budget", icon: Wallet },
  { labelKey: "nav.savings", href: "/savings", icon: PiggyBank },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  userName?: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-darker px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-honey-100 p-1 flex items-center justify-center border border-honey-200">
            <Image
              src="/logo_budgetbee.svg"
              alt="BudgetBee Logo"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-extrabold text-hive-800">
            Budget<span className="text-honey-500">Bee</span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-hive-600 hover:bg-cream-dark transition-honey"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-hive-800/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-cream-darker flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-cream-darker">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-2xl bg-honey-100 p-1.5 flex items-center justify-center shadow-honey border border-honey-200">
              <Image
                src="/logo_budgetbee.svg"
                alt="BudgetBee Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-hive-800 leading-tight">
                Budget<span className="text-honey-500">Bee</span>
              </h1>
              <p className="text-[10px] text-hive-300 font-medium tracking-wider uppercase">
                Bee Smart
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-honey group",
                  isActive
                    ? "bg-honey-100 text-honey-800 shadow-honey"
                    : "text-hive-400 hover:bg-cream-dark hover:text-hive-700"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-honey",
                    isActive
                      ? "text-honey-600"
                      : "text-hive-300 group-hover:text-hive-500"
                  )}
                />
                {t(item.labelKey)}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-honey-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-cream-darker">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full honey-gradient flex items-center justify-center text-sm font-bold text-hive-800">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-hive-700 truncate">
                {userName || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-hive-400 hover:bg-red-50 hover:text-status-danger transition-honey w-full"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.signOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
