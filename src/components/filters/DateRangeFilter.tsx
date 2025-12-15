import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onClear: () => void;
}

type PresetKey = 'custom' | 'today' | 'thisWeek' | 'thisMonth' | '7days' | '30days';

const presets: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Hari ini' },
  { key: 'thisWeek', label: 'Minggu ini' },
  { key: 'thisMonth', label: 'Bulan ini' },
  { key: '7days', label: '7 hari terakhir' },
  { key: '30days', label: '30 hari terakhir' },
  { key: 'custom', label: 'Custom' },
];

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const hasFilter = startDate || endDate;

  const getActivePreset = (): PresetKey => {
    if (!startDate && !endDate) return 'custom';
    
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    
    if (startDate && endDate) {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      // Check today
      if (startStr === format(todayStart, 'yyyy-MM-dd') && endStr === format(todayStart, 'yyyy-MM-dd')) {
        return 'today';
      }
      
      // Check this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      if (startStr === format(weekStart, 'yyyy-MM-dd') && endStr === format(weekEnd, 'yyyy-MM-dd')) {
        return 'thisWeek';
      }
      
      // Check this month
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      if (startStr === format(monthStart, 'yyyy-MM-dd') && endStr === format(monthEnd, 'yyyy-MM-dd')) {
        return 'thisMonth';
      }
      
      // Check 7 days
      const days7Start = subDays(new Date(), 6);
      if (startStr === format(days7Start, 'yyyy-MM-dd') && endStr === format(new Date(), 'yyyy-MM-dd')) {
        return '7days';
      }
      
      // Check 30 days
      const days30Start = subDays(new Date(), 29);
      if (startStr === format(days30Start, 'yyyy-MM-dd') && endStr === format(new Date(), 'yyyy-MM-dd')) {
        return '30days';
      }
    }
    
    return 'custom';
  };

  const handlePresetChange = (preset: PresetKey) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        onStartDateChange(today);
        onEndDateChange(today);
        break;
      case 'thisWeek':
        onStartDateChange(startOfWeek(today, { weekStartsOn: 1 }));
        onEndDateChange(endOfWeek(today, { weekStartsOn: 1 }));
        break;
      case 'thisMonth':
        onStartDateChange(startOfMonth(today));
        onEndDateChange(endOfMonth(today));
        break;
      case '7days':
        onStartDateChange(subDays(today, 6));
        onEndDateChange(today);
        break;
      case '30days':
        onStartDateChange(subDays(today, 29));
        onEndDateChange(today);
        break;
      case 'custom':
        // Don't change dates for custom
        break;
    }
  };

  const activePreset = getActivePreset();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={activePreset} onValueChange={(v) => handlePresetChange(v as PresetKey)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : 'Dari'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">—</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !endDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : 'Sampai'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <Button variant="ghost" size="icon" onClick={onClear} className="h-9 w-9">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
