# FurniTrack - Sistem Manajemen Piutang Toko Furniture

<div align="center">
  <h3>Kelola piutang dan transaksi toko furniture Anda dengan mudah</h3>
</div>

---

## 📋 Tentang Aplikasi

FurniTrack adalah sistem manajemen piutang yang dirancang khusus untuk toko furniture grosir. Aplikasi ini membantu pemilik bisnis untuk mencatat transaksi, melacak piutang pelanggan, dan mengelola pembayaran dengan efisien.

## ✨ Fitur Utama

### 📊 Dashboard
- Ringkasan total piutang dan transaksi aktif
- Indikator piutang terlambat
- Daftar jatuh tempo terdekat
- Transaksi terbaru

### 🏪 Manajemen Toko/Pelanggan
- Tambah, edit, dan hapus data pelanggan
- Informasi kontak lengkap (telepon, WhatsApp, email)
- Integrasi langsung ke WhatsApp

### 💳 Pencatatan Transaksi
- Transaksi cash dan tempo (cicilan)
- Input multiple item per transaksi
- Pencatatan DP (Down Payment)
- Pengaturan tanggal jatuh tempo

### 📑 Tracking Piutang
- Filter berdasarkan status (Aktif, Terlambat, Lunas)
- Indikator visual status jatuh tempo
- Detail transaksi lengkap
- Riwayat pembayaran

### 📱 Notifikasi WhatsApp
- Kirim pengingat pembayaran langsung via WhatsApp
- Template pesan otomatis dengan detail piutang
- Akses cepat ke kontak pelanggan

### 📈 Laporan & Analitik
- Grafik perkembangan piutang bulanan
- Statistik per toko
- Filter berdasarkan periode (tanggal, bulan, tahun)
- Export ke Excel dan PDF

## 🛠️ Teknologi

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Charts**: Recharts
- **Export**: xlsx, jspdf

## 🚀 Memulai

### Prasyarat
- Node.js 18+ atau Bun
- Lovable (untuk backend)

### Instalasi

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
bun install

# Jalankan development server
bun run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── dashboard/      # Komponen dashboard (StatCard, JatuhTempoList, dll)
│   ├── forms/          # Form input (TransaksiForm, TokoForm, BayarForm)
│   ├── laporan/        # Halaman laporan dan grafik
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── piutang/        # Tabel piutang
│   ├── toko/           # Komponen toko/pelanggan
│   ├── transaksi/      # Detail transaksi
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useToko.ts      # Hook untuk data toko
│   └── useTransaksi.ts # Hook untuk data transaksi
├── integrations/
│   └── supabase/       # Konfigurasi Supabase
├── pages/
│   └── Index.tsx       # Halaman utama
└── types/
    └── index.ts        # TypeScript interfaces
```

## 📊 Database Schema

### Tabel `toko`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key |
| nama | TEXT | Nama toko |
| alamat | TEXT | Alamat lengkap |
| telepon | TEXT | Nomor telepon |
| whatsapp | TEXT | Nomor WhatsApp |
| email | TEXT | Email (opsional) |
| created_at | TIMESTAMP | Tanggal dibuat |

### Tabel `transaksi`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | ID transaksi (TRXxxxxxx) |
| toko_id | UUID | Foreign key ke toko |
| tanggal | TIMESTAMP | Tanggal transaksi |
| total_harga | NUMERIC | Total harga |
| tipe_pembayaran | TEXT | 'cash' atau 'tempo' |
| jatuh_tempo | TIMESTAMP | Tanggal jatuh tempo |
| status | TEXT | Status piutang |
| sisa_piutang | NUMERIC | Sisa yang belum dibayar |
| catatan | TEXT | Catatan tambahan |

### Tabel `item_transaksi`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key |
| transaksi_id | TEXT | Foreign key ke transaksi |
| nama_barang | TEXT | Nama barang |
| jumlah | INTEGER | Jumlah barang |
| harga_satuan | NUMERIC | Harga per unit |
| subtotal | NUMERIC | Jumlah × harga |

### Tabel `pembayaran`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key |
| transaksi_id | TEXT | Foreign key ke transaksi |
| tanggal | TIMESTAMP | Tanggal pembayaran |
| jumlah | NUMERIC | Jumlah pembayaran |
| metode | TEXT | 'cash', 'transfer', atau 'lainnya' |
| catatan | TEXT | Catatan pembayaran |

## 🔒 Keamanan

- Row Level Security (RLS) aktif di semua tabel
- Data terenkripsi saat transit dan at-rest
- Untuk production, tambahkan autentikasi pengguna

## 📝 Pengembangan Selanjutnya

- [ ] Autentikasi pengguna (login/logout)
- [ ] Notifikasi WhatsApp otomatis
- [ ] Multi-user dengan role management
- [ ] Backup data otomatis
- [ ] Mobile responsive optimization
- [ ] Print invoice

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## 📄 Lisensi

MIT License - Silakan gunakan untuk keperluan personal maupun komersial.

---

<div align="center">
  <p>Dibuat dengan ❤️
</div>
