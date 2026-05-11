"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface SalesData {
  name: string;
  total: number;
}

export function OverviewChart({ data }: { data: SalesData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground border border-dashed rounded-lg">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.2} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--popover))', 
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--popover-foreground))'
          }}
          itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          name="Ventas"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
