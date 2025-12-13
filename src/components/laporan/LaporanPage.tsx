import { useMemo, useState } from 'react';
import { FileDown, FileSpreadsheet, TrendingUp, Store, BarChart3, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PiutangChart } from './PiutangChart';
import { TokoStats } from './TokoStats';
import { Transaksi, Toko } from '@/types';
import { formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LaporanPageProps {
  transaksi: Transaksi[];
  toko: Toko[];
}

type PeriodFilter = '6bulan' | '12bulan' | 'tahunIni' | 'custom';

export function LaporanPage({ transaksi, toko }: LaporanPageProps) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<PeriodFilter>('6bulan');
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Calculate date range based on period filter
  const dateRange = useMemo(() => {
    const now = new Date();
    
    if (period === 'custom' && startDate && endDate) {
      return { start: startOfMonth(startDate), end: endOfMonth(endDate) };
    }
    
    switch (period) {
      case '6bulan':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case '12bulan':
        return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
      case 'tahunIni':
        return { start: startOfYear(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    }
  }, [period, startDate, endDate]);

  // Filter transaksi by date range
  const filteredTransaksi = useMemo(() => {
    return transaksi.filter(t => {
      const tDate = new Date(t.tanggal);
      return isWithinInterval(tDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [transaksi, dateRange]);

  // Calculate monthly data for chart
  const monthlyData = useMemo(() => {
    const months: { bulan: string; piutang: number; terbayar: number; transaksi: number }[] = [];
    
    let current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const targetMonth = current.getMonth();
      const targetYear = current.getFullYear();
      const monthName = format(current, 'MMM yy', { locale: id });
      
      const monthTransaksi = transaksi.filter(t => {
        const tDate = new Date(t.tanggal);
        return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
      });
      
      const totalPiutang = monthTransaksi
        .filter(t => t.tipePembayaran === 'tempo')
        .reduce((sum, t) => sum + t.totalHarga, 0);
      
      const totalTerbayar = monthTransaksi
        .flatMap(t => t.pembayaran)
        .reduce((sum, p) => sum + p.jumlah, 0);
      
      months.push({
        bulan: monthName,
        piutang: totalPiutang,
        terbayar: totalTerbayar,
        transaksi: monthTransaksi.length,
      });
      
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    
    return months;
  }, [transaksi, dateRange]);

  // Calculate per-toko stats (filtered)
  const tokoStats = useMemo(() => {
    return toko.map(t => {
      const tokoTransaksi = filteredTransaksi.filter(tr => tr.tokoId === t.id);
      const totalTransaksi = tokoTransaksi.length;
      const totalPiutang = tokoTransaksi.reduce((sum, tr) => sum + tr.sisaPiutang, 0);
      const totalTerbayar = tokoTransaksi.reduce((sum, tr) => 
        sum + tr.pembayaran.reduce((psum, p) => psum + p.jumlah, 0), 0
      );
      const totalNilai = tokoTransaksi.reduce((sum, tr) => sum + tr.totalHarga, 0);
      const terlambat = tokoTransaksi.filter(tr => tr.status === 'terlambat').length;
      const lunas = tokoTransaksi.filter(tr => tr.status === 'lunas').length;
      
      return {
        id: t.id,
        nama: t.nama,
        totalTransaksi,
        totalPiutang,
        totalTerbayar,
        totalNilai,
        terlambat,
        lunas,
        persentaseLunas: totalTransaksi > 0 ? Math.round((lunas / totalTransaksi) * 100) : 0,
      };
    }).filter(t => t.totalTransaksi > 0).sort((a, b) => b.totalNilai - a.totalNilai);
  }, [filteredTransaksi, toko]);

  // Summary stats (filtered)
  const summaryStats = useMemo(() => {
    const totalPiutang = filteredTransaksi.reduce((sum, t) => sum + t.sisaPiutang, 0);
    const totalTerbayar = filteredTransaksi.reduce((sum, t) => 
      sum + t.pembayaran.reduce((psum, p) => psum + p.jumlah, 0), 0
    );
    const totalTransaksi = filteredTransaksi.length;
    const transaksiTerlambat = filteredTransaksi.filter(t => t.status === 'terlambat').length;
    
    return { totalPiutang, totalTerbayar, totalTransaksi, transaksiTerlambat };
  }, [filteredTransaksi]);

  const handlePeriodChange = (value: PeriodFilter) => {
    setPeriod(value);
    if (value !== 'custom') {
      const now = new Date();
      switch (value) {
        case '6bulan':
          setStartDate(subMonths(now, 5));
          setEndDate(now);
          break;
        case '12bulan':
          setStartDate(subMonths(now, 11));
          setEndDate(now);
          break;
        case 'tahunIni':
          setStartDate(startOfYear(now));
          setEndDate(now);
          break;
      }
    }
  };

  const exportToExcel = () => {
    const tokoData = tokoStats.map(t => ({
      'Nama Toko': t.nama,
      'Total Transaksi': t.totalTransaksi,
      'Total Nilai': t.totalNilai,
      'Total Terbayar': t.totalTerbayar,
      'Sisa Piutang': t.totalPiutang,
      'Transaksi Lunas': t.lunas,
      'Transaksi Terlambat': t.terlambat,
      'Persentase Lunas': `${t.persentaseLunas}%`,
    }));

    const transaksiData = filteredTransaksi.map(t => ({
      'ID Transaksi': t.id,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Toko': t.toko.nama,
      'Total Harga': t.totalHarga,
      'Tipe Pembayaran': t.tipePembayaran === 'cash' ? 'Cash' : 'Tempo',
      'Jatuh Tempo': t.jatuhTempo ? new Date(t.jatuhTempo).toLocaleDateString('id-ID') : '-',
      'Status': t.status.replace('_', ' ').toUpperCase(),
      'Sisa Piutang': t.sisaPiutang,
    }));

    const monthlyExport = monthlyData.map(m => ({
      'Bulan': m.bulan,
      'Jumlah Transaksi': m.transaksi,
      'Total Piutang Baru': m.piutang,
      'Total Terbayar': m.terbayar,
    }));

    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.json_to_sheet(tokoData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Statistik Toko');
    
    const ws2 = XLSX.utils.json_to_sheet(transaksiData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Detail Transaksi');
    
    const ws3 = XLSX.utils.json_to_sheet(monthlyExport);
    XLSX.utils.book_append_sheet(wb, ws3, 'Ringkasan Bulanan');
    
    XLSX.writeFile(wb, `Laporan_FurniTrack_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({ title: 'Sukses', description: 'Laporan Excel berhasil diunduh' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text('Laporan Piutang FurniTrack', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Periode: ${format(dateRange.start, 'd MMM yyyy', { locale: id })} - ${format(dateRange.end, 'd MMM yyyy', { locale: id })}`, pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Ringkasan', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Piutang: ${formatRupiah(summaryStats.totalPiutang)}`, 14, 48);
    doc.text(`Total Terbayar: ${formatRupiah(summaryStats.totalTerbayar)}`, 14, 54);
    doc.text(`Total Transaksi: ${summaryStats.totalTransaksi}`, 14, 60);
    doc.text(`Transaksi Terlambat: ${summaryStats.transaksiTerlambat}`, 14, 66);
    
    doc.setFontSize(12);
    doc.text('Statistik per Toko', 14, 80);
    
    autoTable(doc, {
      startY: 85,
      head: [['Toko', 'Total Nilai', 'Sisa Piutang', 'Lunas', 'Terlambat']],
      body: tokoStats.map(t => [
        t.nama,
        formatRupiah(t.totalNilai),
        formatRupiah(t.totalPiutang),
        t.lunas.toString(),
        t.terlambat.toString(),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Detail Transaksi', 14, 20);
    
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Tanggal', 'Toko', 'Total', 'Status', 'Sisa']],
      body: filteredTransaksi.slice(0, 20).map(t => [
        t.id,
        new Date(t.tanggal).toLocaleDateString('id-ID'),
        t.toko.nama.substring(0, 15),
        formatRupiah(t.totalHarga),
        t.status.replace('_', ' '),
        formatRupiah(t.sisaPiutang),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.save(`Laporan_FurniTrack_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({ title: 'Sukses', description: 'Laporan PDF berhasil diunduh' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filters and Export Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={period} onValueChange={(v) => handlePeriodChange(v as PeriodFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6bulan">6 Bulan Terakhir</SelectItem>
                <SelectItem value="12bulan">12 Bulan Terakhir</SelectItem>
                <SelectItem value="tahunIni">Tahun Ini</SelectItem>
                <SelectItem value="custom">Rentang Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("w-[130px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM yyyy', { locale: id }) : 'Dari'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("w-[130px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM yyyy', { locale: id }) : 'Sampai'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span> PDF
            </Button>
          </div>
        </div>
        
        {/* Period indicator */}
        <p className="text-sm text-muted-foreground">
          Menampilkan data: {format(dateRange.start, 'd MMM yyyy', { locale: id })} - {format(dateRange.end, 'd MMM yyyy', { locale: id })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Piutang</p>
                <p className="text-base sm:text-xl font-bold truncate">{formatRupiah(summaryStats.totalPiutang)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 shrink-0">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Terbayar</p>
                <p className="text-base sm:text-xl font-bold truncate">{formatRupiah(summaryStats.totalTerbayar)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary shrink-0">
                <Store className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Transaksi</p>
                <p className="text-base sm:text-xl font-bold">{summaryStats.totalTransaksi}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Terlambat</p>
                <p className="text-base sm:text-xl font-bold">{summaryStats.transaksiTerlambat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Grafik Bulanan</TabsTrigger>
          <TabsTrigger value="toko">Statistik Toko</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perkembangan Piutang Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <PiutangChart data={monthlyData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toko">
          <TokoStats stats={tokoStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
