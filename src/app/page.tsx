import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  PiggyBank,
  Wallet,
  Bot,
  Heart,
  ShieldCheck,
  Zap,
  UserPlus,
  Receipt,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/animated-reveal";
import { FaqAccordion } from "@/components/ui/faq-accordion";

const NAV_LINKS = [
  { href: "#fitur", label: "Fitur Utama" },
  { href: "#carakerja", label: "Cara Kerja" },
  { href: "#faq", label: "FAQ" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Pencatatan Transaksi",
    desc: "Catat pengeluaran dan pemasukan dengan cepat lengkap dengan kategori dan catatan.",
    delay: 150,
  },
  {
    icon: Wallet,
    title: "Limit Anggaran Bulanan",
    desc: "Pasang batas budget untuk tiap kategori agar pengeluaran tetap terkendali.",
    delay: 220,
  },
  {
    icon: PiggyBank,
    title: "Target Tabungan",
    desc: "Tetapkan target simpanan impianmu dan pantau progresnya dari waktu ke waktu.",
    delay: 290,
  },
  {
    icon: Bot,
    title: "BeeBot AI & Eksport",
    desc: "Konsultasi finansial dengan BeeBot AI serta unduh laporan keuangan PDF/Excel.",
    delay: 360,
  },
];

const STEPS = [
  {
    step: 1,
    icon: UserPlus,
    title: "Daftar Akun",
    desc: "Buat akun gratis dalam 30 detik tanpa memerlukan kartu kredit.",
    delay: 150,
  },
  {
    step: 2,
    icon: Receipt,
    title: "Catat Transaksi",
    desc: "Catat pengeluaran harian atau manfaatkan sinkronisasi otomatis.",
    delay: 250,
  },
  {
    step: 3,
    icon: Sparkles,
    title: "Tanya BeeBot AI",
    desc: "Dapatkan rekomendasi penghematan cerdas dan unduh laporan kapan saja.",
    delay: 350,
  },
];

const VALUE_HIGHLIGHTS = [
  { icon: Zap, title: "Cepat & Ringan", desc: "Akses instan di HP & Laptop", delay: 100 },
  { icon: ShieldCheck, title: "Aman & Privat", desc: "Enkripsi data berlapis", delay: 200 },
  { icon: Bot, title: "BeeBot AI Assistant", desc: "Analisis saran finansial", delay: 300 },
];

const FOOTER_APP_LINKS = [
  { href: "/dashboard", label: "Dashboard Keuangan" },
  { href: "/transactions", label: "Catatan Transaksi" },
  { href: "/budget", label: "Batas Anggaran" },
  { href: "/savings", label: "Target Tabungan" },
];

const FOOTER_SMART_FEATURES = [
  "BeeBot AI Coach",
  "Integrasi Gmail Sync",
  "Eksport Laporan PDF",
  "Eksport Laporan Excel",
];

const FOOTER_ACCOUNT_LINKS = [
  { href: "/login", label: "Masuk ke Akun" },
  { href: "/register", label: "Daftar Baru" },
  { href: "/settings", label: "Pengaturan Profil" },
];

function BrandLogo({
  size = 7,
  imageSize = 20,
  className = "",
}: {
  size?: number;
  imageSize?: number;
  className?: string;
}) {
  return (
    <div
      className={`w-${size} h-${size} rounded-lg bg-honey-100 p-1.5 flex items-center justify-center border border-honey-300/80 shadow-xs ${className}`}
    >
      <Image
        src="/logo_budgetbee.svg"
        alt="BudgetBee Logo"
        width={imageSize}
        height={imageSize}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block mb-3 px-3 py-1 rounded-full bg-honey-100 text-honey-700 text-xs font-bold tracking-wide uppercase">
      {children}
    </span>
  );
}

