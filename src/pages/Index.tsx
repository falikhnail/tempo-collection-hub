import { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Receipt
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { JatuhTempoList } from '@/components/dashboard/JatuhTempoList';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PiutangTable } from '@/components/piutang/PiutangTable';
import { TokoCard } from '@/components/toko/TokoCard';
import { TransaksiForm } from '@/components/forms/TransaksiForm';
import { TokoForm } from '@/components/forms/TokoForm';
import { BayarForm } from '@/components/forms/BayarForm';
import { LaporanPage } from '@/components/laporan/LaporanPage';
import { TransaksiDetail } from '@/components/transaksi/TransaksiDetail';
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';
import { DataManagement } from '@/components/settings/DataManagement';
import { MessageTemplateEditor } from '@/components/settings/MessageTemplateEditor';
import { ReminderSchedule } from '@/components/notifications/ReminderSchedule';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRupiah } from '@/data/mockData';
import { Toko, Transaksi, StatusFilter } from '@/types';
import { useToko } from '@/hooks/useToko';
import { useTransaksi } from '@/hooks/useTransaksi';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const pageConfig: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan piutang dan transaksi' },
  toko: { title: 'Data Toko', subtitle: 'Kelola data pelanggan toko' },
  transaksi: { title: 'Transaksi Baru', subtitle: 'Buat transaksi penjualan' },
  piutang: { title: 'Daftar Piutang', subtitle: 'Kelola semua piutang' },
  riwayat: { title: 'Riwayat Transaksi', subtitle: 'Lihat semua transaksi' },
  pengingat: { title: 'Jadwal Pengingat', subtitle: 'Kelola notifikasi piutang jatuh tempo' },
  laporan: { title: 'Laporan', subtitle: 'Grafik dan statistik piutang' },
  settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
};

