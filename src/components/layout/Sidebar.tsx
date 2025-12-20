import { 
  LayoutDashboard, 
  Store, 
  FileText, 
  Clock, 
  History,
  Settings,
  Package,
  BarChart3,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
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

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FurniTrack</h1>
            <p className="text-xs text-muted-foreground">Sistem Piutang</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange(item.id)}
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
            onClick={() => onMenuChange('settings')}
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
  );
}
