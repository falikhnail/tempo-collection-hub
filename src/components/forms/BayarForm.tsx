import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaksi } from '@/types';
import { formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface BayarFormProps {
  transaksi: Transaksi;
  onSubmit: (data: { jumlah: number; metode: string; catatan: string }) => void;
  onCancel: () => void;
}

export function BayarForm({ transaksi, onSubmit, onCancel }: BayarFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    jumlah: '',
    metode: 'transfer',
    catatan: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jumlah = Number(formData.jumlah);
    
    if (!jumlah || jumlah <= 0) {
      toast({
        title: 'Error',
        description: 'Masukkan jumlah pembayaran yang valid',
        variant: 'destructive',
      });
      return;
    }
    
    if (jumlah > transaksi.sisaPiutang) {
      toast({
        title: 'Error',
        description: 'Jumlah pembayaran melebihi sisa piutang',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit({
      jumlah,
      metode: formData.metode,
      catatan: formData.catatan,
    });
  };

  const bayarLunas = () => {
    setFormData({ ...formData, jumlah: String(transaksi.sisaPiutang) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ID Transaksi</span>
          <span className="font-medium">{transaksi.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Toko</span>
          <span className="font-medium">{transaksi.toko.nama}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span className="font-medium">{formatRupiah(transaksi.totalHarga)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-border pt-2">
          <span className="text-muted-foreground">Sisa Piutang</span>
          <span className="font-bold text-destructive">{formatRupiah(transaksi.sisaPiutang)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Jumlah Pembayaran *</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={bayarLunas}
            className="text-xs h-7"
          >
            Bayar Lunas
          </Button>
        </div>
        <Input
          type="number"
          className="input-modern"
          placeholder="0"
          value={formData.jumlah}
          onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Metode Pembayaran</Label>
        <Select
          value={formData.metode}
          onValueChange={(value) => setFormData({ ...formData, metode: value })}
        >
          <SelectTrigger className="input-modern">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transfer">Transfer Bank</SelectItem>
            <SelectItem value="cash">Tunai</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Catatan (Opsional)</Label>
        <Textarea
          className="input-modern"
          placeholder="Catatan pembayaran..."
          value={formData.catatan}
          onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
        />
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="btn-primary-gradient">
          Konfirmasi Pembayaran
        </Button>
      </div>
    </form>
  );
}
