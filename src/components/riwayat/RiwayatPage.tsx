import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Receipt, CheckCircle2 } from 'lucide-react';
import { Transaksi, Pembayaran } from '@/types';
import { formatRupiah, formatTanggal } from '@/data/mockData';
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';

interface RiwayatPageProps {
  transaksi: Transaksi[];
  onDetail: (transaksi: Transaksi) => void;
}

const metodePembayaranLabel: Record<string, string> = {
  cash: 'Tunai',
  transfer: 'Transfer',
  giro: 'Giro',
};

export function RiwayatPage({ transaksi, onDetail }: RiwayatPageProps) {
  const [activeTab, setActiveTab] = useState<'lunas' | 'pembayaran'>('lunas');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Transaksi yang sudah lunas
  const transaksiLunas = useMemo(() => {
    return transaksi
      .filter((t) => t.status === 'lunas')
      .filter((t) => {
        if (!startDate && !endDate) return true;
        const tanggal = new Date(t.tanggal);
        if (startDate && tanggal < startDate) return false;
        if (endDate && tanggal > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [transaksi, startDate, endDate]);

  // Semua riwayat pembayaran dari semua transaksi
  const semuaPembayaran = useMemo(() => {
    const pembayaranList: (Pembayaran & { transaksi: Transaksi })[] = [];
    
    transaksi.forEach((t) => {
      t.pembayaran.forEach((p) => {
        pembayaranList.push({
          ...p,
          transaksi: t,
        });
      });
    });

    return pembayaranList
      .filter((p) => {
        if (!startDate && !endDate) return true;
        const tanggal = new Date(p.tanggal);
        if (startDate && tanggal < startDate) return false;
        if (endDate && tanggal > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [transaksi, startDate, endDate]);

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Hitung total pembayaran dalam periode
  const totalPembayaranPeriode = useMemo(() => {
    return semuaPembayaran.reduce((acc, p) => acc + p.jumlah, 0);
  }, [semuaPembayaran]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lunas' | 'pembayaran')}>
          <TabsList>
            <TabsTrigger value="lunas" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Transaksi Lunas
            </TabsTrigger>
            <TabsTrigger value="pembayaran" className="gap-2">
              <Receipt className="h-4 w-4" />
              Riwayat Pembayaran
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={clearDateFilter}
        />
      </div>

      {activeTab === 'lunas' && (
        <div className="card-elevated rounded-xl overflow-hidden">
          {transaksiLunas.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Belum ada transaksi yang lunas.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Total <span className="font-semibold text-foreground">{transaksiLunas.length}</span> transaksi lunas
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaksiLunas.map((t) => (
                    <TableRow key={t.id} className="table-row-hover">
                      <TableCell className="font-medium">{t.id}</TableCell>
                      <TableCell>{t.toko.nama}</TableCell>
                      <TableCell>{formatTanggal(t.tanggal)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatRupiah(t.totalHarga)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.tipePembayaran === 'cash' ? 'secondary' : 'outline'}>
                          {t.tipePembayaran === 'cash' ? 'Cash' : 'Tempo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDetail(t)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      )}

      {activeTab === 'pembayaran' && (
        <div className="card-elevated rounded-xl overflow-hidden">
          {semuaPembayaran.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Belum ada riwayat pembayaran.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Total <span className="font-semibold text-foreground">{semuaPembayaran.length}</span> pembayaran
                </p>
                <p className="text-sm">
                  Total Masuk: <span className="font-semibold text-primary">{formatRupiah(totalPembayaranPeriode)}</span>
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semuaPembayaran.map((p) => (
                    <TableRow key={p.id} className="table-row-hover">
                      <TableCell>{formatTanggal(p.tanggal)}</TableCell>
                      <TableCell className="font-medium">{p.transaksi.id}</TableCell>
                      <TableCell>{p.transaksi.toko.nama}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {metodePembayaranLabel[p.metode] || p.metode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatRupiah(p.jumlah)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {p.catatan || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
