import { Phone, MapPin, Mail, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toko } from '@/types';
import { formatTanggal } from '@/data/mockData';

interface TokoCardProps {
  toko: Toko;
  onEdit: (toko: Toko) => void;
  onDelete: (toko: Toko) => void;
  onWhatsApp: (toko: Toko) => void;
}

export function TokoCard({ toko, onEdit, onDelete, onWhatsApp }: TokoCardProps) {
  return (
    <div className="card-elevated rounded-xl p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {toko.nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{toko.nama}</h3>
            <p className="text-xs text-muted-foreground">
              Terdaftar: {formatTanggal(toko.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(toko)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(toko)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{toko.alamat}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 shrink-0" />
          <span>{toko.telepon}</span>
        </div>
        
        {toko.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span>{toko.email}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success"
          onClick={() => onWhatsApp(toko)}
        >
          <MessageCircle className="h-4 w-4" />
          Hubungi via WhatsApp
        </Button>
      </div>
    </div>
  );
}
