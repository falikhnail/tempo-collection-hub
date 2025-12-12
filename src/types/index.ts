export interface Toko {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  whatsapp: string;
  email?: string;
  createdAt: Date;
}

export interface Transaksi {
  id: string;
  tokoId: string;
  toko: Toko;
  tanggal: Date;
  items: ItemTransaksi[];
  totalHarga: number;
  tipePembayaran: 'cash' | 'tempo';
  jatuhTempo?: Date;
  status: 'lunas' | 'belum_lunas' | 'jatuh_tempo' | 'terlambat';
  pembayaran: Pembayaran[];
  sisaPiutang: number;
  catatan?: string;
}

export interface ItemTransaksi {
  id: string;
  namaBarang: string;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface Pembayaran {
  id: string;
  transaksiId: string;
  tanggal: Date;
  jumlah: number;
  metode: 'transfer' | 'cash' | 'lainnya';
  catatan?: string;
}

export type StatusFilter = 'semua' | 'lunas' | 'belum_lunas' | 'jatuh_tempo' | 'terlambat';
