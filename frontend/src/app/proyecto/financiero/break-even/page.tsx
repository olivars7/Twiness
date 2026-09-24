'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale } from 'lucide-react'
import { calcBreakEven, calcIncomeStatement, calcOperatingLeverage } from '@/lib/financial'
import BreakEvenChart from '@/components/charts/BreakEvenChart'
import AnalysisCard from '@/components/ui/AnalysisCard'

const DEFAULT = {
  costosFijos: 35000,
  precioUnitario: 150,
  costoVariableUnitario: 60,
  ventasActuales: 800,
}

const fmt = (n: number) => {
  const abs = Math.abs(n)
  const str = `$${abs.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
  return n < 0 ? `-${str}` : str
}
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`

const inputCls = 'w-full field-input'

function GaoRiskBar({ gao }: { gao: number }) {
  const MAX_GAO = 6
  const pct = Math.min((gao / MAX_GAO) * 100, 100)
  const color = gao < 1.5 ? '#10b981' : gao < 3 ? '#f59e0b' : '#ef4444'
  const label = gao < 1.5 ? 'Bajo' : gao < 3 ? 'Medio' : 'Alto'

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Nivel de riesgo operativo — GAO
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm font-bold w-16 text-right" style={{ color: 'var(--color-text)' }}>
          {isFinite(gao) ? `${gao.toFixed(2)}x` : '—'}
        </span>
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>Bajo (&lt;1.5)</span>
        <span>Medio (1.5–3)</span>
        <span>Alto (&gt;3)</span>
      </div>
      <p className="text-xs font-medium" style={{ color }}>Riesgo {label}</p>
    </div>
  )
}

function SensitivityPanel({ utilidadBase, gao }: { utilidadBase: number; gao: number }) {
  const deltas = [-0.2, -0.1, 0.1, 0.2]

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Simulación ±20% en ventas</p>
      <div className="space-y-2">
        {deltas.map(d => {
          const impactoPct = d * gao
          const impactoAbs = utilidadBase * impactoPct
          const positivo = d > 0
          return (
            <div
              key={d}
              className="flex justify-between items-center text-sm py-1"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {d > 0 ? '+' : ''}{(d * 100).toFixed(0)}% ventas
              </span>
              <div className="text-right">
                <span className={`font-medium ${positivo ? 'text-emerald-600' : 'text-red-500'}`}>
                  {fmt(impactoAbs)} &nbsp;
                </span>
                <span className={`text-xs ${positivo ? 'text-emerald-500' : 'text-red-400'}`}>
                  ({fmtPct(impactoPct)})
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Con GAO {isFinite(gao) ? gao.toFixed(2) : '—'}x, cada 1% de cambio en ventas impacta{' '}
        <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {isFinite(gao) ? gao.toFixed(2) : '—'}%
        </span>{' '}
        en tu utilidad operativa.
      </p>
    </div>
  )
}

export default function BreakEvenPage() {
  const [input, setInput] = useState(DEFAULT)

  const set = (k: keyof typeof DEFAULT, v: string) =>
    setInput(prev => ({ ...prev, [k]: Number(v) || 0 }))

  const r = calcBreakEven(input)
  const income = calcIncomeStatement({
    precioPromedio: input.precioUnitario,
    ventasEstimadasMes: input.ventasActuales,
    costoVariableUnitario: input.costoVariableUnitario,
    gastosOperativosFijos: input.costosFijos,
  })
  const mc = income.ingresos - income.costosVariables
  const gao = calcOperatingLeverage(mc, income.utilidadOperativa)
  const veredictoColor = gao < 1.5 ? 'green' : gao < 3 ? 'yellow' : 'red'
  const veredictoMsg =
    gao < 1.5
      ? 'Bajo riesgo operativo. Un crecimiento modesto en ventas mejora tu utilidad de forma estable.'
      : gao < 3
      ? 'Riesgo moderado. Tienes palanca para crecer, pero una caída en ventas impacta notablemente tu utilidad.'
      : 'Riesgo alto. Tu negocio es muy sensible a caídas en ventas. Considera reducir costos fijos para mayor resiliencia.'

  const max = Math.ceil(r.unidades * 1.8 / 100) * 100
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const units = (max / 10) * i
    return {
      units,
      revenue: units * input.precioUnitario,
      totalCost: input.costosFijos + units * input.costoVariableUnitario,
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
          <Scale size={24} strokeWidth={2.2} />
          Punto de Equilibrio & Riesgo Operativo
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Break-even, margen de seguridad y grado de apalancamiento operativo (GAO)
        </p>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Parámetros</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: 'costosFijos',           label: 'Costos fijos ($)' },
            { key: 'precioUnitario',         label: 'Precio unitario ($)' },
            { key: 'costoVariableUnitario',  label: 'Costo variable unit. ($)' },
            { key: 'ventasActuales',         label: 'Ventas actuales (u)' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
              <input type="number" value={input[key]} onChange={e => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs — dark box unificado */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="dark-box rounded-2xl p-5">
          <p className="text-xs dark-box-muted uppercase tracking-widest mb-4">Resumen del punto de equilibrio</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs dark-box-muted mb-1">Unidades de equilibrio</p>
              <p className="text-2xl font-black">{isFinite(r.unidades) ? Math.ceil(r.unidades).toLocaleString() : '∞'}</p>
              <p className="text-xs dark-box-muted mt-1">Ventas mínimas para no perder</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">Ventas de equilibrio</p>
              <p className="text-2xl font-black dark-box-accent">{fmt(r.ventasBreakEven)}</p>
              <p className="text-xs dark-box-muted mt-1">Ingresos mínimos necesarios</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">Margen de seguridad</p>
              <p className="text-2xl font-black" style={{ color: r.margenSeguridad >= 0.2 ? '#4ade80' : r.margenSeguridad >= 0 ? '#fbbf24' : '#f87171' }}>
                {(r.margenSeguridad * 100).toFixed(1)}%
              </p>
              <p className="text-xs dark-box-muted mt-1">Caída máxima tolerable en ventas</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">GAO</p>
              <p className="text-2xl font-black" style={{ color: gao < 1.5 ? '#4ade80' : gao < 3 ? '#fbbf24' : '#f87171' }}>
                {isFinite(gao) ? `${gao.toFixed(2)}x` : '—'}
              </p>
              <p className="text-xs dark-box-muted mt-1">Grado de apalancamiento operativo</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <BreakEvenChart data={chartData} breakEvenUnits={r.unidades} />
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Apalancamiento Operativo</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      </div>

      {/* GAO KPIs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AnalysisCard color="blue"  title="Margen de contribución" value={fmt(mc)} description="Ingresos menos costos variables." />
        <AnalysisCard color={income.utilidadOperativa >= 0 ? 'green' : 'red'} title="Utilidad operativa" value={fmt(income.utilidadOperativa)} description="Tras descontar costos fijos." />
        <AnalysisCard color={veredictoColor} title="GAO" value={isFinite(gao) ? `${gao.toFixed(2)}x` : '—'} description="Grado de apalancamiento operativo." />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        {isFinite(gao) && <GaoRiskBar gao={gao} />}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {isFinite(gao) && income.utilidadOperativa !== 0 && (
          <SensitivityPanel utilidadBase={income.utilidadOperativa} gao={gao} />
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <AnalysisCard color={veredictoColor} title="Diagnóstico" value={`GAO ${isFinite(gao) ? gao.toFixed(2) : '—'}x`} description={veredictoMsg} />
      </motion.div>
    </div>
  )
}
