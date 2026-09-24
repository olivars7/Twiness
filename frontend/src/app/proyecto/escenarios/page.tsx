'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { calcProjection } from '@/lib/financial'
import CashFlowChart from '@/components/charts/CashFlowChart'
import AnalysisCard from '@/components/ui/AnalysisCard'

const DEFAULT = { ventasBase: 80000, tasaCrecimiento: 0.05, costoVariable: 0.45, costosFijos: 35000, inflacionEstimada: 300, horizonteMeses: 12, inversionInicial: 80000 }
const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

const inputCls = 'w-full field-input'

export default function EscenariosPage() {
  const [input, setInput] = useState(DEFAULT)

  const projection = calcProjection(input)
  const recoveryMonth = projection.findIndex(p => p.acumulado >= 0)
  const lastMonth = projection[projection.length - 1]

  const chartData = projection.map(p => ({
    month: `Mes ${p.mes}`,
    cashFlow: Math.round(p.flujoCaja),
    accumulated: Math.round(p.acumulado),
  }))

  const set = (k: keyof typeof DEFAULT, v: string) =>
    setInput(prev => ({ ...prev, [k]: Number(v) || 0 }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
          <Sparkles size={24} strokeWidth={2.2} />
          Simulador de Escenarios
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>¿Qué pasa si...? — Proyección financiera dinámica</p>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Parámetros del escenario</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {([
            { key: 'ventasBase',         label: 'Ventas base/mes ($)' },
            { key: 'inversionInicial',   label: 'Inversión inicial ($)' },
            { key: 'costosFijos',        label: 'Costos fijos/mes ($)' },
            { key: 'tasaCrecimiento',    label: 'Crecimiento mensual (%)' },
            { key: 'costoVariable',      label: 'Costo variable (% ingreso)' },
            { key: 'inflacionEstimada',  label: 'Inflación fija/mes ($)' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
              <input type="number" step="0.01" value={input[key]} onChange={e => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Result cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard
          color={recoveryMonth >= 0 ? 'green' : 'red'}
          title="Mes de recuperación"
          value={recoveryMonth >= 0 ? `Mes ${recoveryMonth + 1}` : 'No se recupera'}
          description="Mes en que el flujo acumulado supera $0." />
        <AnalysisCard
          color={lastMonth.acumulado >= 0 ? 'green' : 'red'}
          title={`Acumulado mes ${input.horizonteMeses}`}
          value={fmt(lastMonth.acumulado)}
          description="Flujo de caja acumulado al final del horizonte." />
        <AnalysisCard
          color="blue"
          title="Horizonte"
          value={`${input.horizonteMeses} meses`}
          description="Modifica el parámetro 'horizonteMeses' para cambiar el período." />
      </div>

      {/* Dark results box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <div className="dark-box rounded-2xl p-5 flex flex-wrap gap-x-10 gap-y-3 items-center">
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Mes de recuperación</p>
            <p className="text-2xl font-black dark-box-accent">
              {recoveryMonth >= 0 ? `Mes ${recoveryMonth + 1}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Flujo acumulado final</p>
            <p className="text-2xl font-black" style={{ color: lastMonth.acumulado >= 0 ? '#4ade80' : '#f87171' }}>
              {fmt(lastMonth.acumulado)}
            </p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Horizonte</p>
            <p className="text-2xl font-black">{input.horizonteMeses} <span className="text-sm font-normal dark-box-muted">meses</span></p>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <CashFlowChart data={chartData} />
      </motion.div>
    </div>
  )
}
