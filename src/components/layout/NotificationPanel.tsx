import { format, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { AlertTriangle, Clock, ShoppingCart, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Transaksi } from '@/types';

interface NotificationPanelProps {
  transaksi: Transaksi[];
  onClose: () => void;
}

export function NotificationPanel({ transaksi, onClose }: NotificationPanelProps) {
  const today = new Date();
  
  // Get overdue and upcoming due transactions
  const jatuhTempoList = transaksi
    .filter(t => t.status !== 'lunas' && t.jatuhTempo)
    .sort((a, b) => new Date(a.jatuhTempo!).getTime() - new Date(b.jatuhTempo!).getTime())
    .slice(0, 5);
  
  // Get recent transactions (last 5)
  const recentTransaksi = [...transaksi]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysInfo = (jatuhTempo: Date) => {
    const dueDate = new Date(jatuhTempo);
    const days = differenceInDays(dueDate, today);
    
    if (days < 0) {
      return { text: `${Math.abs(days)} hari terlambat`, isOverdue: true, isUrgent: false };
    } else if (days === 0) {
      return { text: 'Hari ini', isOverdue: false, isUrgent: true };
    } else if (days <= 3) {
      return { text: `${days} hari lagi`, isOverdue: false, isUrgent: true };
    }
    return { text: `${days} hari lagi`, isOverdue: false, isUrgent: false };
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-popover shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifikasi</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        {/* Jatuh Tempo Section */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Jatuh Tempo</span>
          </div>
          
          {jatuhTempoList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Tidak ada piutang jatuh tempo
            </p>
          ) : (
            <div className="space-y-2">
              {jatuhTempoList.map((t) => {
                const daysInfo = getDaysInfo(t.jatuhTempo!);
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border ${
                      daysInfo.isOverdue 
                        ? 'border-destructive/50 bg-destructive/5' 
                        : daysInfo.isUrgent 
                        ? 'border-warning/50 bg-warning/5' 
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t.toko?.nama || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(t.sisaPiutang)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {daysInfo.isOverdue && (
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                        )}
                        <Badge 
                          variant={daysInfo.isOverdue ? 'destructive' : daysInfo.isUrgent ? 'secondary' : 'outline'}
                          className="text-[10px] px-1.5"
                        >
                          {daysInfo.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Recent Transactions Section */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Transaksi Terbaru</span>
          </div>
          
          {recentTransaksi.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-2">
              {recentTransaksi.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {t.toko?.nama || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.tanggal), 'dd MMM yyyy', { locale: localeId })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(t.totalHarga)}
                      </p>
                      <Badge 
                        variant={t.status === 'lunas' ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5"
                      >
                        {t.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
