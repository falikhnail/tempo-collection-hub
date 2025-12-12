import { Toko, Transaksi } from '@/types';

export const mockToko: Toko[] = [
  {
    id: '1',
    nama: 'Toko Mebel Jaya',
    alamat: 'Jl. Raya Furniture No. 123, Jakarta',
    telepon: '021-12345678',
    whatsapp: '6281234567890',
    email: 'mebeljaya@email.com',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    nama: 'UD Kayu Makmur',
    alamat: 'Jl. Industri Kayu No. 45, Surabaya',
    telepon: '031-87654321',
    whatsapp: '6289876543210',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    nama: 'CV Furniture Prima',
    alamat: 'Jl. Mebel Raya No. 78, Semarang',
    telepon: '024-11223344',
    whatsapp: '6281122334455',
    email: 'furnprima@email.com',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    nama: 'Toko Perabot Sejahtera',
    alamat: 'Jl. Pasar Mebel No. 12, Bandung',
    telepon: '022-99887766',
    whatsapp: '6289988776655',
    createdAt: new Date('2024-04-05'),
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const mockTransaksi: Transaksi[] = [
  {
    id: 'TRX001',
    tokoId: '1',
    toko: mockToko[0],
    tanggal: lastWeek,
    items: [
      { id: '1', namaBarang: 'Meja Makan Jati 6 Kursi', jumlah: 5, hargaSatuan: 8500000, subtotal: 42500000 },
      { id: '2', namaBarang: 'Kursi Tamu Set', jumlah: 3, hargaSatuan: 4500000, subtotal: 13500000 },
    ],
    totalHarga: 56000000,
    tipePembayaran: 'tempo',
    jatuhTempo: nextWeek,
    status: 'belum_lunas',
    pembayaran: [
      { id: 'PAY001', transaksiId: 'TRX001', tanggal: lastWeek, jumlah: 20000000, metode: 'transfer', catatan: 'DP awal' },
    ],
    sisaPiutang: 36000000,
    catatan: 'Pengiriman ke gudang utama',
  },
  {
    id: 'TRX002',
    tokoId: '2',
    toko: mockToko[1],
    tanggal: twoDaysAgo,
    items: [
      { id: '3', namaBarang: 'Lemari Pakaian 3 Pintu', jumlah: 10, hargaSatuan: 3200000, subtotal: 32000000 },
    ],
    totalHarga: 32000000,
    tipePembayaran: 'tempo',
    jatuhTempo: yesterday,
    status: 'terlambat',
    pembayaran: [
      { id: 'PAY002', transaksiId: 'TRX002', tanggal: twoDaysAgo, jumlah: 10000000, metode: 'cash' },
    ],
    sisaPiutang: 22000000,
  },
  {
    id: 'TRX003',
    tokoId: '3',
    toko: mockToko[2],
    tanggal: yesterday,
    items: [
      { id: '4', namaBarang: 'Sofa L Minimalis', jumlah: 2, hargaSatuan: 12000000, subtotal: 24000000 },
      { id: '5', namaBarang: 'Meja Tamu Marmer', jumlah: 2, hargaSatuan: 2500000, subtotal: 5000000 },
    ],
    totalHarga: 29000000,
    tipePembayaran: 'cash',
    status: 'lunas',
    pembayaran: [
      { id: 'PAY003', transaksiId: 'TRX003', tanggal: yesterday, jumlah: 29000000, metode: 'transfer' },
    ],
    sisaPiutang: 0,
  },
  {
    id: 'TRX004',
    tokoId: '4',
    toko: mockToko[3],
    tanggal: today,
    items: [
      { id: '6', namaBarang: 'Ranjang King Size', jumlah: 8, hargaSatuan: 5500000, subtotal: 44000000 },
      { id: '7', namaBarang: 'Nakas Set', jumlah: 8, hargaSatuan: 850000, subtotal: 6800000 },
    ],
    totalHarga: 50800000,
    tipePembayaran: 'tempo',
    jatuhTempo: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
    status: 'belum_lunas',
    pembayaran: [],
    sisaPiutang: 50800000,
    catatan: 'Request warna custom',
  },
];

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTanggal = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const hitungHariJatuhTempo = (jatuhTempo: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jt = new Date(jatuhTempo);
  jt.setHours(0, 0, 0, 0);
  const diff = jt.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
