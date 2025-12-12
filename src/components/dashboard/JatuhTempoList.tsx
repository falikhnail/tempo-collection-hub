import { AlertTriangle, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaksi } from '@/types';
import { formatRupiah, formatTanggal, hitungHariJatuhTempo } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface JatuhTempoListProps {
  transaksi: Transaksi[];
  onKirimWA: (transaksi: Transaksi) => void;
}

export function JatuhTempoList({ transaksi, onKirimWA }: JatuhTempoListProps) {
  const filtered = transaksi
    .filter(t => t.status !== 'lunas' && t.jatuhTempo)
    .sort((a, b) => {
      const daysA = hitungHariJatuhTempo(a.jatuhTempo!);
      const daysB = hitungHariJatuhTempo(b.jatuhTempo!);
      return daysA - daysB;
    })
    .slice(0, 5);

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Jatuh Tempo Terdekat</h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Tidak ada piutang mendekati jatuh tempo
          </p>
        ) : (
          filtered.map((t) => {
            const hari = hitungHariJatuhTempo(t.jatuhTempo!);
            const isTerlambat = hari < 0;
            const isUrgent = hari <= 3 && hari >= 0;
            
            return (
              <div
                key={t.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 transition-colors',
                  isTerlambat && 'border-destructive/30 bg-destructive/5',
                  isUrgent && !isTerlambat && 'border-warning/30 bg-warning/5',
                  !isTerlambat && !isUrgent && 'border-border bg-card'
                )}
              >
                <div className="flex items-center gap-3">
                  {(isTerlambat || isUrgent) && (
                    <AlertTriangle className={cn(
                      'h-4 w-4',
                      isTerlambat ? 'text-destructive' : 'text-warning'
                    )} />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{t.toko.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRupiah(t.sisaPiutang)} • {formatTanggal(t.jatuhTempo!)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    isTerlambat && 'bg-destructive/15 text-destructive',
                    isUrgent && !isTerlambat && 'bg-warning/15 text-warning',
                    !isTerlambat && !isUrgent && 'bg-muted text-muted-foreground'
                  )}>
                    {isTerlambat 
                      ? `${Math.abs(hari)} hari lalu` 
                      : hari === 0 
                        ? 'Hari ini'
                        : `${hari} hari lagi`}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                    onClick={() => onKirimWA(t)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
