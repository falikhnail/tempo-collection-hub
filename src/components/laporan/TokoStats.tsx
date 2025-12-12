import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatRupiah } from '@/data/mockData';

interface TokoStat {
  id: string;
  nama: string;
  totalTransaksi: number;
  totalPiutang: number;
  totalTerbayar: number;
  totalNilai: number;
  terlambat: number;
  lunas: number;
  persentaseLunas: number;
}

interface TokoStatsProps {
  stats: TokoStat[];
}

export function TokoStats({ stats }: TokoStatsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toko dengan Piutang Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 && (
              <>
                <p className="text-lg font-bold">{stats.sort((a, b) => b.totalPiutang - a.totalPiutang)[0]?.nama || '-'}</p>
                <p className="text-sm text-muted-foreground">
                  {formatRupiah(stats[0]?.totalPiutang || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toko Paling Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 && (
              <>
                <p className="text-lg font-bold">
                  {[...stats].sort((a, b) => b.totalTransaksi - a.totalTransaksi)[0]?.nama || '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[...stats].sort((a, b) => b.totalTransaksi - a.totalTransaksi)[0]?.totalTransaksi || 0} transaksi
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tingkat Pelunasan Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 && (
              <>
                <p className="text-lg font-bold">
                  {[...stats].filter(s => s.totalTransaksi > 0).sort((a, b) => b.persentaseLunas - a.persentaseLunas)[0]?.nama || '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[...stats].filter(s => s.totalTransaksi > 0).sort((a, b) => b.persentaseLunas - a.persentaseLunas)[0]?.persentaseLunas || 0}% lunas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Statistik per Toko</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Toko</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
                <TableHead className="text-right">Terbayar</TableHead>
                <TableHead className="text-right">Sisa Piutang</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Tingkat Pelunasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((toko) => (
                <TableRow key={toko.id}>
                  <TableCell className="font-medium">{toko.nama}</TableCell>
                  <TableCell className="text-right">{formatRupiah(toko.totalNilai)}</TableCell>
                  <TableCell className="text-right text-success">{formatRupiah(toko.totalTerbayar)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatRupiah(toko.totalPiutang)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {toko.lunas} lunas
                      </Badge>
                      {toko.terlambat > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {toko.terlambat} terlambat
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={toko.persentaseLunas} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">{toko.persentaseLunas}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
