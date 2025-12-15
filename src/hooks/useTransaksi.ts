import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaksi, Toko, ItemTransaksi, Pembayaran } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useTransaksi() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransaksi = async () => {
    try {
      // Fetch transaksi with toko data
      const { data: transaksiData, error: transaksiError } = await supabase
        .from('transaksi')
        .select(`
          *,
          toko:toko_id (*)
        `)
        .order('created_at', { ascending: false });

      if (transaksiError) throw transaksiError;

      // Fetch items and pembayaran for each transaksi
      const transaksiWithDetails = await Promise.all(
        (transaksiData || []).map(async (t) => {
          const [itemsRes, pembayaranRes] = await Promise.all([
            supabase.from('item_transaksi').select('*').eq('transaksi_id', t.id),
            supabase.from('pembayaran').select('*').eq('transaksi_id', t.id).order('tanggal', { ascending: true }),
          ]);

          const items: ItemTransaksi[] = (itemsRes.data || []).map((item) => ({
            id: item.id,
            namaBarang: item.nama_barang,
            jumlah: item.jumlah,
            hargaSatuan: Number(item.harga_satuan),
            subtotal: Number(item.subtotal),
          }));

          const pembayaran: Pembayaran[] = (pembayaranRes.data || []).map((p) => ({
            id: p.id,
            transaksiId: p.transaksi_id,
            tanggal: new Date(p.tanggal),
            jumlah: Number(p.jumlah),
            metode: p.metode as 'transfer' | 'cash' | 'lainnya',
            catatan: p.catatan || undefined,
          }));

          const toko: Toko = {
            id: t.toko.id,
            nama: t.toko.nama,
            alamat: t.toko.alamat,
            telepon: t.toko.telepon,
            whatsapp: t.toko.whatsapp,
            email: t.toko.email || undefined,
            createdAt: new Date(t.toko.created_at),
          };

          const transaksi: Transaksi = {
            id: t.id,
            tokoId: t.toko_id,
            toko,
            tanggal: new Date(t.tanggal),
            items,
            totalHarga: Number(t.total_harga),
            tipePembayaran: t.tipe_pembayaran as 'cash' | 'tempo',
            jatuhTempo: t.jatuh_tempo ? new Date(t.jatuh_tempo) : undefined,
            status: t.status as 'lunas' | 'belum_lunas' | 'jatuh_tempo' | 'terlambat',
            pembayaran,
            sisaPiutang: Number(t.sisa_piutang),
            catatan: t.catatan || undefined,
          };

          return transaksi;
        })
      );

      setTransaksiList(transaksiWithDetails);
    } catch (error) {
      console.error('Error fetching transaksi:', error);
      toast({ title: 'Error', description: 'Gagal memuat data transaksi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addTransaksi = async (data: {
    tokoId: string;
    items: { namaBarang: string; jumlah: number; hargaSatuan: number; subtotal: number }[];
    tipePembayaran: 'cash' | 'tempo';
    jatuhTempo?: string;
    dpAmount?: number;
    catatan?: string;
  }, toko: Toko) => {
    try {
      const totalHarga = data.items.reduce((sum, item) => sum + item.subtotal, 0);
      const dpAmount = data.dpAmount || 0;
      const sisaPiutang = data.tipePembayaran === 'cash' ? 0 : totalHarga - dpAmount;
      const transaksiId = `TRX${Date.now().toString().slice(-6)}`;

      // Insert transaksi
      const { error: transaksiError } = await supabase.from('transaksi').insert({
        id: transaksiId,
        toko_id: data.tokoId,
        total_harga: totalHarga,
        tipe_pembayaran: data.tipePembayaran,
        jatuh_tempo: data.jatuhTempo ? new Date(data.jatuhTempo).toISOString() : null,
        sisa_piutang: sisaPiutang,
        catatan: data.catatan || null,
      });

      if (transaksiError) throw transaksiError;

      // Insert items
      const itemsToInsert = data.items.map((item) => ({
        transaksi_id: transaksiId,
        nama_barang: item.namaBarang,
        jumlah: item.jumlah,
        harga_satuan: item.hargaSatuan,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase.from('item_transaksi').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // Insert DP if exists
      if (dpAmount > 0) {
        const { error: dpError } = await supabase.from('pembayaran').insert({
          transaksi_id: transaksiId,
          jumlah: dpAmount,
          metode: 'cash',
          catatan: 'DP awal',
        });
        if (dpError) throw dpError;
      }

      toast({ title: 'Sukses', description: 'Transaksi berhasil dibuat' });
      await fetchTransaksi();
    } catch (error) {
      console.error('Error adding transaksi:', error);
      toast({ title: 'Error', description: 'Gagal membuat transaksi', variant: 'destructive' });
    }
  };

  const addPembayaran = async (transaksiId: string, data: { jumlah: number; metode: string; catatan: string }) => {
    try {
      // Get current transaksi
      const transaksi = transaksiList.find((t) => t.id === transaksiId);
      if (!transaksi) throw new Error('Transaksi tidak ditemukan');

      // Insert pembayaran
      const { error: pembayaranError } = await supabase.from('pembayaran').insert({
        transaksi_id: transaksiId,
        jumlah: data.jumlah,
        metode: data.metode,
        catatan: data.catatan || null,
      });

      if (pembayaranError) throw pembayaranError;

      // Update transaksi sisa_piutang
      const newSisa = transaksi.sisaPiutang - data.jumlah;
      const { error: updateError } = await supabase
        .from('transaksi')
        .update({ sisa_piutang: newSisa })
        .eq('id', transaksiId);

      if (updateError) throw updateError;

      toast({ title: 'Sukses', description: 'Pembayaran berhasil dicatat' });
      await fetchTransaksi();
    } catch (error) {
      console.error('Error adding pembayaran:', error);
      toast({ title: 'Error', description: 'Gagal mencatat pembayaran', variant: 'destructive' });
    }
  };

  const deleteTransaksi = async (transaksiId: string) => {
    try {
      // Delete related pembayaran first
      const { error: pembayaranError } = await supabase
        .from('pembayaran')
        .delete()
        .eq('transaksi_id', transaksiId);
      
      if (pembayaranError) throw pembayaranError;

      // Delete related items
      const { error: itemsError } = await supabase
        .from('item_transaksi')
        .delete()
        .eq('transaksi_id', transaksiId);
      
      if (itemsError) throw itemsError;

      // Delete transaksi
      const { error: transaksiError } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', transaksiId);
      
      if (transaksiError) throw transaksiError;

      toast({ title: 'Sukses', description: 'Transaksi berhasil dihapus' });
      await fetchTransaksi();
    } catch (error) {
      console.error('Error deleting transaksi:', error);
      toast({ title: 'Error', description: 'Gagal menghapus transaksi', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  return {
    transaksiList,
    loading,
    addTransaksi,
    addPembayaran,
    deleteTransaksi,
    refetch: fetchTransaksi,
  };
}
