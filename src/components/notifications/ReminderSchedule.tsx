import { useState, useMemo } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Transaksi } from '@/types';
import { formatRupiah } from '@/data/mockData';
import { 
  differenceInDays, 
  isToday, 
  isTomorrow, 
  addDays, 
  isWithinInterval,
  startOfDay,
  endOfDay,
  format
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ReminderScheduleProps {
  transaksi: Transaksi[];
  onKirimWA: (transaksi: Transaksi) => void;
}

type ReminderCategory = 'terlambat' | 'hari_ini' | 'besok' | 'minggu_ini';

export function ReminderSchedule({ transaksi, onKirimWA }: ReminderScheduleProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ReminderCategory>('terlambat');

  const categorizedTransaksi = useMemo(() => {
    const now = new Date();
    const weekEnd = addDays(now, 7);

    const result: Record<ReminderCategory, Transaksi[]> = {
      terlambat: [],
      hari_ini: [],
      besok: [],
      minggu_ini: [],
    };

    transaksi
      .filter(t => t.status !== 'lunas' && t.jatuhTempo)
      .forEach(t => {
        const jatuhTempo = new Date(t.jatuhTempo!);
        const today = startOfDay(now);

        if (jatuhTempo < today) {
          result.terlambat.push(t);
        } else if (isToday(jatuhTempo)) {
          result.hari_ini.push(t);
        } else if (isTomorrow(jatuhTempo)) {
          result.besok.push(t);
        } else if (isWithinInterval(jatuhTempo, { start: addDays(now, 2), end: weekEnd })) {
          result.minggu_ini.push(t);
        }
      });

    // Sort by jatuh tempo
    Object.keys(result).forEach(key => {
      result[key as ReminderCategory].sort((a, b) => 
        new Date(a.jatuhTempo!).getTime() - new Date(b.jatuhTempo!).getTime()
      );
    });

    return result;
  }, [transaksi]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = (category: ReminderCategory) => {
    const ids = categorizedTransaksi[category].map(t => t.id);
    const allSelected = ids.every(id => selectedIds.has(id));
    
    const newSet = new Set(selectedIds);
    if (allSelected) {
      ids.forEach(id => newSet.delete(id));
    } else {
      ids.forEach(id => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const sendBulkWA = () => {
    const selectedTransaksi = transaksi.filter(t => selectedIds.has(t.id));
    selectedTransaksi.forEach(t => {
      onKirimWA(t);
    });
    setSelectedIds(new Set());
  };

  const getCategoryInfo = (category: ReminderCategory) => {
    switch (category) {
      case 'terlambat':
        return { 
          label: 'Terlambat', 
          icon: AlertTriangle, 
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          badgeVariant: 'destructive' as const
        };
      case 'hari_ini':
        return { 
          label: 'Hari Ini', 
          icon: Clock, 
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          badgeVariant: 'secondary' as const
        };
      case 'besok':
        return { 
          label: 'Besok', 
          icon: Calendar, 
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          badgeVariant: 'outline' as const
        };
      case 'minggu_ini':
        return { 
          label: '7 Hari', 
          icon: Bell, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          badgeVariant: 'outline' as const
        };
    }
  };

  const renderTransaksiList = (category: ReminderCategory) => {
    const list = categorizedTransaksi[category];
    const categoryInfo = getCategoryInfo(category);

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
          <p className="text-muted-foreground">Tidak ada piutang {categoryInfo.label.toLowerCase()}</p>
        </div>
      );
    }

    const allSelected = list.every(t => selectedIds.has(t.id));
    const someSelected = list.some(t => selectedIds.has(t.id));

    return (
      <div className="space-y-3">
        {/* Select All */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected}
              onCheckedChange={() => selectAll(category)}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium">
              Pilih Semua ({list.length} transaksi)
            </span>
          </div>
          {someSelected && (
            <Button 
              size="sm" 
              onClick={sendBulkWA}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-1" />
              Kirim WA ({selectedIds.size})
            </Button>
          )}
        </div>

        {/* Transaksi List */}
        <div className="space-y-2">
          {list.map(t => {
            const daysLate = differenceInDays(new Date(), new Date(t.jatuhTempo!));
            const isLate = daysLate > 0;
            
            return (
              <div 
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Checkbox 
                  checked={selectedIds.has(t.id)}
                  onCheckedChange={() => toggleSelect(t.id)}
                  className="data-[state=checked]:bg-primary"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t.toko.nama}</span>
                    {isLate && (
                      <Badge variant="destructive" className="text-xs">
                        {daysLate} hari terlambat
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono">{t.id}</span>
                    <span>•</span>
                    <span>{format(new Date(t.jatuhTempo!), 'dd MMM yyyy', { locale: idLocale })}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-destructive">
                    {formatRupiah(t.sisaPiutang)}
                  </p>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  className="shrink-0 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => onKirimWA(t)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalCount = Object.values(categorizedTransaksi).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Jadwal Pengingat Piutang
        </CardTitle>
        <CardDescription>
          Kelola dan kirim pengingat WhatsApp untuk piutang yang akan jatuh tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Semua Piutang Terkendali</h3>
            <p className="text-muted-foreground">
              Tidak ada piutang yang perlu diingatkan saat ini
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReminderCategory)}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {(['terlambat', 'hari_ini', 'besok', 'minggu_ini'] as ReminderCategory[]).map(cat => {
                const info = getCategoryInfo(cat);
                const count = categorizedTransaksi[cat].length;
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="relative"
                  >
                    <info.icon className={`h-4 w-4 mr-1 ${info.color}`} />
                    {info.label}
                    {count > 0 && (
                      <Badge 
                        variant={info.badgeVariant}
                        className="ml-1.5 h-5 min-w-5 px-1.5 text-xs"
                      >
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(['terlambat', 'hari_ini', 'besok', 'minggu_ini'] as ReminderCategory[]).map(cat => (
              <TabsContent key={cat} value={cat}>
                {renderTransaksiList(cat)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
