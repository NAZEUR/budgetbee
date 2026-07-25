"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [gmailStatus, setGmailStatus] = useState<{ isConnected: boolean; lastSyncedAt?: string | null }>({
    isConnected: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    fetch("/api/integrations/gmail/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isConnected === "boolean") {
          setGmailStatus(data);
        }
      })
      .catch((err) => console.error("Failed to check Gmail status:", err));
  }, []);

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/integrations/gmail/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message || "Gmail synced successfully!");
        setGmailStatus((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      } else {
        setSyncMessage(data.error || "Failed to sync Gmail receipts.");
      }
    } catch {
      setSyncMessage("Something went wrong during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-hive-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-hive-400 font-medium mt-1">
          Manage your account & integrations
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardTitle>Profile</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-dark/50 border border-cream-darker">
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
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-cream-darker">
              <User className="w-5 h-5 text-hive-400" />
              <div className="flex-1">
                <p className="text-xs text-hive-400 font-medium">Name</p>
                <p className="text-sm font-semibold text-hive-700">
                  {session?.user?.name || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-cream-darker">
              <Mail className="w-5 h-5 text-hive-400" />
              <div className="flex-1">
                <p className="text-xs text-hive-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-hive-700">
                  {session?.user?.email || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-cream-darker">
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

      {/* Integrations Card */}
      <Card>
        <CardTitle>Gmail Integration</CardTitle>
        <CardDescription>
          Automatically import payment receipts (Tokopedia, Shopee, GoPay, BCA, etc.) directly into your transactions.
        </CardDescription>

        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-cream-darker bg-cream-dark/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-status-danger flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-hive-800">Gmail Receipt Reader</p>
                <p className="text-xs text-hive-400">
                  {gmailStatus.isConnected
                    ? gmailStatus.lastSyncedAt
                      ? `Last synced: ${formatDate(gmailStatus.lastSyncedAt)}`
                      : "Connected & Ready to sync"
                    : "Not connected yet"}
                </p>
              </div>
            </div>

            <div>
              {gmailStatus.isConnected ? (
                <Button size="sm" onClick={handleSyncGmail} isLoading={isSyncing}>
                  <RefreshCw className="w-4 h-4" />
                  Sync Receipts
                </Button>
              ) : (
                <Button size="sm" onClick={() => (window.location.href = "/api/integrations/gmail/connect")}>
                  Connect Gmail
                </Button>
              )}
            </div>
          </div>

          {syncMessage && (
            <div className="p-3 rounded-xl bg-honey-50 border border-honey-200 text-sm font-medium text-hive-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-safe shrink-0" />
              {syncMessage}
            </div>
          )}
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <CardTitle>About BudgetBee</CardTitle>
        <div className="mt-4 space-y-2 text-sm text-hive-500">
          <p>
            <span className="font-semibold text-hive-700">Version:</span> 1.1.0
            (Gmail Integration Enabled)
          </p>
          <p>
            <span className="font-semibold text-hive-700">Tagline:</span> Bee
            Smart with Your Money
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
