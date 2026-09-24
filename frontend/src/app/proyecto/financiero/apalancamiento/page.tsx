'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { calcIncomeStatement, calcBreakEven, calcOperatingLeverage } from '@/lib/financial'
import AnalysisCard from '@/components/ui/AnalysisCard'

const DEFAULT = {
  costosFijos: 35000,
  costoVariableUnitario: 60,
  precioUnitario: 150,
  unidades: 450,
}

const fmt = (n: number) => {
  const abs = Math.abs(n)
  const str = `$${abs.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
  return n < 0 ? `-${str}` : str
}

const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`

function GaoRiskBar({ gao }: { gao: number }) {
  const MAX_GAO = 6
  const pct = Math.min((gao / MAX_GAO) * 100, 100)
  const color =
    gao < 1.5 ? '#4ade80' : gao < 3 ? '#facc15' : '#f87171'
  const label =
    gao < 1.5 ? 'Bajo' : gao < 3 ? 'Medio' : 'Alto'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold text-white">Nivel de riesgo operativo — GAO</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm font-bold text-gray-100 w-16 text-right">
          {isFinite(gao) ? `${gao.toFixed(2)}x` : '—'}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Bajo (&lt;1.5)</span>
        <span>Medio (1.5–3)</span>
        <span>Alto (&gt;3)</span>
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        Riesgo {label}
      </p>
    </div>
  )
}

function SensitivityPanel({
  utilidadBase,
  gao,
}: {
  utilidadBase: number
  gao: number
}) {
  const deltas = [-0.2, -0.1, 0.1, 0.2]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold text-white">Simulación ±20% en ventas</p>
      <div className="space-y-2">
        {deltas.map(d => {
          const impactoPct = d * gao
          const impactoAbs = utilidadBase * impactoPct
          const positivo = d > 0
          return (
            <div
              key={d}
              className="flex justify-between items-center text-sm py-1 border-b border-gray-800 last:border-0"
            >
              <span className="text-gray-400">
                {d > 0 ? '+' : ''}{(d * 100).toFixed(0)}% ventas
              </span>
              <div className="text-right">
                <span className={`font-medium ${positivo ? 'text-green-400' : 'text-red-400'}`}>
                  {fmt(impactoAbs)} &nbsp;
                </span>
                <span className={`text-xs ${positivo ? 'text-green-500' : 'text-red-500'}`}>
                  ({fmtPct(impactoPct)})
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500">
        Con GAO {isFinite(gao) ? gao.toFixed(2) : '—'}x, cada 1% de cambio en ventas impacta{' '}
        <span className="text-gray-300 font-medium">
          {isFinite(gao) ? gao.toFixed(2) : '—'}%
        </span>{' '}
        en tu utilidad operativa.
      </p>
    </div>
  )
}

export default function ApalancamientoPage() {
  const [input, setInput] = useState(DEFAULT)

  const set = (k: keyof typeof DEFAULT, v: string) =>
    setInput(prev => ({ ...prev, [k]: Number(v) || 0 }))

  const r = calcIncomeStatement({
    precioPromedio: input.precioUnitario,
    ventasEstimadasMes: input.unidades,
    costoVariableUnitario: input.costoVariableUnitario,
    gastosOperativosFijos: input.costosFijos,
  })

  const mc = r.ingresos - r.costosVariables
  const gao = calcOperatingLeverage(mc, r.utilidadOperativa)

  const be = calcBreakEven({
    costosFijos: input.costosFijos,
    precioUnitario: input.precioUnitario,
    costoVariableUnitario: input.costoVariableUnitario,
  })

  const veredictoColor = gao < 1.5 ? 'green' : gao < 3 ? 'yellow' : 'red'
  const veredictoMsg =
    gao < 1.5
      ? 'Tu estructura tiene bajo riesgo operativo. Un crecimiento modesto en ventas ya mejora tu utilidad de forma estable.'
      : gao < 3
      ? 'Riesgo moderado. Tienes palanca para crecer, pero una caída en ventas impacta notablemente tu utilidad.'
      : 'Riesgo alto. Tu negocio es muy sensible a caídas en ventas. Considera reducir costos fijos para mayor resiliencia.'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🔧 Apalancamiento Operativo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Simula tu estructura de costos y su nivel de riesgo operativo
        </p>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Mi estructura de costos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { key: 'costosFijos',           label: 'Costos fijos mensuales ($)' },
            { key: 'costoVariableUnitario', label: 'Costo variable unitario ($)' },
            { key: 'precioUnitario',        label: 'Precio de venta unitario ($)' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input
                type="number"
                value={input[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Slider unidades */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-white">Volumen de ventas</p>
          <span className="text-sm text-gray-400">
            {input.unidades.toLocaleString()} unidades &nbsp;·&nbsp;
            <span className="text-gray-200 font-medium">{fmt(r.ingresos)}</span> ingresos
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={10}
          value={input.unidades}
          onChange={e => set('unidades', e.target.value)}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>0 u</span><span>1,000 u</span><span>2,000 u</span>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AnalysisCard color="blue"   title="Margen contribución" value={fmt(mc)}                        description="Ingresos menos costos variables." />
        <AnalysisCard color={r.utilidadOperativa >= 0 ? 'green' : 'red'} title="Utilidad operativa" value={fmt(r.utilidadOperativa)} description="Tras descontar costos fijos." />
        <AnalysisCard color={veredictoColor} title="GAO" value={isFinite(gao) ? `${gao.toFixed(2)}x` : '—'} description="Grado de apalancamiento operativo." />
        <AnalysisCard color="yellow" title="Punto de equilibrio" value={isFinite(be.unidades) ? `${Math.ceil(be.unidades).toLocaleString()} u` : '∞'} description="Unidades mínimas para no perder." />
      </motion.div>

      {/* GAO risk bar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        {isFinite(gao) && <GaoRiskBar gao={gao} />}
      </motion.div>

      {/* Sensitivity panel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {isFinite(gao) && r.utilidadOperativa !== 0 && (
          <SensitivityPanel utilidadBase={r.utilidadOperativa} gao={gao} />
        )}
      </motion.div>

      {/* Veredicto */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <AnalysisCard color={veredictoColor} title="Diagnóstico" value={`GAO ${isFinite(gao) ? gao.toFixed(2) : '—'}x`} description={veredictoMsg} />
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <AnalysisCard color="blue" title="¿Qué es el GAO?" value="Grado de Apalancamiento Operativo"
          description="Un GAO alto significa que un aumento en ventas genera mayor crecimiento proporcional en utilidad — pero también mayor riesgo si las ventas bajan." />
      </motion.div>
    </div>
  )
}
