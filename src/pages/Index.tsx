import { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Plus
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockToko, mockTransaksi, formatRupiah } from '@/data/mockData';
import { Toko, Transaksi, StatusFilter } from '@/types';
import { useToast } from '@/hooks/use-toast';

const pageConfig: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan piutang dan transaksi' },
  toko: { title: 'Data Toko', subtitle: 'Kelola data pelanggan toko' },
  transaksi: { title: 'Transaksi Baru', subtitle: 'Buat transaksi penjualan' },
  piutang: { title: 'Daftar Piutang', subtitle: 'Kelola semua piutang' },
  riwayat: { title: 'Riwayat Transaksi', subtitle: 'Lihat semua transaksi' },
  settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
};

export default function Index() {
  const { toast } = useToast();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [tokoList, setTokoList] = useState<Toko[]>(mockToko);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(mockTransaksi);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  
  // Dialog states
  const [showTokoForm, setShowTokoForm] = useState(false);
  const [editingToko, setEditingToko] = useState<Toko | undefined>();
  const [showBayarForm, setShowBayarForm] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | undefined>();

  // Stats calculation
  const totalPiutang = transaksiList.reduce((sum, t) => sum + t.sisaPiutang, 0);
  const totalTerlambat = transaksiList
    .filter(t => t.status === 'terlambat')
    .reduce((sum, t) => sum + t.sisaPiutang, 0);
  const totalLunas = transaksiList
    .filter(t => t.status === 'lunas')
    .reduce((sum, t) => sum + t.totalHarga, 0);
  const jumlahTerlambat = transaksiList.filter(t => t.status === 'terlambat').length;

  const sendWhatsApp = (transaksi: Transaksi) => {
    const message = `Halo ${transaksi.toko.nama},\n\nIni adalah pengingat untuk pembayaran piutang:\n- ID: ${transaksi.id}\n- Sisa: ${formatRupiah(transaksi.sisaPiutang)}\n- Jatuh Tempo: ${transaksi.jatuhTempo?.toLocaleDateString('id-ID')}\n\nMohon segera melakukan pembayaran. Terima kasih.`;
    const url = `https://wa.me/${transaksi.toko.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast({ title: 'WhatsApp', description: 'Membuka WhatsApp...' });
  };

  const sendWhatsAppToko = (toko: Toko) => {
    const url = `https://wa.me/${toko.whatsapp}`;
    window.open(url, '_blank');
  };

  const handleBayar = (transaksi: Transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowBayarForm(true);
  };

  const handleSubmitBayar = (data: { jumlah: number; metode: string; catatan: string }) => {
    if (!selectedTransaksi) return;
    
    const newPembayaran = {
      id: `PAY${Date.now()}`,
      transaksiId: selectedTransaksi.id,
      tanggal: new Date(),
      jumlah: data.jumlah,
      metode: data.metode as 'transfer' | 'cash' | 'lainnya',
      catatan: data.catatan,
    };
    
    const newSisa = selectedTransaksi.sisaPiutang - data.jumlah;
    const updatedTransaksi = transaksiList.map(t => {
      if (t.id === selectedTransaksi.id) {
        return {
          ...t,
          pembayaran: [...t.pembayaran, newPembayaran],
          sisaPiutang: newSisa,
          status: newSisa === 0 ? 'lunas' as const : t.status,
        };
      }
      return t;
    });
    
    setTransaksiList(updatedTransaksi);
    setShowBayarForm(false);
    setSelectedTransaksi(undefined);
    toast({ title: 'Sukses', description: 'Pembayaran berhasil dicatat' });
  };

  const handleAddToko = (data: Omit<Toko, 'id' | 'createdAt'>) => {
    const newToko: Toko = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    setTokoList([...tokoList, newToko]);
    setShowTokoForm(false);
    setEditingToko(undefined);
  };

  const handleEditToko = (toko: Toko) => {
    setEditingToko(toko);
    setShowTokoForm(true);
  };

  const handleDeleteToko = (toko: Toko) => {
    setTokoList(tokoList.filter(t => t.id !== toko.id));
    toast({ title: 'Dihapus', description: 'Data toko berhasil dihapus' });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                title="Terbayar Bulan Ini"
                value={formatRupiah(totalLunas)}
                icon={TrendingUp}
                trend={{ value: '12% dari bulan lalu', positive: true }}
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
                transaksi={transaksiList}
                onKirimWA={sendWhatsApp}
              />
              <RecentTransactions
                transaksi={transaksiList}
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
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tokoList.map((toko) => (
                <TokoCard
                  key={toko.id}
                  toko={toko}
                  onEdit={handleEditToko}
                  onDelete={handleDeleteToko}
                  onWhatsApp={sendWhatsAppToko}
                />
              ))}
            </div>
          </div>
        );
      
      case 'transaksi':
        return (
          <div className="max-w-4xl animate-fade-in">
            <TransaksiForm
              tokoList={tokoList}
              onSubmit={(data) => {
                const toko = tokoList.find(t => t.id === data.tokoId)!;
                const totalHarga = data.items.reduce((sum, item) => sum + item.subtotal, 0);
                const dpAmount = data.dpAmount || 0;
                
                const newTransaksi: Transaksi = {
                  id: `TRX${Date.now().toString().slice(-6)}`,
                  tokoId: data.tokoId,
                  toko,
                  tanggal: new Date(),
                  items: data.items,
                  totalHarga,
                  tipePembayaran: data.tipePembayaran,
                  jatuhTempo: data.jatuhTempo ? new Date(data.jatuhTempo) : undefined,
                  status: data.tipePembayaran === 'cash' ? 'lunas' : 'belum_lunas',
                  pembayaran: dpAmount > 0 ? [{
                    id: `PAY${Date.now()}`,
                    transaksiId: '',
                    tanggal: new Date(),
                    jumlah: dpAmount,
                    metode: 'cash',
                    catatan: 'DP awal',
                  }] : [],
                  sisaPiutang: data.tipePembayaran === 'cash' ? 0 : totalHarga - dpAmount,
                  catatan: data.catatan,
                };
                
                setTransaksiList([newTransaksi, ...transaksiList]);
              }}
            />
          </div>
        );
      
      case 'piutang':
        return (
          <div className="space-y-6 animate-fade-in">
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
            
            <PiutangTable
              transaksi={transaksiList}
              statusFilter={statusFilter}
              onBayar={handleBayar}
              onDetail={(t) => toast({ title: 'Detail', description: `Melihat detail ${t.id}` })}
              onKirimWA={sendWhatsApp}
            />
          </div>
        );
      
      case 'riwayat':
        return (
          <div className="space-y-6 animate-fade-in">
            <PiutangTable
              transaksi={transaksiList}
              statusFilter="semua"
              onBayar={handleBayar}
              onDetail={(t) => toast({ title: 'Detail', description: `Melihat detail ${t.id}` })}
              onKirimWA={sendWhatsApp}
            />
          </div>
        );
      
      case 'settings':
        return (
          <div className="card-elevated rounded-xl p-6 max-w-2xl animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Pengaturan Aplikasi</h3>
            <p className="text-muted-foreground">
              Fitur pengaturan akan segera tersedia. Anda dapat mengkonfigurasi notifikasi WhatsApp, format pesan, dan preferensi lainnya di sini.
            </p>
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
        <Header title={currentPage.title} subtitle={currentPage.subtitle} />
        
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
    </div>
  );
}
