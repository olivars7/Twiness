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

// Datos de ejemplo — se reemplazarán con datos del backend
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Curva Oferta-Demanda Estimada</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="price" label={{ value: 'Precio ($)', position: 'insideBottom', offset: -5 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="demand" name="Demanda" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
