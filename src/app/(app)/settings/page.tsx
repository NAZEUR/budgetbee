"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Shield,
  RefreshCw,
  CheckCircle2,
  Bell,
  BellOff,
  Send,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Toggle Switch Component ─────────────────────────────────
function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "99px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "2px",
        background: checked
          ? "linear-gradient(135deg, #F5A623, #E8901A)"
          : "#D4C5B2",
        transition: "background 0.25s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "all 0.25s ease",
          display: "block",
        }}
      />
    </button>
  );
}

// ─── Day Names ───────────────────────────────────────────────
const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ─── Main Component ──────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession();

  // Gmail state
  const [gmailStatus, setGmailStatus] = useState<{
    isConnected: boolean;
    lastSyncedAt?: string | null;
  }>({ isConnected: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // Email Preferences state
  const [emailPrefs, setEmailPrefs] = useState({
    weeklyRecap: true,
    monthlyRecap: true,
    dayOfWeek: 1,
    sendHour: 8,
    lastWeeklySent: null as string | null,
    lastMonthlySent: null as string | null,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [sendingWeekly, setSendingWeekly] = useState(false);
  const [sendingMonthly, setSendingMonthly] = useState(false);
  const [sendWeeklyMsg, setSendWeeklyMsg] = useState("");
  const [sendMonthlyMsg, setSendMonthlyMsg] = useState("");
  const [sendWeeklyError, setSendWeeklyError] = useState(false);
  const [sendMonthlyError, setSendMonthlyError] = useState(false);

  // ── Load Gmail Status ────────────────────────────────────
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

  // ── Load Email Preferences ───────────────────────────────
  const loadEmailPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/email-recap/preferences");
      if (res.ok) {
        const data = await res.json();
        setEmailPrefs(data);
      }
    } catch (err) {
      console.error("Failed to load email preferences:", err);
    }
  }, []);

  useEffect(() => {
    loadEmailPrefs();
  }, [loadEmailPrefs]);

  // ── Gmail Sync ───────────────────────────────────────────
  const handleSyncGmail = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/integrations/gmail/sync", { method: "POST" });
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

  // ── Save Email Preferences ────────────────────────────────
  const saveEmailPrefs = async (patch: Partial<typeof emailPrefs>) => {
    const updated = { ...emailPrefs, ...patch };
    setEmailPrefs(updated);
    setPrefsSaving(true);
    setPrefsSaved(false);
    try {
      await fetch("/api/email-recap/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setPrefsSaving(false);
    }
  };

  // ── Manual Send ───────────────────────────────────────────
  const handleSendRecap = async (type: "weekly" | "monthly") => {
    if (type === "weekly") {
      setSendingWeekly(true);
      setSendWeeklyMsg("");
      setSendWeeklyError(false);
    } else {
      setSendingMonthly(true);
      setSendMonthlyMsg("");
      setSendMonthlyError(false);
    }

    try {
      const res = await fetch("/api/email-recap/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();

      if (res.ok) {
        if (type === "weekly") {
          setSendWeeklyMsg(data.message);
          setEmailPrefs((p) => ({ ...p, lastWeeklySent: new Date().toISOString() }));
        } else {
          setSendMonthlyMsg(data.message);
          setEmailPrefs((p) => ({ ...p, lastMonthlySent: new Date().toISOString() }));
        }
      } else {
        const errMsg = data.error || "Gagal mengirim email.";
        if (type === "weekly") { setSendWeeklyMsg(errMsg); setSendWeeklyError(true); }
        else { setSendMonthlyMsg(errMsg); setSendMonthlyError(true); }
      }
    } catch {
      const errMsg = "Terjadi kesalahan. Coba lagi.";
      if (type === "weekly") { setSendWeeklyMsg(errMsg); setSendWeeklyError(true); }
      else { setSendMonthlyMsg(errMsg); setSendMonthlyError(true); }
    } finally {
      if (type === "weekly") setSendingWeekly(false);
      else setSendingMonthly(false);
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
          Manage your account &amp; integrations
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
                  Email &amp; Password
                </p>
              </div>
              <Badge variant="safe">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Email Notifications Card */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Notifikasi Email</CardTitle>
            <CardDescription>
              Terima rekap keuangan mingguan &amp; bulanan langsung ke email{" "}
              <strong className="text-hive-600">{session?.user?.email}</strong>
            </CardDescription>
          </div>
          <div className="w-10 h-10 rounded-xl bg-honey-50 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-honey-600" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Weekly Recap Toggle */}
          <div className="p-4 rounded-2xl border border-cream-darker bg-cream-dark/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-hive-800">Rekap Mingguan</p>
                  <p className="text-xs text-hive-400 mt-0.5">
                    Ringkasan pengeluaran &amp; pemasukan tiap minggu
                  </p>
                  {emailPrefs.lastWeeklySent && (
                    <p className="text-xs text-hive-300 mt-1">
                      Terakhir dikirim: {formatDate(emailPrefs.lastWeeklySent)}
                    </p>
                  )}
                </div>
              </div>
              <Toggle
                id="toggle-weekly"
                checked={emailPrefs.weeklyRecap}
                onChange={(val) => saveEmailPrefs({ weeklyRecap: val })}
                disabled={prefsSaving}
              />
            </div>

            {emailPrefs.weeklyRecap && (
              <>
                {/* Day of Week selector */}
                <div className="mt-4 pt-4 border-t border-cream-darker">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-hive-400" />
                    <p className="text-xs font-semibold text-hive-500">Hari Pengiriman</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_NAMES.map((day, i) => (
                      <button
                        key={i}
                        id={`day-${i}`}
                        onClick={() => saveEmailPrefs({ dayOfWeek: i })}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            emailPrefs.dayOfWeek === i
                              ? "linear-gradient(135deg, #F5A623, #E8901A)"
                              : "transparent",
                          color: emailPrefs.dayOfWeek === i ? "#fff" : "#9B9284",
                          border: `1.5px solid ${emailPrefs.dayOfWeek === i ? "#F5A623" : "#E8DDD0"}`,
                          cursor: "pointer",
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Send Weekly */}
                <div className="mt-4">
                  <Button
                    id="btn-send-weekly"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendRecap("weekly")}
                    isLoading={sendingWeekly}
                    className="w-full"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Rekap Minggu Ini Sekarang
                  </Button>
                  {sendWeeklyMsg && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        sendWeeklyError
                          ? "bg-red-50 border border-red-200 text-red-700"
                          : "bg-green-50 border border-green-200 text-green-700"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {sendWeeklyMsg}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Monthly Recap Toggle */}
          <div className="p-4 rounded-2xl border border-cream-darker bg-cream-dark/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-hive-800">Rekap Bulanan</p>
                  <p className="text-xs text-hive-400 mt-0.5">
                    Laporan lengkap keuangan per bulan termasuk budget &amp; tabungan
                  </p>
                  {emailPrefs.lastMonthlySent && (
                    <p className="text-xs text-hive-300 mt-1">
                      Terakhir dikirim: {formatDate(emailPrefs.lastMonthlySent)}
                    </p>
                  )}
                </div>
              </div>
              <Toggle
                id="toggle-monthly"
                checked={emailPrefs.monthlyRecap}
                onChange={(val) => saveEmailPrefs({ monthlyRecap: val })}
                disabled={prefsSaving}
              />
            </div>

            {emailPrefs.monthlyRecap && (
              <div className="mt-4">
                <Button
                  id="btn-send-monthly"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendRecap("monthly")}
                  isLoading={sendingMonthly}
                  className="w-full"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Rekap Bulan Ini Sekarang
                </Button>
                {sendMonthlyMsg && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      sendMonthlyError
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-green-50 border border-green-200 text-green-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {sendMonthlyMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status indicator */}
          {(emailPrefs.weeklyRecap || emailPrefs.monthlyRecap) ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-xs text-green-700 font-medium">
                Email rekap aktif
              </p>
              {prefsSaved && (
                <span className="ml-auto text-xs font-bold text-green-600">Tersimpan ✓</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cream-dark/50 border border-cream-darker">
              <BellOff className="w-4 h-4 text-hive-400 shrink-0" />
              <p className="text-xs text-hive-400 font-medium">
                Semua notifikasi email dinonaktifkan.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Gmail Integration Card */}
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
            <span className="font-semibold text-hive-700">Version:</span> 1.2.0
            (Email Recap Enabled)
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
