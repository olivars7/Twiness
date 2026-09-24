'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface BreakEvenData {
  units: number
  revenue: number
  totalCost: number
}

interface BreakEvenChartProps {
  data?: BreakEvenData[]
  breakEvenUnits?: number
}

const defaultData: BreakEvenData[] = Array.from({ length: 11 }, (_, i) => ({
  units: i * 100,
  revenue: i * 100 * 150,
  totalCost: 5000 + i * 100 * 80,
}))

export default function BreakEvenChart({ data = defaultData, breakEvenUnits = 625 }: BreakEvenChartProps) {
  return (
    <div className="card rounded-2xl p-5">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        Punto de Equilibrio
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="units"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            label={{ value: 'Unidades', position: 'insideBottom', offset: -5, fill: 'var(--color-text-muted)', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}
            labelStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
            formatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-secondary)' }} />
          <ReferenceLine x={breakEvenUnits} stroke="var(--chart-6)" strokeDasharray="4 4" label={{ value: 'Break-even', fill: 'var(--chart-6)', fontSize: 11 }} />
          {/* Ingresos — negro */}
          <Line type="monotone" dataKey="revenue"   name="Ingresos"     stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          {/* Costo Total — gris */}
          <Line type="monotone" dataKey="totalCost" name="Costo Total"  stroke="var(--chart-2)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
