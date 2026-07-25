# PROJECT BRIEF:  BudgetBee
> Dokumen ini ditulis untuk AI coding agent. Ikuti spesifikasi ini sebagai sumber kebenaran utama saat generate code, struktur folder, dan desain.

---

## 1. RINGKASAN PROYEK

**Nama Produk:** BudgetBee

**Tagline:** "Bee Smart with Your Money."

**Deskripsi Produk:** Track your expenses, build better habits, and watch your savings grow—one small step at a time.

Bangun aplikasi web budgeting personal (full-stack) bernama **BudgetBee**. Aplikasi ini untuk portofolio, jadi kode harus **bersih, terstruktur, dan mudah dibaca** — bukan cuma jalan, tapi juga enak dilihat di GitHub.

**Tone produk:** Ramah, memotivasi, sedikit playful ala maskot lebah — tapi tetap terasa bisa dipercaya untuk urusan uang. Gunakan istilah/copywriting bertema lebah/sarang secara ringan (jangan berlebihan) di tempat yang pas, misalnya:
- Savings goals bisa disebut sebagai "Hive" atau "Honeycomb" (opsional, gunakan istilah ini kalau natural)
- Empty state / pesan sukses boleh pakai nada ceria & memotivasi ("Great job! You're buzzing toward your goal ")
- Landing page pakai tagline di atas sebagai hero copy

**Fase saat ini: Fase 1 — TANPA AI.** Semua kategorisasi transaksi dilakukan **manual oleh user** (pilih dari dropdown). JANGAN implementasikan fitur AI apapun di fase ini, meskipun secara arsitektur boleh disiapkan agar mudah ditambah nanti (lihat bagian 9).

---

## 2. TECH STACK (WAJIB, SEMUA GRATIS)

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Autentikasi**: NextAuth.js (Auth.js) — credentials provider (email + password)
- **Database**: PostgreSQL (Supabase atau Neon, free tier)
- **ORM**: Prisma
- **Charts**: Recharts
- **Form & Validasi**: React Hook Form + Zod
- **Icons**: lucide-react
- **Hosting target**: Vercel

Jangan gunakan library berbayar atau yang butuh API key berbayar di fase ini.

---

## 3. ARAHAN DESAIN — TEMA "BEE & HONEYCOMB" 

Ini penting: aplikasi budgeting biasanya terasa kaku/serius (banyak yang pakai biru-abu-abu korporat). BudgetBee harus terasa **ceria, hangat, dan memotivasi** — seperti lebah kecil yang rajin mengumpulkan madu, tapi tetap cukup rapi & profesional untuk portofolio.

### Prinsip Desain
- Hindari tampilan "template SaaS generik" (jangan cuma putih + satu warna aksen + shadow tipis di mana-mana)
- Warna utama berbasis **kuning madu & hitam/navy gelap** ala lebah, dipadukan warna pendukung hangat lainnya
- Rounded corners besar (`rounded-2xl` / `rounded-3xl`) untuk kesan lembut dan ramah
- Boleh gunakan motif **honeycomb (heksagon)** secara halus sebagai dekorasi background, divider, atau bentuk card/icon container — jangan berlebihan sampai mengganggu keterbacaan
- Emoji 🐝 dan ilustrasi bertema lebah/sarang boleh dipakai di empty state, halaman sukses, atau onboarding
- Micro-interactions: hover effect, transisi halus, animasi kecil saat progress bar terisi (misal progress bar savings goal "terisi madu")

