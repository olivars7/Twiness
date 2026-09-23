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

// Datos de ejemplo para visualizar estructura
const defaultData: BreakEvenData[] = Array.from({ length: 11 }, (_, i) => ({
  units: i * 100,
  revenue: i * 100 * 150,
  totalCost: 5000 + i * 100 * 80,
}))

export default function BreakEvenChart({ data = defaultData, breakEvenUnits = 625 }: BreakEvenChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Punto de Equilibrio</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="units" label={{ value: 'Unidades', position: 'insideBottom', offset: -5 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()}` : v} />
          <Legend />
          <ReferenceLine x={breakEvenUnits} stroke="#ef4444" strokeDasharray="4 4" label="Break-even" />
          <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="totalCost" name="Costo Total" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