export default function Index() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date range filter state
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Database hooks
  const { tokoList, loading: tokoLoading, addToko, updateToko, deleteToko, refetch: refetchToko } = useToko();
  const { transaksiList, loading: transaksiLoading, addTransaksi, addPembayaran, deleteTransaksi, refetch: refetchTransaksi } = useTransaksi();
  const { formatMessage } = useMessageTemplates();
  
  // Dialog states
  const [showTokoForm, setShowTokoForm] = useState(false);
  const [editingToko, setEditingToko] = useState<Toko | undefined>();
  const [showBayarForm, setShowBayarForm] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | undefined>();

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleDetail = (transaksi: Transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowDetailDialog(true);
  };

  // Stats calculation
  const totalPiutang = transaksiList.reduce((sum, t) => sum + t.sisaPiutang, 0);
  const totalTerlambat = transaksiList
    .filter(t => t.status === 'terlambat')
    .reduce((sum, t) => sum + t.sisaPiutang, 0);
  const totalLunas = transaksiList
    .filter(t => t.status === 'lunas')
    .reduce((sum, t) => sum + t.totalHarga, 0);
  const jumlahTerlambat = transaksiList.filter(t => t.status === 'terlambat').length;

  // Monthly transaction stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthTransaksi = transaksiList.filter(t => {
      const date = new Date(t.tanggal);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalTransaksi = thisMonthTransaksi.length;
    const tempoTransaksi = thisMonthTransaksi.filter(t => t.tipePembayaran === 'tempo').length;
    const cashTransaksi = thisMonthTransaksi.filter(t => t.tipePembayaran === 'cash').length;
    const totalNominal = thisMonthTransaksi.reduce((sum, t) => sum + t.totalHarga, 0);
    
    return { totalTransaksi, tempoTransaksi, cashTransaksi, totalNominal };
  }, [transaksiList]);

  const sendWhatsApp = (transaksi: Transaksi) => {
    const message = formatMessage(undefined, {
      nama_toko: transaksi.toko.nama,
      id_transaksi: transaksi.id,
      sisa_piutang: formatRupiah(transaksi.sisaPiutang),
      jatuh_tempo: transaksi.jatuhTempo?.toLocaleDateString('id-ID') || '-',
    });
    const url = `https://wa.me/${transaksi.toko.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const sendWhatsAppToko = (toko: Toko) => {
    const url = `https://wa.me/${toko.whatsapp}`;
    window.open(url, '_blank');
  };

  const handleBayar = (transaksi: Transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowBayarForm(true);
  };

  const handleSubmitBayar = async (data: { jumlah: number; metode: string; catatan: string }) => {
    if (!selectedTransaksi) return;
    await addPembayaran(selectedTransaksi.id, data);
    setShowBayarForm(false);
    setSelectedTransaksi(undefined);
  };

  const handleAddToko = async (data: Omit<Toko, 'id' | 'createdAt'>) => {
    if (editingToko) {
      await updateToko(editingToko.id, data);
    } else {
      await addToko(data);
    }
    setShowTokoForm(false);
    setEditingToko(undefined);
  };

  const handleEditToko = (toko: Toko) => {
    setEditingToko(toko);
    setShowTokoForm(true);
  };

  const handleDeleteToko = async (toko: Toko) => {
    await deleteToko(toko.id);
  };

  const loading = tokoLoading || transaksiLoading;

  // Filter data based on search query and date range
  const filteredTransaksi = useMemo(() => {
    return transaksiList.filter(t => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchSearch = 
          t.toko.nama.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.toko.alamat.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }
      
      // Date range filter
      if (startDate || endDate) {
        const transaksiDate = new Date(t.tanggal);
        if (startDate && endDate) {
          if (!isWithinInterval(transaksiDate, { 
            start: startOfDay(startDate), 
            end: endOfDay(endDate) 
          })) return false;
        } else if (startDate) {
          if (transaksiDate < startOfDay(startDate)) return false;
        } else if (endDate) {
          if (transaksiDate > endOfDay(endDate)) return false;
        }
      }
      
      return true;
    });
  }, [transaksiList, searchQuery, startDate, endDate]);

  const filteredToko = tokoList.filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.nama.toLowerCase().includes(query) ||
      t.alamat.toLowerCase().includes(query) ||
      t.telepon.includes(query)
    );
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Total Piutang"
                value={formatRupiah(totalPiutang)}
                subtitle={`${transaksiList.filter(t => t.status !== 'lunas').length} transaksi aktif`}
                icon={Wallet}
                variant="primary"
              />
              <StatCard
                title="Piutang Terlambat"
                value={formatRupiah(totalTerlambat)}
                subtitle={`${jumlahTerlambat} transaksi`}
                icon={AlertTriangle}
                variant="danger"
              />
              <StatCard
                title="Transaksi Bulan Ini"
                value={`${monthlyStats.totalTransaksi}`}
                subtitle={`Tempo: ${monthlyStats.tempoTransaksi} | Cash: ${monthlyStats.cashTransaksi}`}
                icon={Receipt}
                variant="primary"
              />
              <StatCard
                title="Nominal Bulan Ini"
                value={formatRupiah(monthlyStats.totalNominal)}
                subtitle="total transaksi masuk"
                icon={TrendingUp}
              />
              <StatCard
                title="Lunas"
                value={`${transaksiList.filter(t => t.status === 'lunas').length}`}
                subtitle="transaksi selesai"
                icon={CheckCircle}
              />
            </div>
            
            {/* Two column layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              <JatuhTempoList
                transaksi={filteredTransaksi}
                onKirimWA={sendWhatsApp}
              />
              <RecentTransactions
                transaksi={filteredTransaksi}
                onViewAll={() => setActiveMenu('riwayat')}
              />
            </div>
          </div>
        );
      
      case 'toko':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
              <Button onClick={() => setShowTokoForm(true)} className="btn-primary-gradient">
                <Plus className="h-4 w-4 mr-1" /> Tambah Toko
              </Button>
            </div>
            
            {filteredToko.length === 0 ? (
              <div className="card-elevated rounded-xl p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'Tidak ada toko yang cocok dengan pencarian.' : 'Belum ada data toko. Klik "Tambah Toko" untuk menambahkan.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredToko.map((toko) => (
                  <TokoCard
                    key={toko.id}
                    toko={toko}
                    onEdit={handleEditToko}
                    onDelete={handleDeleteToko}
                    onWhatsApp={sendWhatsAppToko}
                  />
                ))}
              </div>
            )}
          </div>
        );
      
      case 'transaksi':
        return (
          <div className="max-w-4xl animate-fade-in">
            <TransaksiForm
              tokoList={tokoList}
              onSubmit={async (data) => {
                const toko = tokoList.find(t => t.id === data.tokoId);
                if (!toko) return;
                await addTransaksi({
                  tokoId: data.tokoId,
                  items: data.items.map(item => ({
                    namaBarang: item.namaBarang,
                    jumlah: item.jumlah,
                    hargaSatuan: item.hargaSatuan,
                    subtotal: item.subtotal,
                  })),
                  tipePembayaran: data.tipePembayaran,
                  jatuhTempo: data.jatuhTempo,
                  dpAmount: data.dpAmount,
                  catatan: data.catatan,
                }, toko);
              }}
            />
          </div>
        );
      
      case 'piutang':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Tabs
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <TabsList>
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="belum_lunas">Aktif</TabsTrigger>
                  <TabsTrigger value="terlambat">Terlambat</TabsTrigger>
                  <TabsTrigger value="lunas">Lunas</TabsTrigger>
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
            
            <PiutangTable
              transaksi={filteredTransaksi}
              statusFilter={statusFilter}
              onBayar={handleBayar}
              onDetail={handleDetail}
              onKirimWA={sendWhatsApp}
              onDelete={(t) => deleteTransaksi(t.id)}
            />
          </div>
        );
      
      case 'riwayat':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={clearDateFilter}
              />
            </div>
            
            <PiutangTable
              transaksi={filteredTransaksi}
              statusFilter="semua"
              onBayar={handleBayar}
              onDetail={handleDetail}
              onKirimWA={sendWhatsApp}
              onDelete={(t) => deleteTransaksi(t.id)}
            />
          </div>
        );
      
      case 'laporan':
        return (
          <LaporanPage transaksi={transaksiList} toko={tokoList} />
        );
      
      case 'pengingat':
        return (
          <div className="max-w-4xl animate-fade-in">
            <ReminderSchedule 
              transaksi={transaksiList} 
              onKirimWA={sendWhatsApp} 
            />
          </div>
        );
      
      case 'settings':
        return (
          <div className="max-w-3xl animate-fade-in space-y-6">
            <MessageTemplateEditor />
            <DataManagement 
              refetchToko={refetchToko} 
              refetchTransaksi={refetchTransaksi} 
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const currentPage = pageConfig[activeMenu] || pageConfig.dashboard;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      <main className="pl-64">
        <Header 
          title={currentPage.title} 
          subtitle={currentPage.subtitle} 
          transaksi={transaksiList}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
      
      {/* Toko Form Dialog */}
      <Dialog open={showTokoForm} onOpenChange={(open) => {
        setShowTokoForm(open);
        if (!open) setEditingToko(undefined);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingToko ? 'Edit Toko' : 'Tambah Toko Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingToko ? 'Perbarui informasi toko' : 'Masukkan informasi toko baru'}
            </DialogDescription>
          </DialogHeader>
          <TokoForm
            toko={editingToko}
            onSubmit={handleAddToko}
            onCancel={() => {
              setShowTokoForm(false);
              setEditingToko(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Bayar Form Dialog */}
      <Dialog open={showBayarForm} onOpenChange={setShowBayarForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pembayaran</DialogTitle>
            <DialogDescription>Masukkan jumlah pembayaran yang diterima</DialogDescription>
          </DialogHeader>
          {selectedTransaksi && (
            <BayarForm
              transaksi={selectedTransaksi}
              onSubmit={handleSubmitBayar}
              onCancel={() => {
                setShowBayarForm(false);
                setSelectedTransaksi(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Transaksi Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Informasi lengkap transaksi dan pembayaran</DialogDescription>
          </DialogHeader>
          {selectedTransaksi && (
            <TransaksiDetail transaksi={selectedTransaksi} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
