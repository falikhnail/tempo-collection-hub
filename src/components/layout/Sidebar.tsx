import { 
  LayoutDashboard, 
  Store, 
  FileText, 
  Clock, 
  History,
  Settings,
  Package,
  BarChart3,
  Bell,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'toko', label: 'Data Toko', icon: Store },
  { id: 'transaksi', label: 'Transaksi Baru', icon: FileText },
  { id: 'piutang', label: 'Daftar Piutang', icon: Clock },
  { id: 'riwayat', label: 'Riwayat', icon: History },
  { id: 'pengingat', label: 'Pengingat', icon: Bell },
  { id: 'laporan', label: 'Laporan', icon: BarChart3 },
];

export function Sidebar({ activeMenu, onMenuChange, isOpen, onClose }: SidebarProps) {
  const handleMenuClick = (id: string) => {
    onMenuChange(id);
    onClose(); // Close sidebar on mobile after menu selection
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">FurniTrack</h1>
                <p className="text-xs text-muted-foreground">Sistem Piutang</p>
              </div>
            </div>
            {/* Close button - only on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    'sidebar-link w-full',
                    isActive && 'sidebar-link-active'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings at bottom */}
          <div className="border-t border-border p-4">
            <button
              onClick={() => handleMenuClick('settings')}
              className={cn(
                'sidebar-link w-full',
                activeMenu === 'settings' && 'sidebar-link-active'
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Pengaturan</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
