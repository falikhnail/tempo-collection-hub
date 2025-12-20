import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationPanel } from './NotificationPanel';
import { Transaksi } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  transaksi?: Transaksi[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMenuToggle?: () => void;
}

export function Header({ 
  title, 
  subtitle, 
  transaksi = [], 
  searchQuery = '', 
  onSearchChange,
  onMenuToggle 
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Count notifications (overdue + upcoming due in 3 days)
  const notificationCount = transaksi.filter(t => {
    if (t.status === 'lunas' || !t.jatuhTempo) return false;
    const dueDate = new Date(t.jatuhTempo);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Menu Toggle Button - Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi, toko..."
              className="w-48 lg:w-64 pl-9 input-modern"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
          
          {/* Search Toggle - Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            
            {showNotifications && (
              <NotificationPanel 
                transaksi={transaksi} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>
          
          {/* User */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi, toko..."
              className="w-full pl-9 input-modern"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
