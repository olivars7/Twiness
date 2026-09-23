'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { calcBreakEven } from '@/lib/financial'
import BreakEvenChart from '@/components/charts/BreakEvenChart'
import AnalysisCard from '@/components/ui/AnalysisCard'

const DEFAULT = { costosFijos: 35000, precioUnitario: 150, costoVariableUnitario: 60, ventasActuales: 800 }
const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function BreakEvenPage() {
  const [input, setInput] = useState(DEFAULT)
  const r = calcBreakEven(input)

  const set = (k: keyof typeof DEFAULT, v: string) =>
    setInput(prev => ({ ...prev, [k]: Number(v) || 0 }))

  // Build chart data around the break-even point
  const max = Math.ceil(r.unidades * 1.8 / 100) * 100
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const units = (max / 10) * i
    return { units, revenue: units * input.precioUnitario, totalCost: input.costosFijos + units * input.costoVariableUnitario }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">⚖️ Punto de Equilibrio</h1>
        <p className="text-gray-500 text-sm mt-1">Unidades mínimas que necesitas vender cada mes</p>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Parámetros</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: 'costosFijos',           label: 'Costos fijos ($)' },
            { key: 'precioUnitario',         label: 'Precio unitario ($)' },
            { key: 'costoVariableUnitario',  label: 'Costo variable unit. ($)' },
            { key: 'ventasActuales',         label: 'Ventas actuales (u)' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input type="number" value={input[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Result cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="yellow" title="Unidades de equilibrio" value={isFinite(r.unidades) ? Math.ceil(r.unidades).toLocaleString() : '∞'} description="Ventas mínimas para cubrir todos los costos." />
        <AnalysisCard color="blue"   title="Ventas de equilibrio"   value={fmt(r.ventasBreakEven)} description="Ingresos mínimos para no perder dinero." />
        <AnalysisCard color={r.margenSeguridad >= 0.2 ? 'green' : r.margenSeguridad >= 0 ? 'yellow' : 'red'}
          title="Margen de seguridad" value={`${(r.margenSeguridad * 100).toFixed(1)}%`}
          description="Qué tanto puedes caer en ventas antes de perder." />
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <BreakEvenChart data={chartData} breakEvenUnits={r.unidades} />
      </motion.div>
    </div>
  )
}
