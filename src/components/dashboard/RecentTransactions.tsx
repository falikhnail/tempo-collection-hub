import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaksi } from '@/types';
import { formatRupiah, formatTanggal } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transaksi: Transaksi[];
  onViewAll: () => void;
}

const statusConfig = {
  lunas: { label: 'Lunas', class: 'status-lunas' },
  belum_lunas: { label: 'Belum Lunas', class: 'status-aktif' },
  jatuh_tempo: { label: 'Jatuh Tempo', class: 'status-jatuh-tempo' },
  terlambat: { label: 'Terlambat', class: 'status-terlambat' },
};

export function RecentTransactions({ transaksi, onViewAll }: RecentTransactionsProps) {
  const recent = [...transaksi]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Transaksi Terbaru</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
          Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {recent.map((t) => {
          const status = statusConfig[t.status];
          
          return (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 table-row-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                  {t.toko.nama.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{t.toko.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.id} • {formatTanggal(t.tanggal)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatRupiah(t.totalHarga)}</p>
                <span className={cn('status-badge', status.class)}>
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
