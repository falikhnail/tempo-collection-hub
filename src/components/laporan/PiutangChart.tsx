import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { formatRupiah } from '@/data/mockData';

interface ChartData {
  bulan: string;
  piutang: number;
  terbayar: number;
  transaksi: number;
}

interface PiutangChartProps {
  data: ChartData[];
}

export function PiutangChart({ data }: PiutangChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {entry.name === 'Transaksi' ? entry.value : formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="bulan" 
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="piutang" 
            name="Piutang Baru" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="left"
            dataKey="terbayar" 
            name="Terbayar" 
            fill="hsl(var(--success))" 
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="transaksi" 
            name="Transaksi"
            stroke="hsl(var(--warning))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--warning))' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
