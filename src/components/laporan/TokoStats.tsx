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
  const sortedByPiutang = [...stats].sort((a, b) => b.totalPiutang - a.totalPiutang);
  const sortedByTransaksi = [...stats].sort((a, b) => b.totalTransaksi - a.totalTransaksi);
  const sortedByLunas = [...stats].filter(s => s.totalTransaksi > 0).sort((a, b) => b.persentaseLunas - a.persentaseLunas);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toko dengan Piutang Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {stats.length > 0 && sortedByPiutang[0] ? (
              <>
                <p className="text-base sm:text-lg font-bold truncate">{sortedByPiutang[0].nama}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {formatRupiah(sortedByPiutang[0].totalPiutang)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Tidak ada data</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toko Paling Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {stats.length > 0 && sortedByTransaksi[0] ? (
              <>
                <p className="text-base sm:text-lg font-bold truncate">{sortedByTransaksi[0].nama}</p>
                <p className="text-sm text-muted-foreground">
                  {sortedByTransaksi[0].totalTransaksi} transaksi
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Tidak ada data</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tingkat Pelunasan Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {sortedByLunas.length > 0 && sortedByLunas[0] ? (
              <>
                <p className="text-base sm:text-lg font-bold truncate">{sortedByLunas[0].nama}</p>
                <p className="text-sm text-muted-foreground">
                  {sortedByLunas[0].persentaseLunas}% lunas
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Tidak ada data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Statistik per Toko</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Nama Toko</TableHead>
                <TableHead className="text-right min-w-[100px]">Total Nilai</TableHead>
                <TableHead className="text-right min-w-[100px]">Terbayar</TableHead>
                <TableHead className="text-right min-w-[100px]">Sisa Piutang</TableHead>
                <TableHead className="text-center min-w-[140px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Pelunasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Tidak ada data transaksi pada periode ini
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((toko) => (
                  <TableRow key={toko.id}>
                    <TableCell className="font-medium">{toko.nama}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatRupiah(toko.totalNilai)}</TableCell>
                    <TableCell className="text-right text-success whitespace-nowrap">{formatRupiah(toko.totalTerbayar)}</TableCell>
                    <TableCell className="text-right text-destructive whitespace-nowrap">{formatRupiah(toko.totalPiutang)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {toko.lunas} lunas
                        </Badge>
                        {toko.terlambat > 0 && (
                          <Badge variant="destructive" className="text-xs whitespace-nowrap">
                            {toko.terlambat} terlambat
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={toko.persentaseLunas} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{toko.persentaseLunas}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
