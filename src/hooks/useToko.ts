import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Toko } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useToko() {
  const [tokoList, setTokoList] = useState<Toko[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchToko = async () => {
    try {
      const { data, error } = await supabase
        .from('toko')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: Toko[] = (data || []).map((t) => ({
        id: t.id,
        nama: t.nama,
        alamat: t.alamat,
        telepon: t.telepon,
        whatsapp: t.whatsapp,
        email: t.email || undefined,
        createdAt: new Date(t.created_at),
      }));

      setTokoList(mappedData);
    } catch (error) {
      console.error('Error fetching toko:', error);
      toast({ title: 'Error', description: 'Gagal memuat data toko', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addToko = async (data: Omit<Toko, 'id' | 'createdAt'>) => {
    try {
      const { data: newToko, error } = await supabase
        .from('toko')
        .insert({
          nama: data.nama,
          alamat: data.alamat,
          telepon: data.telepon,
          whatsapp: data.whatsapp,
          email: data.email || null,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedToko: Toko = {
        id: newToko.id,
        nama: newToko.nama,
        alamat: newToko.alamat,
        telepon: newToko.telepon,
        whatsapp: newToko.whatsapp,
        email: newToko.email || undefined,
        createdAt: new Date(newToko.created_at),
      };

      setTokoList((prev) => [mappedToko, ...prev]);
      toast({ title: 'Sukses', description: 'Toko berhasil ditambahkan' });
      return mappedToko;
    } catch (error) {
      console.error('Error adding toko:', error);
      toast({ title: 'Error', description: 'Gagal menambahkan toko', variant: 'destructive' });
      return null;
    }
  };

  const updateToko = async (id: string, data: Omit<Toko, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('toko')
        .update({
          nama: data.nama,
          alamat: data.alamat,
          telepon: data.telepon,
          whatsapp: data.whatsapp,
          email: data.email || null,
        })
        .eq('id', id);

      if (error) throw error;

      setTokoList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      toast({ title: 'Sukses', description: 'Toko berhasil diperbarui' });
    } catch (error) {
      console.error('Error updating toko:', error);
      toast({ title: 'Error', description: 'Gagal memperbarui toko', variant: 'destructive' });
    }
  };

  const deleteToko = async (id: string) => {
    try {
      const { error } = await supabase.from('toko').delete().eq('id', id);

      if (error) throw error;

      setTokoList((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Sukses', description: 'Toko berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting toko:', error);
      toast({ title: 'Error', description: 'Gagal menghapus toko', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchToko();
  }, []);

  return {
    tokoList,
    loading,
    addToko,
    updateToko,
    deleteToko,
    refetch: fetchToko,
  };
}
