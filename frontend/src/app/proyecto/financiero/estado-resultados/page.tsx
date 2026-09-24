'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Minus, ChevronRight, DollarSign } from 'lucide-react'
import { calcIncomeStatement, calcProjection } from '@/lib/financial'
import CashFlowChart from '@/components/charts/CashFlowChart'
import type { OnboardingData } from '@/store/onboardingStore'

// ─── localStorage persistence (same key as mis-datos) ────────────────────────
const STORAGE_KEY = 'viabl_business_data_v1'

function readER(): Partial<OnboardingData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw)
    return typeof p === 'object' && p !== null ? p : {}
  } catch { return {} }
}

function writeER(patch: Partial<OnboardingData>) {
  if (typeof window === 'undefined') return
  try {
    const existing = readER()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...patch }))
  } catch { /* silent */ }
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  er_precioPromedio:        '150',
  er_ventasEstimadasMes:    '800',
  er_costoVariableUnitario: '60',
  er_gastosOperativosFijos: '35000',
  er_gastosAdministrativos: '8000',
  er_otrosIngresos:         '0',
  er_impuestosPct:          '30',
  er_inversionInicial:      '80000',
  er_tasaCrecimiento:       '3',
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
/** Format a raw numeric string with thousands separators for display */
function fmtCommas(raw: string): string {
  const n = parseFloat(raw.replace(/,/g, ''))
  if (isNaN(n)) return raw
  return n.toLocaleString('es-MX', { maximumFractionDigits: 2 })
}

/** Strip commas → number */
function parseInput(v: string): number {
  return parseFloat(v.replace(/,/g, '')) || 0
}

