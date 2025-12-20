import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface BackupData {
  version: string;
  createdAt: string;
  toko: any[];
  transaksi: any[];
  item_transaksi: any[];
  pembayaran: any[];
}

export function useDataManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const exportData = async (): Promise<BackupData | null> => {
    setIsLoading(true);
    try {
      // Fetch all data
      const [tokoRes, transaksiRes, itemRes, pembayaranRes] = await Promise.all([
        supabase.from('toko').select('*'),
        supabase.from('transaksi').select('*'),
        supabase.from('item_transaksi').select('*'),
        supabase.from('pembayaran').select('*'),
      ]);

      if (tokoRes.error) throw tokoRes.error;
      if (transaksiRes.error) throw transaksiRes.error;
      if (itemRes.error) throw itemRes.error;
      if (pembayaranRes.error) throw pembayaranRes.error;

      const backupData: BackupData = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        toko: tokoRes.data || [],
        transaksi: transaksiRes.data || [],
        item_transaksi: itemRes.data || [],
        pembayaran: pembayaranRes.data || [],
      };

      return backupData;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal mengekspor data', 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackup = async () => {
    const data = await exportData();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-piutang-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ 
      title: 'Sukses', 
      description: `Backup berhasil diunduh (${data.toko.length} toko, ${data.transaksi.length} transaksi)` 
    });
  };

  const importData = async (file: File): Promise<boolean> => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      // Validate backup structure
      if (!data.version || !data.toko || !data.transaksi) {
        throw new Error('Format backup tidak valid');
      }

      // Clear existing data (in reverse order due to foreign keys)
      await supabase.from('pembayaran').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('item_transaksi').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('transaksi').delete().neq('id', '');
      await supabase.from('toko').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert data in order (respecting foreign keys)
      if (data.toko.length > 0) {
        const { error: tokoError } = await supabase.from('toko').insert(data.toko);
        if (tokoError) throw tokoError;
      }

      if (data.transaksi.length > 0) {
        const { error: transaksiError } = await supabase.from('transaksi').insert(data.transaksi);
        if (transaksiError) throw transaksiError;
      }

      if (data.item_transaksi.length > 0) {
        const { error: itemError } = await supabase.from('item_transaksi').insert(data.item_transaksi);
        if (itemError) throw itemError;
      }

      if (data.pembayaran.length > 0) {
        const { error: pembayaranError } = await supabase.from('pembayaran').insert(data.pembayaran);
        if (pembayaranError) throw pembayaranError;
      }

      toast({ 
        title: 'Sukses', 
        description: `Data berhasil diimpor (${data.toko.length} toko, ${data.transaksi.length} transaksi)` 
      });
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Gagal mengimpor data', 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async (
    refetchToko: () => Promise<void>,
    refetchTransaksi: () => Promise<void>
  ) => {
    setIsLoading(true);
    try {
      await Promise.all([refetchToko(), refetchTransaksi()]);
      toast({ 
        title: 'Sukses', 
        description: 'Data berhasil disinkronkan dari cloud' 
      });
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menyinkronkan data', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pushToCloud = async (
    refetchToko: () => Promise<void>,
    refetchTransaksi: () => Promise<void>
  ) => {
    setIsLoading(true);
    try {
      // Data is already in cloud via Supabase, just verify connection
      const { error } = await supabase.from('toko').select('id').limit(1);
      if (error) throw error;
      
      // Refresh to confirm sync
      await Promise.all([refetchToko(), refetchTransaksi()]);
      
      toast({ 
        title: 'Sukses', 
        description: 'Data sudah tersimpan di cloud' 
      });
    } catch (error) {
      console.error('Error pushing to cloud:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal mengirim data ke cloud', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    downloadBackup,
    importData,
    exportData,
    syncFromCloud,
    pushToCloud,
  };
}
