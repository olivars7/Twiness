'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface CashFlowPoint {
  month: string
  cashFlow: number
  accumulated: number
}

const defaultData: CashFlowPoint[] = [
  { month: 'Mes 1', cashFlow: -8000, accumulated: -8000 },
  { month: 'Mes 2', cashFlow: -3000, accumulated: -11000 },
  { month: 'Mes 3', cashFlow:  2000, accumulated: -9000 },
  { month: 'Mes 4', cashFlow:  5000, accumulated: -4000 },
  { month: 'Mes 5', cashFlow:  6000, accumulated:  2000 },
  { month: 'Mes 6', cashFlow:  8000, accumulated: 10000 },
]

export default function CashFlowChart({ data = defaultData }: { data?: CashFlowPoint[] }) {
  return (
    <div className="card rounded-2xl p-5">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        Flujo de Caja Acumulado
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAccum" x1="0" y1="0" x2="0" y2="1">
              {/* negro → transparente */}
              <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
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
          <ReferenceLine y={0} stroke="var(--chart-6)" strokeDasharray="4 4" label={{ value: 'Recuperación', fill: 'var(--chart-6)', fontSize: 11 }} />
          {/* Acumulado — negro con relleno suave */}
          <Area type="monotone" dataKey="accumulated" name="Acumulado" stroke="var(--chart-1)" fill="url(#colorAccum)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