function SectionHeading({
  badge,
  title,
  description,
}: {
  badge: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center mb-14">
      <SectionBadge>{badge}</SectionBadge>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-hive-900 mb-2">{title}</h2>
      <p className="text-sm text-hive-500 max-w-md mx-auto">{description}</p>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-honey-200/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo size={8} imageSize={22} className="group-hover:scale-105 transition-transform" />
          <span className="text-xl font-extrabold tracking-tight text-hive-900">
            Budget<span className="text-honey-500">Bee</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-hive-600">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="relative hover:text-honey-600 transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-honey-400 after:transition-all hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-hive-700 hover:text-honey-600 hover:bg-honey-50 hover:font-bold rounded-xl transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-bold bg-honey-100 text-honey-800 border border-honey-200/60 rounded-xl hover:bg-honey-200/80 hover:-translate-y-0.5 transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5"
          >
            <span>Mulai Gratis</span>
            <ArrowUpRight className="w-4 h-4 text-honey-600" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative honeycomb-bg pt-16 pb-20 sm:pt-60 sm:pb-45 overflow-hidden">
      <div className="pointer-events-none absolute -top-42 -left-24 w-72 h-72 bg-honey-200/40 rounded-full blur-3xl z-0" style={{ position: "absolute" }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-honey-300/30 rounded-full blur-3xl z-0" style={{ position: "absolute" }} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="relative inline-block text-4xl sm:text-5xl lg:text-6xl font-extrabold text-hive-900 tracking-tight leading-[1.1] mb-6">
          <span className="absolute -top-6 left-2 sm:-top-10 sm:-left-12 text-2xl sm:text-3xl select-none pointer-events-none animate-fly-bee-left">
            🐝
          </span>

          Kelola Keuangan Jadi{" "}
          <span className="relative inline-block text-honey-500">
            Lebih Praktis
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="10"
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,6 Q50,0 100,6 T200,6"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-honey-300"
              />
            </svg>
          </span>

          <span className="absolute -bottom-6 right-2 sm:-bottom-8 sm:-right-12 text-2xl sm:text-3xl select-none pointer-events-none animate-fly-bee-right">
            🐝
          </span>
        </h1>

        <p className="text-base sm:text-lg text-hive-600 max-w-md mx-auto mb-8 font-medium leading-relaxed">
          Catat pengeluaran harian, atur budget bulanan, dan capai target
          tabunganmu tanpa pusing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-honey-100 text-honey-800 border border-honey-200/60 rounded-xl hover:bg-honey-200/80 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <span>Mulai Gratis</span>
            <ArrowUpRight className="w-4 h-4 text-honey-600" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-white text-hive-800 border border-honey-300/80 rounded-xl hover:bg-honey-50 hover:-translate-y-0.5 transition-all shadow-xs"
          >
            Masuk Akun
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="fitur" className="py-20 bg-white border-t border-honey-200/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delayMs={100}>
          <SectionHeading
            badge="Fitur Utama"
            title="Semua yang Kamu Butuhkan, di Satu Tempat"
            description="Semua alat dirancang sederhana, intuitif, dan tepat sasaran."
          />
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, delay }) => (
            <ScrollReveal key={title} direction="up" delayMs={delay}>
              <div className="group p-6 bg-cream/50 rounded-2xl border border-honey-200/60 flex items-start gap-4 hover:border-honey-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="p-2.5 bg-honey-100 text-honey-600 rounded-xl shrink-0 group-hover:bg-honey-500 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-hive-900 text-base mb-1">{title}</h3>
                  <p className="text-xs sm:text-sm text-hive-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="carakerja" className="py-20 bg-cream/50 border-t border-honey-200/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delayMs={100}>
          <SectionHeading
            badge="Cara Kerja"
            title="3 Langkah Praktis Memulai"
            description="Tanpa proses rumit, mulailah dalam hitungan detik."
          />
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block absolute top-9 left-[16.5%] right-[16.5%] h-0.5 bg-honey-200" />

          {STEPS.map(({ step, icon: Icon, title, desc, delay }) => (
            <ScrollReveal key={step} direction="up" delayMs={delay}>
              <div className="relative p-6 bg-white rounded-2xl border border-honey-200/80 shadow-xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-honey-500 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                  {step}
                </div>
                <Icon className="w-6 h-6 text-honey-600 mb-2" />
                <h3 className="font-extrabold text-hive-900 text-base mb-1">{title}</h3>
                <p className="text-xs text-hive-500 leading-relaxed">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueHighlights() {
  return (
    <section className="py-16 bg-white border-t border-honey-200/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUE_HIGHLIGHTS.map(({ icon: Icon, title, desc, delay }) => (
            <ScrollReveal key={title} direction="up" delayMs={delay}>
              <div className="p-5 bg-cream/40 rounded-2xl border border-honey-200/80 shadow-xs hover:shadow-sm hover:border-honey-300 transition-all flex items-center gap-3.5">
                <div className="p-2.5 bg-honey-100 text-honey-600 rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-hive-900 text-sm">{title}</div>
                  <div className="text-xs text-hive-500">{desc}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-20 bg-cream/40 border-t border-honey-200/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delayMs={100}>
          <SectionHeading
            badge="FAQ"
            title="Pertanyaan Umum"
            description="Beberapa hal yang sering ditanyakan pengguna seputar BudgetBee."
          />
        </ScrollReveal>

        <ScrollReveal direction="up" delayMs={200}>
          <FaqAccordion />
        </ScrollReveal>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 bg-hive-900 overflow-hidden honeycomb-bg-dark">
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-honey-500/10 rounded-full blur-3xl" style={{ position: "absolute" }} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-honey-500/10 rounded-full blur-3xl" style={{ position: "absolute" }} />

      <ScrollReveal direction="up" delayMs={100}>
        <div className="relative max-w-2xl mx-auto px-4 text-center z-10">
          <div className="w-12 h-12 rounded-xl bg-honey-100 p-2 mx-auto mb-4 flex items-center justify-center shadow-md">
            <Image
              src="/logo_budgetbee.svg"
              alt="BudgetBee Logo"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Mulai Rapikan Keuanganmu Hari Ini
          </h2>
          <p className="text-sm text-hive-300 mb-7 max-w-sm mx-auto">
            Daftar sekarang gratis tanpa ribet. Langkah kecil menuju
            finansial yang lebih sehat!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold bg-honey-500 text-honey-50 rounded-xl hover:bg-honey-300 hover:text-hive-900 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
          >
            <span>Daftar Akun Gratis</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-hive-900 text-hive-300 border-t border-hive-800 pt-14 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-hive-800/80">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-3">
              <BrandLogo className="group-hover:scale-105 transition-transform" />
              <span className="text-lg font-extrabold tracking-tight text-white">
                Budget<span className="text-honey-500">Bee</span>
              </span>
            </Link>
            <p className="text-xs text-hive-400 leading-relaxed mb-4">
              Aplikasi pencatatan keuangan pribadi yang simpel, modern, dan
              didukung asisten lebah pintar BeeBot AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Aplikasi
            </h4>
            <ul className="space-y-2.5 text-xs text-hive-400">
              {FOOTER_APP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-honey-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Fitur Pintar
            </h4>
            <ul className="space-y-2.5 text-xs text-hive-400">
              {FOOTER_SMART_FEATURES.map((label) => (
                <li key={label} className="cursor-default">
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Akun Saya
            </h4>
            <ul className="space-y-2.5 text-xs text-hive-400">
              {FOOTER_ACCOUNT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-honey-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-hive-400">
          <div>© {new Date().getFullYear()} BudgetBee. Hak cipta dilindungi undang-undang.</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-hive-800 font-sans flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <ValueHighlights />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}