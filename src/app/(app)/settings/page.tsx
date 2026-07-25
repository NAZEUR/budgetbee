"use client";

import { useSession } from "next-auth/react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-hive-800">
          Settings
        </h1>
        <p className="text-sm text-hive-400 mt-1">
          Manage your account settings 🔧
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardTitle>Profile</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-cream-dark/50">
            <div className="w-14 h-14 rounded-2xl honey-gradient flex items-center justify-center text-2xl font-bold text-hive-800 shadow-honey">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-lg font-bold text-hive-800">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-hive-400">
                {session?.user?.email || ""}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-darker">
              <User className="w-5 h-5 text-hive-400" />
              <div className="flex-1">
                <p className="text-xs text-hive-400 font-medium">Name</p>
                <p className="text-sm font-semibold text-hive-700">
                  {session?.user?.name || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-darker">
              <Mail className="w-5 h-5 text-hive-400" />
              <div className="flex-1">
                <p className="text-xs text-hive-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-hive-700">
                  {session?.user?.email || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-darker">
              <Shield className="w-5 h-5 text-hive-400" />
              <div className="flex-1">
                <p className="text-xs text-hive-400 font-medium">
                  Authentication
                </p>
                <p className="text-sm font-semibold text-hive-700">
                  Email & Password
                </p>
              </div>
              <Badge variant="safe">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <CardTitle>About BudgetBee</CardTitle>
        <div className="mt-4 space-y-2 text-sm text-hive-500">
          <p>
            <span className="font-semibold text-hive-700">Version:</span> 1.0.0
            (Phase 1)
          </p>
          <p>
            <span className="font-semibold text-hive-700">Tagline:</span> Bee
            Smart with Your Money 🐝
          </p>
          <p className="text-xs text-hive-400 mt-4">
            Track your expenses, build better habits, and watch your savings
            grow—one small step at a time.
          </p>
        </div>
      </Card>
    </div>
  );
}
