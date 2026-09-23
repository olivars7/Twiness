'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { calcIncomeStatement } from '@/lib/financial'
import AnalysisCard from '@/components/ui/AnalysisCard'

const DEFAULT = { precioPromedio: 150, ventasEstimadasMes: 800, costoVariableUnitario: 60, gastosOperativosFijos: 35000 }

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function EstadoResultadosPage() {
  const [input, setInput] = useState(DEFAULT)
  const r = calcIncomeStatement(input)

  const set = (k: keyof typeof DEFAULT, v: string) =>
    setInput(prev => ({ ...prev, [k]: Number(v) || 0 }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">📊 Estado de Resultados</h1>
        <p className="text-gray-500 text-sm mt-1">Proyección mensual de ingresos, costos y utilidad</p>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Parámetros</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: 'precioPromedio',         label: 'Precio promedio ($)' },
            { key: 'ventasEstimadasMes',      label: 'Ventas/mes (unidades)' },
            { key: 'costoVariableUnitario',   label: 'Costo variable unit. ($)' },
            { key: 'gastosOperativosFijos',   label: 'Gastos fijos/mes ($)' },
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

      {/* 4 result blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos',         value: fmt(r.ingresos),          color: 'green' as const },
          { label: 'Costos variables', value: fmt(r.costosVariables),   color: 'yellow' as const },
          { label: 'Gastos fijos',     value: fmt(r.gastosOperativosFijos), color: 'yellow' as const },
          { label: 'Utilidad operativa', value: fmt(r.utilidadOperativa), color: r.utilidadOperativa >= 0 ? 'green' as const : 'red' as const },
        ].map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <AnalysisCard color={b.color} title={b.label} value={b.value} description="" />
          </motion.div>
        ))}
      </div>

      {/* Margin */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Margen operativo</span>
          <span className={`text-lg font-black ${r.margenOperativo >= 0.2 ? 'text-green-400' : r.margenOperativo >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {(r.margenOperativo * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, r.margenOperativo * 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${r.margenOperativo >= 0.2 ? 'bg-green-500' : r.margenOperativo >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </div>
      </motion.div>
    </div>
  )
}
