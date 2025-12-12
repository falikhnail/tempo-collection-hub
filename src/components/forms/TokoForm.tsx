import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toko } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TokoFormProps {
  toko?: Toko;
  onSubmit: (data: Omit<Toko, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function TokoForm({ toko, onSubmit, onCancel }: TokoFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: toko?.nama || '',
    alamat: toko?.alamat || '',
    telepon: toko?.telepon || '',
    whatsapp: toko?.whatsapp || '',
    email: toko?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.alamat || !formData.telepon || !formData.whatsapp) {
      toast({
        title: 'Error',
        description: 'Nama, alamat, telepon, dan WhatsApp wajib diisi',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(formData);
    toast({
      title: 'Sukses',
      description: toko ? 'Data toko berhasil diperbarui' : 'Toko baru berhasil ditambahkan',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Toko *</Label>
        <Input
          className="input-modern"
          placeholder="Contoh: Toko Mebel Jaya"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Alamat *</Label>
        <Input
          className="input-modern"
          placeholder="Alamat lengkap toko"
          value={formData.alamat}
          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Telepon *</Label>
          <Input
            className="input-modern"
            placeholder="021-12345678"
            value={formData.telepon}
            onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>WhatsApp *</Label>
          <Input
            className="input-modern"
            placeholder="6281234567890"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Email (Opsional)</Label>
        <Input
          type="email"
          className="input-modern"
          placeholder="email@toko.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="btn-primary-gradient">
          {toko ? 'Simpan Perubahan' : 'Tambah Toko'}
        </Button>
      </div>
    </form>
  );
}