### Palet Warna (starting point, boleh agent kembangkan)
- **Primary (Honey Yellow)**: `#FFC107` / `#FFB300` — warna utama brand, dipakai di CTA button, highlight, logo area
- **Secondary (Deep Hive Black/Navy)**: `#1A1A2E` atau `#2B2416` — untuk teks utama, header, elemen kontras (terinspirasi garis-garis lebah)
- Base background: krem hangat / off-white madu (`#FFFBEA` atau `#FFF8E1`), bukan putih polos
- Aksen warna per kategori pengeluaran (biar visual dan mudah dibedakan di chart, tetap dalam nuansa hangat tapi variatif):
  - Makanan & Minuman → oranye hangat (`#FF8C42`)
  - Transportasi → biru cerah (`#4A90D9`) — sebagai warna kontras/pemecah dari nuansa kuning-oranye
  - Belanja → pink/magenta (`#E85D9C`)
  - Tagihan → ungu (`#8B6FD1`)
  - Hiburan → hijau/teal (`#4CAF8A`)
  - Kesehatan → coral (`#FF6B6B`)
  - Lainnya → abu-abu hangat (`#9B9284`)
- Warna status budget: hijau (aman), kuning/amber (waspada — cocok dengan tema madu), oranye kemerahan (lewat limit, tetap ceria tapi jelas)

### Tipografi
- Font playful tapi tetap terbaca (contoh: `Poppins`, `Quicksand`, atau `Nunito` dari Google Fonts) — hindari font default sistem/serius seperti Arial/Times
- Untuk logo/heading besar, boleh eksplorasi font yang sedikit lebih tebal & bulat agar terasa "friendly mascot brand"

### Komponen yang butuh perhatian visual khusus
- **Logo/Navbar**: untuk logonya nanti saya buatkan upload image di src/image, lalu tampilkan logo di navbar, untuk nama logonya "BudgetBee"
- **Progress bar budget**: animasi mengisi, warna berubah sesuai persentase, opsional beri sentuhan gradasi kuning madu
- **Progress bar savings goal**: bisa divisualisasikan seperti "toples madu" atau "sarang" yang terisi bertahap
- **Dashboard cards**: card berwarna-warni per kategori, bukan semua putih seragam; boleh beri aksen border/icon container berbentuk heksagon
- **Empty state** (belum ada transaksi/goal): ilustrasi/emoji lebah + copy yang friendly & memotivasi (contoh: "No transactions yet — start buzzing! 🐝")
- **Kategori icon**: tiap kategori punya icon dari lucide-react yang relevan (piring untuk makanan, mobil untuk transportasi, dll)
- **Landing page hero**: judul besar " BudgetBee", subjudul tagline "Bee Smart with Your Money.", lalu deskripsi "Track your expenses, build better habits, and watch your savings grow—one small step at a time." + CTA button ("Get Started" / "Start Buzzing")

---

## 4. FITUR (SCOPE FASE 1 — WAJIB DIIMPLEMENTASI)

### A. Autentikasi
- Register (email, password, nama)
- Login / Logout
- Proteksi halaman: redirect ke `/login` kalau belum auth

### B. Transaksi
- Tambah transaksi (nominal, deskripsi, tanggal, kategori, tipe: expense/income)
- Edit & hapus transaksi
- List transaksi dengan filter (kategori, rentang tanggal, tipe)

### C. Kategori
- Kategori default (lihat daftar di bagian 3) — otomatis dibuat saat user register
- User bisa tambah/edit/hapus kategori custom

### D. Budget per Kategori
- Set limit budget bulanan per kategori
- Progress bar visual dengan warna status (aman/waspada/lewat)
- Ringkasan sisa budget per kategori & total

### E. Savings Goals
- Buat pos tabungan (nama, target nominal, target tanggal opsional, boleh pilih warna/icon sendiri)
- Catat setoran ke goal tertentu
- Progress bar menuju target
- Support multiple goals sekaligus

### F. Dashboard
- Ringkasan: total pengeluaran bulan ini, sisa budget, total tabungan
- Pie chart: distribusi pengeluaran per kategori (pakai palet warna kategori)
- Bar/line chart: tren pengeluaran beberapa bulan terakhir
- Ringkasan progress semua savings goals

---

