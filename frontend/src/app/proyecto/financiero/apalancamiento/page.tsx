'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { calcIncomeStatement, calcOperatingLeverage } from '@/lib/financial'
import AnalysisCard from '@/components/ui/AnalysisCard'

const SCENARIOS = [
  { label: 'Estructura A — Costos fijos altos', costosFijos: 60000, costoVariable: 30 },
  { label: 'Estructura B — Costos variables altos', costosFijos: 20000, costoVariable: 80 },
]

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ApalancamientoPage() {
  const [ventas, setVentas] = useState(150000)
  const [precio, setPrecio] = useState(150)

  const results = SCENARIOS.map(s => {
    const unidades = precio > 0 ? ventas / precio : 0
    const r = calcIncomeStatement({ precioPromedio: precio, ventasEstimadasMes: unidades, costoVariableUnitario: s.costoVariable, gastosOperativosFijos: s.costosFijos })
    const mc = r.ingresos - r.costosVariables
    const gao = calcOperatingLeverage(mc, r.utilidadOperativa)
    return { ...s, ...r, gao }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🔧 Apalancamiento Operativo</h1>
        <p className="text-gray-500 text-sm mt-1">Compara dos estructuras de costos para tu negocio</p>
      </motion.div>

      {/* Shared inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Parámetros compartidos</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ingresos mensuales ($)</label>
            <input type="number" value={ventas} onChange={e => setVentas(Number(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Precio promedio ($)</label>
            <input type="number" value={precio} onChange={e => setPrecio(Number(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </motion.div>

      {/* Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((res, i) => (
          <motion.div key={res.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-white">{res.label}</p>
            {[
              { l: 'Costos fijos',      v: fmt(res.gastosOperativosFijos) },
              { l: 'Costos variables',  v: fmt(res.costosVariables) },
              { l: 'Utilidad operativa', v: fmt(res.utilidadOperativa) },
              { l: 'GAO',               v: isFinite(res.gao) ? res.gao.toFixed(2) + 'x' : '—' },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-gray-500">{l}</span>
                <span className={`font-medium ${l === 'Utilidad operativa' && res.utilidadOperativa < 0 ? 'text-red-400' : 'text-gray-200'}`}>{v}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Explanation */}
      <AnalysisCard color="blue" title="¿Qué es el GAO?" value="Grado de Apalancamiento Operativo"
        description="Un GAO alto significa que un aumento en ventas genera mayor crecimiento proporcional en utilidad — pero también mayor riesgo si las ventas bajan." />
    </div>
  )
}
