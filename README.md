# FurniTrack - Sistem Manajemen Piutang Toko Furniture

<div align="center">
  <h3>Kelola piutang dan transaksi toko furniture Anda dengan mudah</h3>
  <p>📱 Progressive Web App (PWA) • ☁️ Cloud Sync • 💬 WhatsApp Integration</p>
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
- Template pesan yang dapat dikustomisasi
- Variabel dinamis: `{nama_toko}`, `{total_piutang}`, `{jatuh_tempo}`, `{no_transaksi}`

### 📈 Laporan & Analitik
- Grafik perkembangan piutang bulanan
- Statistik per toko
- Filter berdasarkan periode (tanggal, bulan, tahun)
- Export ke Excel dan PDF

### 💾 Backup & Restore
- **Export Data**: Download semua data ke file JSON
- **Import Data**: Restore dari file backup sebelumnya
- **Cloud Sync**: Sinkronisasi otomatis dengan cloud

### 📱 Progressive Web App (PWA)
- Install sebagai aplikasi di smartphone
- Akses cepat dari home screen
- Tampilan fullscreen tanpa browser bar
- Cache offline untuk aset statis

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL |
| Charts | Recharts |
| Export | xlsx, jspdf-autotable |
| PWA | vite-plugin-pwa |

## 🚀 Memulai

### Prasyarat
- Node.js 18+ atau Bun

### Instalasi

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
bun install

# Jalankan development server
bun run dev
```

Aplikasi akan berjalan di `http://localhost:8080`

### Instalasi PWA

- **Android**: Akan muncul banner "Install Sekarang" atau gunakan menu browser → "Install app"
- **iOS/iPadOS**: Tap tombol Share → "Add to Home Screen"

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── dashboard/      # Komponen dashboard (StatCard, JatuhTempoList, dll)
│   ├── forms/          # Form input (TransaksiForm, TokoForm, BayarForm)
│   ├── filters/        # Filter komponen
│   ├── laporan/        # Halaman laporan dan grafik
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── notifications/  # Pengingat dan notifikasi
│   ├── piutang/        # Tabel piutang
│   ├── pwa/            # PWA install banner
│   ├── settings/       # Pengaturan (template, backup)
│   ├── toko/           # Komponen toko/pelanggan
│   ├── transaksi/      # Detail transaksi
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useToko.ts           # Hook untuk data toko
│   ├── useTransaksi.ts      # Hook untuk data transaksi
│   ├── useDataManagement.ts # Hook untuk backup/restore
│   └── useMessageTemplates.ts # Hook untuk template pesan
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
| tipe_pembayaran | TEXT | 'cash', 'tempo', atau 'dp' |
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

## 💾 Backup & Restore

### Export Data
1. Buka menu **Pengaturan** di sidebar
2. Klik tombol **Backup Data**
3. File JSON akan terunduh otomatis dengan format `backup-piutang-YYYY-MM-DD.json`

### Import Data
1. Buka menu **Pengaturan**
2. Klik tombol **Import Data**
3. Pilih file backup JSON
4. Konfirmasi untuk mengganti data

⚠️ **Perhatian**: Import akan menghapus semua data yang ada dan menggantinya dengan data dari backup!

### Format Backup
```json
{
  "version": "1.0",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "toko": [...],
  "transaksi": [...],
  "item_transaksi": [...],
  "pembayaran": [...]
}
```

## 🔒 Keamanan

- Row Level Security (RLS) aktif di semua tabel
- Data terenkripsi saat transit dan at-rest
- Cloud sync dengan Lovable Cloud

## ✅ Fitur yang Sudah Selesai

- [x] Dashboard dengan ringkasan piutang
- [x] Manajemen toko/pelanggan
- [x] Pencatatan transaksi dengan items
- [x] Tracking piutang dengan filter status
- [x] Pengingat WhatsApp dengan template kustom
- [x] Laporan dengan grafik dan export
- [x] Backup & restore data (JSON)
- [x] PWA support
- [x] Responsive mobile UI
- [x] Cloud sync

## 📝 Pengembangan Selanjutnya

- [ ] Autentikasi pengguna (login/logout)
- [ ] Multi-user dengan role management
- [ ] Notifikasi push otomatis
- [ ] Export ke Excel untuk backup
- [ ] Print invoice

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## 📄 Lisensi

MIT License - Silakan gunakan untuk keperluan personal maupun komersial.

---

<div align="center">
  <p>Dibuat dengan ❤️
</div>