## 5. YANG TIDAK BOLEH DIBUAT DI FASE INI
- Jangan buat fitur AI kategorisasi otomatis
- Jangan buat chat assistant
- Jangan buat integrasi email/Gmail API
- Jangan tambah dependency berbayar

---

## 6. SKEMA DATABASE (PRISMA — GUNAKAN INI SEBAGAI ACUAN)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  createdAt     DateTime       @default(now())
  categories    Category[]
  transactions  Transaction[]
  budgets       Budget[]
  savingsGoals  SavingsGoal[]
}

model Category {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  name        String
  color       String        // hex color untuk chart & UI
  icon        String        // nama icon lucide-react
  isDefault   Boolean       @default(false)
  transactions Transaction[]
  budgets     Budget[]
}

model Transaction {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  amount      Float
  description String
  type        String    // "expense" | "income"
  date        DateTime
  createdAt   DateTime  @default(now())
}

model Budget {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  monthlyLimit  Float
  month         String    // format "YYYY-MM"
}

model SavingsGoal {
  id            String            @id @default(cuid())
  userId        String
  user          User              @relation(fields: [userId], references: [id])
  name          String
  targetAmount  Float
  currentAmount Float             @default(0)
  targetDate    DateTime?
  color         String
  icon          String
  createdAt     DateTime          @default(now())
  deposits      SavingsDeposit[]
}

model SavingsDeposit {
  id            String       @id @default(cuid())
  savingsGoalId String
  savingsGoal   SavingsGoal  @relation(fields: [savingsGoalId], references: [id])
  amount        Float
  date          DateTime
  note          String?
}
```

---

## 7. SITEMAP / ROUTING

```
/                    → Landing page (playful, jelaskan fitur singkat, CTA daftar)
/login               → Login
/register            → Register
/dashboard           → Ringkasan + charts
/transactions        → List, tambah, edit, hapus transaksi
/budget              → Atur limit budget per kategori
/savings             → Kelola savings goals & setoran
/settings            → Pengaturan akun (opsional)
```

---

## 8. URUTAN PENGERJAAN (IKUTI URUTAN INI)

1. Setup project: Next.js + TypeScript + Tailwind + Prisma + koneksi database
2. Setup design system dulu: warna, font, komponen dasar (Button, Card, Input, ProgressBar) sebelum bangun fitur — biar konsisten dari awal
3. Autentikasi (register/login/logout + proteksi route)
4. CRUD Kategori (termasuk seed kategori default saat register)
5. CRUD Transaksi + filter
6. Fitur Budget per kategori
7. Fitur Savings Goals + deposits
8. Dashboard + integrasi Recharts
9. Responsive check (mobile & desktop) + empty states + loading states
10. Deploy ke Vercel

---

## 9. CATATAN ARSITEKTUR UNTUK FASE 2 (JANGAN DIBANGUN SEKARANG, TAPI SIAPKAN RUANGNYA)
- Field `isAiCategorized` boolean di model Transaction akan ditambahkan nanti
- Endpoint `/api/categorize` akan ditambahkan nanti untuk panggil AI
- Jangan hardcode logic yang menyulitkan penambahan fitur ini di masa depan (misal: pastikan proses tambah transaksi punya satu fungsi/service terpusat, bukan tersebar di banyak tempat)

---

## 10. DEFINITION OF DONE
- [ ] Auth (register/login/logout) berfungsi penuh
- [ ] CRUD transaksi, kategori, budget, savings goal semua berfungsi
- [ ] Dashboard menampilkan data akurat dengan chart berwarna sesuai kategori
- [ ] Desain terasa sesuai identitas brand "BudgetBee" (honey yellow + honeycomb motif), bukan template SaaS generik berwarna putih-biru standar
- [ ] Landing page menampilkan nama " BudgetBee", tagline, dan deskripsi produk dengan jelas
- [ ] Responsive di mobile & desktop
- [ ] Sudah di-deploy dan bisa diakses via link publik
- [ ] README GitHub lengkap dengan screenshot & penjelasan proyek