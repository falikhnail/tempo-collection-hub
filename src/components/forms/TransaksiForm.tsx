import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toko, ItemTransaksi } from '@/types';
import { formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface TransaksiFormProps {
  tokoList: Toko[];
  onSubmit: (data: TransaksiFormData) => void;
}

export interface TransaksiFormData {
  tokoId: string;
  items: ItemTransaksi[];
  tipePembayaran: 'cash' | 'tempo';
  jatuhTempo?: string;
  dpAmount?: number;
  catatan?: string;
}

export function TransaksiForm({ tokoList, onSubmit }: TransaksiFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<TransaksiFormData>({
    tokoId: '',
    items: [{ id: '1', namaBarang: '', jumlah: 1, hargaSatuan: 0, subtotal: 0 }],
    tipePembayaran: 'tempo',
    catatan: '',
  });

  const updateItem = (index: number, field: keyof ItemTransaksi, value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    
    if (field === 'namaBarang') {
      item.namaBarang = value as string;
    } else if (field === 'jumlah') {
      item.jumlah = Number(value) || 0;
    } else if (field === 'hargaSatuan') {
      item.hargaSatuan = Number(value) || 0;
    }
    
    item.subtotal = item.jumlah * item.hargaSatuan;
    newItems[index] = item;
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: String(Date.now()), namaBarang: '', jumlah: 1, hargaSatuan: 0, subtotal: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const totalHarga = formData.items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tokoId) {
      toast({ title: 'Error', description: 'Pilih toko terlebih dahulu', variant: 'destructive' });
      return;
    }
    
    if (formData.items.some(item => !item.namaBarang || item.hargaSatuan === 0)) {
      toast({ title: 'Error', description: 'Lengkapi semua item barang', variant: 'destructive' });
      return;
    }
    
    if (formData.tipePembayaran === 'tempo' && !formData.jatuhTempo) {
      toast({ title: 'Error', description: 'Tentukan tanggal jatuh tempo', variant: 'destructive' });
      return;
    }
    
    onSubmit(formData);
    toast({ title: 'Sukses', description: 'Transaksi berhasil disimpan' });
    
    // Reset form
    setFormData({
      tokoId: '',
      items: [{ id: '1', namaBarang: '', jumlah: 1, hargaSatuan: 0, subtotal: 0 }],
      tipePembayaran: 'tempo',
      catatan: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-elevated rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Informasi Transaksi</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Toko</Label>
            <Select
              value={formData.tokoId}
              onValueChange={(value) => setFormData({ ...formData, tokoId: value })}
            >
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                {tokoList.map((toko) => (
                  <SelectItem key={toko.id} value={toko.id}>
                    {toko.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Tipe Pembayaran</Label>
            <Select
              value={formData.tipePembayaran}
              onValueChange={(value: 'cash' | 'tempo') => 
                setFormData({ ...formData, tipePembayaran: value })
              }
            >
              <SelectTrigger className="input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="tempo">Tempo (Kredit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.tipePembayaran === 'tempo' && (
            <>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input
                  type="date"
                  className="input-modern"
                  value={formData.jatuhTempo || ''}
                  onChange={(e) => setFormData({ ...formData, jatuhTempo: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>DP (Opsional)</Label>
                <CurrencyInput
                  className="input-modern"
                  placeholder="0"
                  value={formData.dpAmount || 0}
                  onChange={(value) => setFormData({ ...formData, dpAmount: value })}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="card-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Item Barang</h3>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Item
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label>Nama Barang</Label>
                <Input
                  className="input-modern"
                  placeholder="Contoh: Meja Makan Jati"
                  value={item.namaBarang}
                  onChange={(e) => updateItem(index, 'namaBarang', e.target.value)}
                />
              </div>
              
              <div className="w-24 space-y-2">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  className="input-modern"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, 'jumlah', e.target.value)}
                />
              </div>
              
              <div className="w-40 space-y-2">
                <Label>Harga Satuan</Label>
                <CurrencyInput
                  className="input-modern"
                  placeholder="0"
                  value={item.hargaSatuan || 0}
                  onChange={(value) => updateItem(index, 'hargaSatuan', value)}
                />
              </div>
              
              <div className="w-36 space-y-2">
                <Label>Subtotal</Label>
                <div className="h-10 flex items-center px-3 bg-muted rounded-lg text-sm font-medium">
                  {formatRupiah(item.subtotal)}
                </div>
              </div>
              
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">{formatRupiah(totalHarga)}</span>
        </div>
      </div>
      
      <div className="card-elevated rounded-xl p-6">
        <div className="space-y-2">
          <Label>Catatan (Opsional)</Label>
          <Textarea
            className="input-modern"
            placeholder="Catatan tambahan untuk transaksi ini..."
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Batal
        </Button>
        <Button type="submit" className="btn-primary-gradient">
          Simpan Transaksi
        </Button>
      </div>
    </form>
  );
}
