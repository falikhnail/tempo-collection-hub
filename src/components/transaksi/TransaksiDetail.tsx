import { Transaksi } from '@/types';
import { formatRupiah, formatTanggal } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TransaksiDetailProps {
  transaksi: Transaksi;
}

const statusConfig = {
  lunas: { label: 'Lunas', class: 'bg-success/10 text-success border-success/20' },
  belum_lunas: { label: 'Aktif', class: 'bg-primary/10 text-primary border-primary/20' },
  jatuh_tempo: { label: 'Jatuh Tempo', class: 'bg-warning/10 text-warning border-warning/20' },
  terlambat: { label: 'Terlambat', class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function TransaksiDetail({ transaksi }: TransaksiDetailProps) {
  const status = statusConfig[transaksi.status];
  const totalTerbayar = transaksi.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 pr-4">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">ID Transaksi</p>
            <p className="text-lg font-semibold text-primary">{transaksi.id}</p>
          </div>
          <Badge variant="outline" className={cn('px-3 py-1', status.class)}>
            {status.label}
          </Badge>
        </div>

        <Separator />

        {/* Toko Info */}
        <div>
          <h4 className="font-medium mb-2">Informasi Toko</h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{transaksi.toko.nama}</p>
            <p className="text-sm text-muted-foreground">{transaksi.toko.alamat}</p>
            <p className="text-sm text-muted-foreground">{transaksi.toko.telepon}</p>
          </div>
        </div>

        {/* Transaksi Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tanggal Transaksi</p>
            <p className="font-medium">{formatTanggal(transaksi.tanggal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
            <p className="font-medium">
              {transaksi.jatuhTempo ? formatTanggal(transaksi.jatuhTempo) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipe Pembayaran</p>
            <p className="font-medium capitalize">{transaksi.tipePembayaran}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Harga</p>
            <p className="font-medium">{formatRupiah(transaksi.totalHarga)}</p>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <h4 className="font-medium mb-2">Daftar Barang</h4>
          <div className="bg-muted/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium">Nama</th>
                  <th className="text-center p-2 font-medium">Qty</th>
                  <th className="text-right p-2 font-medium">Harga</th>
                  <th className="text-right p-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-border/50">
                    <td className="p-2">{item.namaBarang}</td>
                    <td className="p-2 text-center">{item.jumlah}</td>
                    <td className="p-2 text-right">{formatRupiah(item.hargaSatuan)}</td>
                    <td className="p-2 text-right font-medium">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div>
          <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Harga</span>
              <span className="font-medium">{formatRupiah(transaksi.totalHarga)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Terbayar</span>
              <span className="font-medium text-success">{formatRupiah(totalTerbayar)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Sisa Piutang</span>
              <span className={cn(
                'font-bold',
                transaksi.sisaPiutang > 0 ? 'text-destructive' : 'text-success'
              )}>
                {formatRupiah(transaksi.sisaPiutang)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {transaksi.pembayaran.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Riwayat Pembayaran</h4>
              <div className="space-y-2">
                {transaksi.pembayaran.map((p) => (
                  <div key={p.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatRupiah(p.jumlah)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTanggal(p.tanggal)} • {p.metode}
                      </p>
                      {p.catatan && (
                        <p className="text-xs text-muted-foreground mt-1">{p.catatan}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {transaksi.catatan && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Catatan</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {transaksi.catatan}
              </p>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
