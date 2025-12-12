import { useMemo, useState } from 'react';
import { FileDown, FileSpreadsheet, TrendingUp, Store, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PiutangChart } from './PiutangChart';
import { TokoStats } from './TokoStats';
import { Transaksi, Toko } from '@/types';
import { formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LaporanPageProps {
  transaksi: Transaksi[];
  toko: Toko[];
}

type PeriodFilter = '6bulan' | '12bulan' | 'tahunIni';

export function LaporanPage({ transaksi, toko }: LaporanPageProps) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<PeriodFilter>('6bulan');

  // Calculate monthly data for chart
  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthsToShow = period === '6bulan' ? 6 : period === '12bulan' ? 12 : now.getMonth() + 1;
    
    const months: { bulan: string; piutang: number; terbayar: number; transaksi: number }[] = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = targetDate.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      
      const monthTransaksi = transaksi.filter(t => {
        const tDate = new Date(t.tanggal);
        return tDate.getMonth() === targetDate.getMonth() && 
               tDate.getFullYear() === targetDate.getFullYear();
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
    }
    
    return months;
  }, [transaksi, period]);

  // Calculate per-toko stats
  const tokoStats = useMemo(() => {
    return toko.map(t => {
      const tokoTransaksi = transaksi.filter(tr => tr.tokoId === t.id);
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
    }).sort((a, b) => b.totalNilai - a.totalNilai);
  }, [transaksi, toko]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalPiutang = transaksi.reduce((sum, t) => sum + t.sisaPiutang, 0);
    const totalTerbayar = transaksi.reduce((sum, t) => 
      sum + t.pembayaran.reduce((psum, p) => psum + p.jumlah, 0), 0
    );
    const totalTransaksi = transaksi.length;
    const transaksiTerlambat = transaksi.filter(t => t.status === 'terlambat').length;
    
    return { totalPiutang, totalTerbayar, totalTransaksi, transaksiTerlambat };
  }, [transaksi]);

  const exportToExcel = () => {
    // Sheet 1: Summary per Toko
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

    // Sheet 2: Detail Transaksi
    const transaksiData = transaksi.map(t => ({
      'ID Transaksi': t.id,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Toko': t.toko.nama,
      'Total Harga': t.totalHarga,
      'Tipe Pembayaran': t.tipePembayaran === 'cash' ? 'Cash' : 'Tempo',
      'Jatuh Tempo': t.jatuhTempo ? new Date(t.jatuhTempo).toLocaleDateString('id-ID') : '-',
      'Status': t.status.replace('_', ' ').toUpperCase(),
      'Sisa Piutang': t.sisaPiutang,
    }));

    // Sheet 3: Monthly Summary
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
    
    // Title
    doc.setFontSize(18);
    doc.text('Laporan Piutang FurniTrack', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary Section
    doc.setFontSize(12);
    doc.text('Ringkasan', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Piutang: ${formatRupiah(summaryStats.totalPiutang)}`, 14, 48);
    doc.text(`Total Terbayar: ${formatRupiah(summaryStats.totalTerbayar)}`, 14, 54);
    doc.text(`Total Transaksi: ${summaryStats.totalTransaksi}`, 14, 60);
    doc.text(`Transaksi Terlambat: ${summaryStats.transaksiTerlambat}`, 14, 66);
    
    // Toko Stats Table
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
    
    // New page for transaction details
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Detail Transaksi', 14, 20);
    
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Tanggal', 'Toko', 'Total', 'Status', 'Sisa']],
      body: transaksi.slice(0, 20).map(t => [
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
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6bulan">6 Bulan Terakhir</SelectItem>
              <SelectItem value="12bulan">12 Bulan Terakhir</SelectItem>
              <SelectItem value="tahunIni">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Piutang</p>
                <p className="text-xl font-bold">{formatRupiah(summaryStats.totalPiutang)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Terbayar</p>
                <p className="text-xl font-bold">{formatRupiah(summaryStats.totalTerbayar)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Store className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-xl font-bold">{summaryStats.totalTransaksi}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
                <p className="text-xl font-bold">{summaryStats.transaksiTerlambat} transaksi</p>
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
