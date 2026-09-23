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

// Datos de ejemplo — se reemplazarán con datos del simulador
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Flujo de Caja Acumulado</h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAccum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()}` : v} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label="Recuperación" />
          <Area type="monotone" dataKey="accumulated" name="Acumulado" stroke="#3b82f6" fill="url(#colorAccum)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