function fmt(n: number) {
  const abs = Math.abs(n)
  const str = `$${abs.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
  return n < 0 ? `-${str}` : str
}

// ─── MoneyInput: $ icon + auto-comma ─────────────────────────────────────────
function MoneyInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [display, setDisplay] = useState(() => fmtCommas(value))

  useEffect(() => { setDisplay(fmtCommas(value)) }, [value])

  function handleChange(raw: string) {
    // Allow only digits and one decimal point
    const cleaned = raw.replace(/[^0-9.]/g, '')
    setDisplay(cleaned)
    onChange(cleaned)
  }

  function handleBlur() {
    const n = parseInput(display)
    const formatted = fmtCommas(String(n))
    setDisplay(formatted)
    onChange(String(n))
  }

  function handleFocus() {
    // Show raw number on focus for easy editing
    const n = parseInput(display)
    setDisplay(isNaN(n) ? '' : String(n))
  }

  return (
    <div className="flex items-center rounded-xl overflow-hidden"
      style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-input)' }}>
      <div className="flex items-center justify-center w-9 h-9 shrink-0"
        style={{ background: '#f0fdf4', borderRight: '1px solid var(--color-border)' }}>
        <DollarSign size={13} strokeWidth={2.2} style={{ color: '#16a34a' }} />
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={e => handleChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="flex-1 bg-transparent text-sm px-2.5 py-2 outline-none min-w-0"
        style={{ color: 'var(--color-text)' }}
      />
    </div>
  )
}

// ─── PctInput: permanent % suffix ────────────────────────────────────────────
function PctInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-xl overflow-hidden"
      style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-input)' }}>
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm px-2.5 py-2 outline-none min-w-0"
        style={{ color: 'var(--color-text)' }}
      />
      <div className="flex items-center justify-center w-8 shrink-0 text-sm font-bold"
        style={{ color: '#6b6b78', borderLeft: '1px solid var(--color-border)' }}>
        %
      </div>
    </div>
  )
}

// ─── Inline bar ───────────────────────────────────────────────────────────────
function InlineBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max, 1) * 100 : 0
  return (
    <div className="h-1.5 rounded-full overflow-hidden w-full" style={{ background: 'var(--color-border)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

// ─── P&L row ──────────────────────────────────────────────────────────────────
function PLRow({ label, value, max, color, isTotal = false, isSubtraction = false, delay = 0 }: {
  label: string; value: number; max: number; color: string
  isTotal?: boolean; isSubtraction?: boolean; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-center gap-4 py-2.5 ${isTotal ? 'mt-1' : ''}`}
      style={{
        borderBottom: '1px solid var(--color-border)',
        ...(isTotal ? { borderTop: '1px solid var(--color-border)', marginTop: 4 } : {}),
      }}
    >
      <div className="shrink-0 w-4 flex items-center justify-center">
        {isSubtraction
          ? <Minus size={11} style={{ color: '#ef4444' }} />
          : <ChevronRight size={11} style={{ color }} />}
      </div>
      <div className="w-48 shrink-0">
        <span
          className={isTotal ? 'font-bold text-sm' : 'text-xs'}
          style={{ color: isTotal ? 'var(--color-text)' : 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
      </div>
      <div className="flex-1 hidden sm:block">
        <InlineBar value={value} max={max} color={color} />
      </div>
      <div className="shrink-0 w-28 text-right">
        <span
          className={isTotal ? 'text-sm font-black' : 'text-sm font-medium'}
          style={{ color }}
        >
          {fmt(value)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EstadoResultadosPage() {
  type Fields = typeof DEFAULTS
  const [fields, setFields] = useState<Fields>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    const saved = readER()
    setFields({
      er_precioPromedio:        saved.er_precioPromedio        ?? DEFAULTS.er_precioPromedio,
      er_ventasEstimadasMes:    saved.er_ventasEstimadasMes    ?? DEFAULTS.er_ventasEstimadasMes,
      er_costoVariableUnitario: saved.er_costoVariableUnitario ?? DEFAULTS.er_costoVariableUnitario,
      er_gastosOperativosFijos: saved.er_gastosOperativosFijos ?? DEFAULTS.er_gastosOperativosFijos,
      er_gastosAdministrativos: saved.er_gastosAdministrativos ?? DEFAULTS.er_gastosAdministrativos,
      er_otrosIngresos:         saved.er_otrosIngresos         ?? DEFAULTS.er_otrosIngresos,
      er_impuestosPct:          saved.er_impuestosPct          ?? DEFAULTS.er_impuestosPct,
      er_inversionInicial:      saved.er_inversionInicial      ?? DEFAULTS.er_inversionInicial,
      er_tasaCrecimiento:       saved.er_tasaCrecimiento       ?? DEFAULTS.er_tasaCrecimiento,
    })
    setHydrated(true)
  }, [])

  const set = useCallback((k: keyof Fields, v: string) => {
    setFields(prev => {
      const next = { ...prev, [k]: v }
      writeER(next as Partial<OnboardingData>)
      return next
    })
  }, [])

  // ─── Derived calculations ──────────────────────────────────────────────────
  const precioPromedio        = parseInput(fields.er_precioPromedio)
  const ventasEstimadasMes    = parseInput(fields.er_ventasEstimadasMes)
  const costoVariableUnitario = parseInput(fields.er_costoVariableUnitario)
  const gastosOperativosFijos = parseInput(fields.er_gastosOperativosFijos)
  const gastosAdministrativos = parseInput(fields.er_gastosAdministrativos)
  const otrosIngresos         = parseInput(fields.er_otrosIngresos)
  const impuestosPct          = parseInput(fields.er_impuestosPct) / 100
  const inversionInicial      = parseInput(fields.er_inversionInicial)
  const tasaCrecimiento       = parseInput(fields.er_tasaCrecimiento) / 100

  const r = calcIncomeStatement({
    precioPromedio,
    ventasEstimadasMes,
    costoVariableUnitario,
    gastosOperativosFijos: gastosOperativosFijos + gastosAdministrativos,
  })

  const ingresosTotal     = r.ingresos + otrosIngresos
  const utilidadAntesImp  = r.utilidadOperativa + otrosIngresos
  const impuestos         = utilidadAntesImp > 0 ? utilidadAntesImp * impuestosPct : 0
  const utilidadNeta      = utilidadAntesImp - impuestos

  const margenBruto   = ingresosTotal > 0 ? r.utilidadBruta / ingresosTotal : 0
  const margenOp      = ingresosTotal > 0 ? r.utilidadOperativa / ingresosTotal : 0
  const margenNeto    = ingresosTotal > 0 ? utilidadNeta / ingresosTotal : 0

  const colorBruto = margenBruto >= 0.4 ? '#10b981' : margenBruto >= 0.2 ? '#f59e0b' : '#ef4444'
  const colorOp    = margenOp    >= 0.2 ? '#10b981' : margenOp    >= 0   ? '#f59e0b' : '#ef4444'
  const colorNeto  = margenNeto  >= 0.1 ? '#10b981' : margenNeto  >= 0   ? '#f59e0b' : '#ef4444'

  // 6-month projection
  const projection = calcProjection({
    ventasBase: ingresosTotal,
    tasaCrecimiento,
    costoVariable: ingresosTotal > 0 ? r.costosVariables / ingresosTotal : 0,
    costosFijos: gastosOperativosFijos + gastosAdministrativos,
    inflacionEstimada: 0,
    horizonteMeses: 6,
    inversionInicial,
  })

  const cashFlowData = projection.map(p => ({
    month: `Mes ${p.mes}`,
    cashFlow: Math.round(p.flujoCaja),
    accumulated: Math.round(p.acumulado),
  }))

  const recoveryMonth = projection.find(p => p.acumulado >= 0)?.mes ?? null

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[40vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          className="w-7 h-7 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#000000', borderRightColor: '#00000030' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
          <BarChart3 size={24} strokeWidth={2.2} />
          Estado de Resultados
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Estructura de ingresos, costos y márgenes — guardado automáticamente
        </p>
      </motion.div>

      {/* ── Inputs — two-column grid ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="card rounded-2xl p-5 space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Parámetros del negocio
        </p>

        {/* Ingresos */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>Ingresos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: 'er_precioPromedio',     label: 'Precio promedio por unidad' },
              { key: 'er_ventasEstimadasMes', label: 'Unidades vendidas / mes' },
              { key: 'er_otrosIngresos',      label: 'Otros ingresos mensuales' },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
                <MoneyInput value={fields[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Costos */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#ef4444' }}>Costos y Gastos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: 'er_costoVariableUnitario', label: 'Costo variable por unidad' },
              { key: 'er_gastosOperativosFijos',  label: 'Gastos operativos fijos / mes' },
              { key: 'er_gastosAdministrativos',  label: 'Gastos administrativos / mes' },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
                <MoneyInput value={fields[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Otros */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#f59e0b' }}>Proyección e Inversión</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Inversión inicial</label>
              <MoneyInput value={fields.er_inversionInicial} onChange={v => set('er_inversionInicial', v)} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Tasa de impuestos</label>
              <PctInput value={fields.er_impuestosPct} onChange={v => set('er_impuestosPct', v)} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Crecimiento mensual</label>
              <PctInput value={fields.er_tasaCrecimiento} onChange={v => set('er_tasaCrecimiento', v)} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── P&L Waterfall ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="card rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Estado de Resultados — Mensual
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {ventasEstimadasMes.toLocaleString()} uds × {fmt(precioPromedio)}/u
          {otrosIngresos > 0 ? ` + ${fmt(otrosIngresos)} otros ingresos` : ''}
        </p>

        <PLRow label="Ingresos por ventas"     value={r.ingresos}               max={ingresosTotal} color="#3b82f6"  delay={0.18} />
        {otrosIngresos > 0 && (
          <PLRow label="Otros ingresos"         value={otrosIngresos}            max={ingresosTotal} color="#60a5fa"  delay={0.20} />
        )}
        <PLRow label="(−) Costos variables"    value={r.costosVariables}        max={ingresosTotal} color="#ef4444" delay={0.22} isSubtraction />
        <PLRow label="Utilidad bruta"           value={r.utilidadBruta}          max={ingresosTotal} color={colorBruto} delay={0.26} isTotal />
        <PLRow label="(−) Gastos operativos"   value={gastosOperativosFijos}    max={ingresosTotal} color="#ef4444" delay={0.30} isSubtraction />
        <PLRow label="(−) Gastos administrativos" value={gastosAdministrativos} max={ingresosTotal} color="#f97316" delay={0.32} isSubtraction />
        <PLRow label="Utilidad operativa"       value={r.utilidadOperativa}      max={ingresosTotal} color={colorOp}    delay={0.36} isTotal />
        {impuestos > 0 && (
          <PLRow label="(−) Impuestos estimados" value={impuestos}              max={ingresosTotal} color="#ef4444" delay={0.38} isSubtraction />
        )}
        <PLRow label="Utilidad neta"            value={utilidadNeta}             max={ingresosTotal} color={colorNeto}  delay={0.40} isTotal />
      </motion.div>

      {/* ── Dark summary box ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
        <div className="dark-box rounded-2xl p-5">
          <p className="text-xs dark-box-muted uppercase tracking-widest mb-4">Resumen financiero</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div>
              <p className="text-xs dark-box-muted mb-1">Ingresos totales</p>
              <p className="text-xl font-black dark-box-accent">{fmt(ingresosTotal)}</p>
              <p className="text-xs dark-box-muted mt-1">Por mes</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">Utilidad bruta</p>
              <p className="text-xl font-black" style={{ color: margenBruto >= 0 ? '#4ade80' : '#f87171' }}>
                {fmt(r.utilidadBruta)}
              </p>
              <p className="text-xs dark-box-muted mt-1">Margen {(margenBruto * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">Utilidad neta</p>
              <p className="text-xl font-black" style={{ color: utilidadNeta >= 0 ? '#4ade80' : '#f87171' }}>
                {fmt(utilidadNeta)}
              </p>
              <p className="text-xs dark-box-muted mt-1">Margen {(margenNeto * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs dark-box-muted mb-1">Recuperación inv.</p>
              <p className="text-xl font-black" style={{ color: recoveryMonth ? '#4ade80' : '#f87171' }}>
                {recoveryMonth ? `Mes ${recoveryMonth}` : 'N/A'}
              </p>
              <p className="text-xs dark-box-muted mt-1">{fmt(inversionInicial)} inicial</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Margin analysis ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
        className="card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Análisis de márgenes
        </p>
        {[
          { label: 'Margen bruto',      value: margenBruto, color: colorBruto },
          { label: 'Margen operativo',  value: margenOp,    color: colorOp },
          { label: 'Margen neto',       value: margenNeto,  color: colorNeto },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <span className="text-sm font-black" style={{ color }}>{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, value * 100)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Section divider ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.50 }}
        className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} style={{ color: '#10b981' }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Proyección 6 meses
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      </motion.div>

      {/* ── Cash flow projection chart ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}>
        <CashFlowChart data={cashFlowData} />
      </motion.div>

    </div>
  )
}
