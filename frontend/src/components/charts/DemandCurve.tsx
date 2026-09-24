'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DemandPoint {
  price: number
  demand: number
  revenue: number
}

const defaultData: DemandPoint[] = [
  { price: 50,  demand: 500, revenue: 25000 },
  { price: 80,  demand: 400, revenue: 32000 },
  { price: 100, demand: 320, revenue: 32000 },
  { price: 120, demand: 250, revenue: 30000 },
  { price: 150, demand: 180, revenue: 27000 },
  { price: 200, demand: 100, revenue: 20000 },
]

export default function DemandCurve({ data = defaultData }: { data?: DemandPoint[] }) {
  return (
    <div className="card rounded-2xl p-5">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        Curva Oferta-Demanda Estimada
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="price"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            label={{ value: 'Precio ($)', position: 'insideBottom', offset: -5, fill: 'var(--color-text-muted)', fontSize: 11 }}
          />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}
            labelStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
          />
          {/* Demanda — negro */}
          <Line type="monotone" dataKey="demand"  name="Demanda"  stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          {/* Ingresos — azul */}
          <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="var(--chart-3)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
