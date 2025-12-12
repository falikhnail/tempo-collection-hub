import { Eye, MessageCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaksi, StatusFilter } from '@/types';
import { formatRupiah, formatTanggal, hitungHariJatuhTempo } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PiutangTableProps {
  transaksi: Transaksi[];
  statusFilter: StatusFilter;
  onBayar: (transaksi: Transaksi) => void;
  onDetail: (transaksi: Transaksi) => void;
  onKirimWA: (transaksi: Transaksi) => void;
}

const statusConfig = {
  lunas: { label: 'Lunas', class: 'status-lunas' },
  belum_lunas: { label: 'Aktif', class: 'status-aktif' },
  jatuh_tempo: { label: 'Jatuh Tempo', class: 'status-jatuh-tempo' },
  terlambat: { label: 'Terlambat', class: 'status-terlambat' },
};

export function PiutangTable({ 
  transaksi, 
  statusFilter, 
  onBayar, 
  onDetail, 
  onKirimWA 
}: PiutangTableProps) {
  const filtered = transaksi.filter(t => {
    if (statusFilter === 'semua') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID Transaksi</TableHead>
            <TableHead className="font-semibold">Toko</TableHead>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="font-semibold">Total</TableHead>
            <TableHead className="font-semibold">Sisa Piutang</TableHead>
            <TableHead className="font-semibold">Jatuh Tempo</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Tidak ada data piutang
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((t) => {
              const status = statusConfig[t.status];
              const hari = t.jatuhTempo ? hitungHariJatuhTempo(t.jatuhTempo) : null;
              
              return (
                <TableRow key={t.id} className="table-row-hover">
                  <TableCell className="font-medium text-primary">{t.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{t.toko.nama}</p>
                      <p className="text-xs text-muted-foreground">{t.toko.telepon}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatTanggal(t.tanggal)}</TableCell>
                  <TableCell className="font-medium">{formatRupiah(t.totalHarga)}</TableCell>
                  <TableCell className={cn(
                    'font-semibold',
                    t.sisaPiutang > 0 ? 'text-destructive' : 'text-success'
                  )}>
                    {formatRupiah(t.sisaPiutang)}
                  </TableCell>
                  <TableCell>
                    {t.jatuhTempo ? (
                      <div>
                        <p>{formatTanggal(t.jatuhTempo)}</p>
                        {hari !== null && t.status !== 'lunas' && (
                          <p className={cn(
                            'text-xs',
                            hari < 0 && 'text-destructive',
                            hari >= 0 && hari <= 3 && 'text-warning',
                            hari > 3 && 'text-muted-foreground'
                          )}>
                            {hari < 0 
                              ? `${Math.abs(hari)} hari terlambat` 
                              : hari === 0 
                                ? 'Hari ini'
                                : `${hari} hari lagi`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn('status-badge', status.class)}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onDetail(t)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {t.status !== 'lunas' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                            onClick={() => onKirimWA(t)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => onBayar(t)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
