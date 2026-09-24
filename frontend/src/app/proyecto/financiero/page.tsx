'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, CheckCircle, XCircle, AlertCircle, Lightbulb, ArrowUpRight, Scissors, Users, Target, TrendingDown, TriangleAlert } from 'lucide-react'
import { calcBreakEven, calcIncomeStatement, calcProjection, calcDemandFactor, getPriceWarning, type PriceWarning } from '@/lib/financial'
import BreakEvenChart from '@/components/charts/BreakEvenChart'
import CashFlowChart from '@/components/charts/CashFlowChart'
import DataBadge from '@/components/ui/DataBadge'
import InfoTooltip from '@/components/ui/InfoTooltip'

// ─── localStorage ─────────────────────────────────────────────────────────────
const LS_KEY = 'viabl_business_data_v1'

function readLS(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function writeLS(patch: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    const prev = readLS()
    window.localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, ...patch }))
  } catch { /* silent */ }
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULTS = {
  sim_precio:      '150',
  sim_unidades:    '400',
  sim_costoVar:    '60',
  sim_costosFijos: '35000',
  sim_inversion:   '80000',
  sim_crecimiento: '3',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parse = (v: string) => parseFloat(v.replace(/,/g, '')) || 0

function fmt(n: number) {
  const abs = Math.abs(n)
  const s = `$${abs.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
  return n < 0 ? `−${s}` : s
}

function fmtCommas(raw: string): string {
  const n = parseFloat(raw.replace(/,/g, ''))
  return isNaN(n) ? raw : n.toLocaleString('es-MX', { maximumFractionDigits: 2 })
}

// ─── MoneyInput ───────────────────────────────────────────────────────────────
function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [display, setDisplay] = useState(() => fmtCommas(value))
  useEffect(() => { setDisplay(fmtCommas(value)) }, [value])

  return (
    <div className="flex items-center rounded-xl overflow-hidden"
      style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-input)' }}>
      <div className="flex items-center justify-center w-9 h-9 shrink-0"
        style={{ background: '#f0fdf4', borderRight: '1px solid var(--color-border)' }}>
        <DollarSign size={13} strokeWidth={2.2} style={{ color: '#16a34a' }} />
      </div>
      <input
        type="text" inputMode="decimal" value={display}
        onChange={e => { const c = e.target.value.replace(/[^0-9.]/g, ''); setDisplay(c); onChange(c) }}
        onBlur={() => { const n = parse(display); setDisplay(fmtCommas(String(n))); onChange(String(n)) }}
        onFocus={() => { const n = parse(display); setDisplay(isNaN(n) ? '' : String(n)) }}
        className="flex-1 bg-transparent text-sm px-2.5 py-2 outline-none min-w-0"
        style={{ color: 'var(--color-text)' }}
      />
    </div>
  )
}

// ─── PctInput ─────────────────────────────────────────────────────────────────
function PctInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-xl overflow-hidden"
      style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-input)' }}>
      <input
        type="number" min={0} max={100} step={0.5} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm px-2.5 py-2 outline-none min-w-0"
        style={{ color: 'var(--color-text)' }}
      />
      <div className="flex items-center justify-center w-8 shrink-0 text-sm font-bold"
        style={{ color: '#6b6b78', borderLeft: '1px solid var(--color-border)', height: '2.25rem' }}>
        %
      </div>
    </div>
  )
}

// ─── Veredicto ────────────────────────────────────────────────────────────────
type Verdict = 'rentable' | 'marginal' | 'no-rentable'

function getVerdict(utilidad: number, margenSeguridad: number): Verdict {
  if (utilidad <= 0) return 'no-rentable'
  if (margenSeguridad < 0.20) return 'marginal'
  return 'rentable'
}

const VERDICT_META = {
  'rentable':    { label: 'Rentable',       icon: CheckCircle,  bg: '#052e16',                  border: '#166534',                  text: '#4ade80', iconColor: '#4ade80', darkBox: true  },
  'marginal':    { label: 'Margen ajustado', icon: AlertCircle, bg: 'var(--color-card)',          border: 'var(--color-border-strong)', text: '#d97706', iconColor: '#d97706', darkBox: false },
  'no-rentable': { label: 'No rentable',    icon: XCircle,      bg: '#450a0a',                   border: '#991b1b',                  text: '#f87171', iconColor: '#f87171', darkBox: true  },
}

// ─── ScenarioRow ──────────────────────────────────────────────────────────────
function ScenarioRow({
  label, delta, unidades, precio, costoVar, costosFijos, isBase = false,
}: {
  label: string; delta: number; unidades: number; precio: number
  costoVar: number; costosFijos: number; isBase?: boolean
}) {
  const uds = Math.round(unidades * (1 + delta))
  const utilidad = uds * (precio - costoVar) - costosFijos
  const positivo = utilidad >= 0
  return (
    <div
      className="grid items-center text-sm py-2.5 px-1 rounded-lg"
      style={{
        gridTemplateColumns: '80px 1fr 1fr auto',
        gap: '0.75rem',
        background: isBase ? 'var(--color-input)' : undefined,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span className="text-xs font-semibold" style={{ color: isBase ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-secondary)' }}>
        {uds.toLocaleString()} uds
      </span>
      <span className="font-semibold" style={{ color: positivo ? '#16a34a' : '#dc2626' }}>
        {fmt(utilidad)}
      </span>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={positivo
          ? { background: '#dcfce7', color: '#166534' }
          : { background: '#fee2e2', color: '#991b1b' }}>
        {positivo ? '✓' : '✗'}
      </span>
    </div>
  )
}

// ─── PriceWarningBanner ────────────────────────────────────────────────────────
const WARNING_CONFIG: Record<Exclude<PriceWarning, 'none'>, {
  color: string; bg: string; border: string; title: string
}> = {
  'below-cost':    { color: '#dc2626', bg: '#450a0a',  border: '#991b1b', title: 'Precio menor al costo — pérdida garantizada' },
  'low-margin':    { color: '#f59e0b', bg: '#422006',  border: '#92400e', title: 'Margen muy bajo — difícil cubrir gastos fijos' },
  'high-price':    { color: '#f59e0b', bg: '#1c1400',  border: '#78350f', title: 'Precio alto — la demanda se reduce automáticamente' },
  'extreme-price': { color: '#f87171', bg: '#450a0a',  border: '#991b1b', title: 'Precio extremo — el modelo asume demanda casi nula' },
}

function PriceWarningBanner({ warning, precio, costoVar, demandFactor, unidades, unidadesEfect }: {
  warning: Exclude<PriceWarning, 'none'>
  precio: number; costoVar: number; demandFactor: number
  unidades: number; unidadesEfect: number
}) {
  const cfg = WARNING_CONFIG[warning]
  const markup = costoVar > 0 ? (precio / costoVar).toFixed(1) : '—'
  const pctDemanda = Math.round(demandFactor * 100)
  const udsReducidas = Math.round(unidades - unidadesEfect)

  const msgs: Record<Exclude<PriceWarning, 'none'>, string> = {
    'below-cost':    `Tu precio ($${precio.toLocaleString()}) es menor o igual al costo de producción ($${costoVar.toLocaleString()}). Cada venta genera pérdida directa.`,
    'low-margin':    `El markup es ${markup}×. Con tan poco margen por unidad, necesitas un volumen muy alto para cubrir los costos fijos.`,
    'high-price':    `Markup ${markup}×. El simulador asume que la demanda baja al ${pctDemanda}% — eso son ~${udsReducidas.toLocaleString()} unidades menos de las que ingresaste.`,
    'extreme-price': `Markup ${markup}×. A este precio casi nadie compraría. El simulador aplica demanda al ${pctDemanda}% de lo estimado.`,
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <TriangleAlert size={15} strokeWidth={2} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
      <div>
        <p className="text-xs font-semibold mb-0.5" style={{ color: cfg.color }}>{cfg.title}</p>
        <p className="text-xs leading-relaxed" style={{ color: cfg.color, opacity: 0.8 }}>{msgs[warning]}</p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SimuladorRentabilidadPage() {
  type Fields = typeof DEFAULTS
  const [fields, setFields] = useState<Fields>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)
  const [fromPrecios, setFromPrecios] = useState(false)
  const [fromDemanda, setFromDemanda] = useState(false)

  useEffect(() => {
    const ls = readLS()
    const precio   = ls.er_precioPromedio        ?? ls.sim_precio      ?? DEFAULTS.sim_precio
    const unidades = ls.er_ventasEstimadasMes    ?? ls.sim_unidades    ?? DEFAULTS.sim_unidades
    const costoVar = ls.er_costoVariableUnitario ?? ls.sim_costoVar    ?? DEFAULTS.sim_costoVar
    const fijos    = ls.er_gastosOperativosFijos ?? ls.sim_costosFijos ?? DEFAULTS.sim_costosFijos
    const inv      = ls.er_inversionInicial      ?? ls.sim_inversion   ?? DEFAULTS.sim_inversion
    const crec     = ls.er_tasaCrecimiento       ?? ls.sim_crecimiento ?? DEFAULTS.sim_crecimiento

    setFields({ sim_precio: precio, sim_unidades: unidades, sim_costoVar: costoVar, sim_costosFijos: fijos, sim_inversion: inv, sim_crecimiento: crec })
    setFromPrecios(!!ls.er_precioPromedio)
    setFromDemanda(!!ls.er_ventasEstimadasMes)
    setHydrated(true)
  }, [])

  const set = useCallback((k: keyof Fields, v: string) => {
    setFields(prev => {
      const next = { ...prev, [k]: v }
      writeLS(next as Record<string, string>)
      return next
    })
  }, [])

  // ─── Derived ────────────────────────────────────────────────────────────────
  const precio      = parse(fields.sim_precio)
  const unidades    = parse(fields.sim_unidades)
  const costoVar    = parse(fields.sim_costoVar)
  const costosFijos = parse(fields.sim_costosFijos)
  const inversion   = parse(fields.sim_inversion)
  const crecimiento = parse(fields.sim_crecimiento) / 100

  const income    = calcIncomeStatement({ precioPromedio: precio, ventasEstimadasMes: unidades, costoVariableUnitario: costoVar, gastosOperativosFijos: costosFijos })
  const be        = calcBreakEven({ costosFijos, precioUnitario: precio, costoVariableUnitario: costoVar, unidadesActuales: unidades })
  const mc        = precio - costoVar

  // ─── Elasticidad y advertencias de precio ────────────────────────────────────
  const demandFactor   = calcDemandFactor(precio, costoVar)
  const priceWarning   = getPriceWarning(precio, costoVar)
  const unidadesEfect  = income.ventasEfectivas   // ya calculado dentro de income

  const verdict   = getVerdict(income.utilidadOperativa, be.margenSeguridad)
  const meta      = VERDICT_META[verdict]
  const VerdictIcon = meta.icon

  const costoVarFrac = income.ingresos > 0 ? income.costosVariables / income.ingresos : 0
  const projection = calcProjection({ ventasBase: income.ingresos, tasaCrecimiento: crecimiento, costoVariable: costoVarFrac, costosFijos, inflacionEstimada: 0, horizonteMeses: 6, inversionInicial: inversion })
  const cashFlowData = projection.map(p => ({ month: `Mes ${p.mes}`, cashFlow: Math.round(p.flujoCaja), accumulated: Math.round(p.acumulado) }))
  const mesRecuperacion = projection.find(p => p.acumulado >= 0)?.mes ?? null

  // Eje X: usar unidades efectivas para escalar el gráfico
  const safeMaxRef = isFinite(be.unidades) ? Math.max(be.unidades, unidadesEfect) : Math.max(unidadesEfect * 2, 100)
  const maxBE = Math.ceil(safeMaxRef * 1.8 / 100) * 100 || 1000
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const u = (maxBE / 10) * i
    return { units: u, revenue: u * precio, totalCost: costosFijos + u * costoVar }
  })

  // ─── Estrategias por veredicto ────────────────────────────────────────────
  type Strategy = { icon: React.ElementType; title: string; detail: string }
  const strategies: Strategy[] = verdict === 'rentable'
    ? [
        { icon: Target,      title: 'Consolida tu ventaja',       detail: `Tu margen de seguridad es ${(be.margenSeguridad * 100).toFixed(0)}% — por encima del umbral del 20%. Mantén los costos fijos bajo control para no erosionarlo.` },
        { icon: ArrowUpRight, title: 'Escala con prudencia',       detail: `Con ${fmt(income.utilidadOperativa)}/mes de utilidad puedes reinvertir entre el 30–50% para crecer. Prioriza acciones que aumenten unidades vendidas sin subir costos fijos.` },
        { icon: Users,        title: 'Fideliza a tus clientes',   detail: `Reducir la rotación de clientes un 5% puede aumentar la utilidad más que captar nuevos clientes. Implementa programa de lealtad o seguimiento post-venta.` },
      ]
    : verdict === 'marginal'
    ? [
        { icon: Scissors,    title: 'Reduce costos fijos',         detail: `Tus costos fijos (${fmt(costosFijos)}/mes) consumen la mayor parte del margen. Renegocia renta, elimina suscripciones no esenciales o comparte espacio.` },
        { icon: ArrowUpRight, title: 'Sube precio o empaqueta',    detail: `Aumentar el precio un 10% (a ${fmt(precio * 1.1)}) elevaría tu utilidad en ${fmt(unidades * precio * 0.1)} sin cambiar costos. Considera bundle o tier premium.` },
        { icon: Target,      title: `Apunta a ${Math.ceil(be.unidades * 1.15).toLocaleString()} uds/mes`, detail: `Superar el break-even por 15% daría un margen de seguridad saludable. Diseña una oferta de lanzamiento para acelerar las primeras ventas.` },
      ]
    : [
        { icon: TrendingDown, title: `Brecha de ${fmt(Math.abs(income.utilidadOperativa))}/mes`, detail: `Necesitas ${Math.ceil(be.unidades).toLocaleString()} uds para cubrir costos — actualmente vendes ${unidades.toLocaleString()}. Falta cubrir ${Math.ceil(be.unidades - unidades).toLocaleString()} uds.` },
        { icon: Scissors,    title: 'Ataca los costos fijos primero', detail: `Reducir costos fijos un 20% (−${fmt(costosFijos * 0.2)}/mes) baja el break-even a ${Math.ceil((costosFijos * 0.8) / (mc || 1)).toLocaleString()} uds — más alcanzable con el volumen actual.` },
        { icon: ArrowUpRight, title: 'Revisa el precio unitario',   detail: `Con ${unidades.toLocaleString()} uds, necesitas un margen de contribución de ${fmt(costosFijos / (unidades || 1))}/u para equilibrar. Tu MC actual es ${fmt(mc)}/u — diferencia: ${fmt(costosFijos / (unidades || 1) - mc)}.` },
      ]

  if (!hydrated) return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[40vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
        className="w-7 h-7 rounded-full border-2 border-transparent"
        style={{ borderTopColor: '#000000', borderRightColor: '#00000030' }} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
              <TrendingUp size={24} strokeWidth={2.2} />
              Simulador de Rentabilidad
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              ¿Es viable tu idea? Ajusta los números y descúbrelo — guardado automáticamente
            </p>
          </div>
          <DataBadge type="estimacion" label="Motor financiero viabL" />
        </div>
      </motion.div>

      {/* ── Sección 1: Parámetros — dark box compacto ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid #1f1f1f' }}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#52525b' }}>
              Parámetros del negocio
            </p>
            <div className="flex items-center gap-1.5">
              {fromPrecios && <DataBadge type="dato" label="Precios" />}
              {fromDemanda && <DataBadge type="dato" label="Demanda" />}
            </div>
          </div>

          {/* 3×2 grid — todos los inputs en una sola cuadrícula */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">

            {/* Precio */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Precio / unidad
                <InfoTooltip variant="dark" text="Precio al que vendes cada unidad o servicio." />
              </label>
              <MoneyInput value={fields.sim_precio} onChange={v => set('sim_precio', v)} />
            </div>

            {/* Unidades */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Unidades / mes
                <InfoTooltip variant="dark" text="Cuántas unidades planeas vender al mes. 2–5% del mercado potencial es una cuota conservadora." />
              </label>
              <MoneyInput value={fields.sim_unidades} onChange={v => set('sim_unidades', v)} />
            </div>

            {/* Costo variable */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Costo variable / u
                <InfoTooltip variant="dark" text="Lo que te cuesta producir o entregar cada unidad: materia prima, empaque, comisión." />
              </label>
              <MoneyInput value={fields.sim_costoVar} onChange={v => set('sim_costoVar', v)} />
            </div>

            {/* Costos fijos */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Costos fijos / mes
                <InfoTooltip variant="dark" text="Renta, sueldos, servicios y licencias — lo que pagas aunque no vendas nada." />
              </label>
              <MoneyInput value={fields.sim_costosFijos} onChange={v => set('sim_costosFijos', v)} />
            </div>

            {/* Inversión */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Inversión inicial
                <InfoTooltip variant="dark" text="Capital para abrir: equipo, local, inventario inicial, permisos." />
              </label>
              <MoneyInput value={fields.sim_inversion} onChange={v => set('sim_inversion', v)} />
            </div>

            {/* Crecimiento */}
            <div>
              <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                Crec. mensual
                <InfoTooltip variant="dark" text="Crecimiento estimado en ventas por mes. 3–5% es conservador para negocio nuevo." />
              </label>
              <PctInput value={fields.sim_crecimiento} onChange={v => set('sim_crecimiento', v)} />
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Banner de advertencia de precio ── */}
      {priceWarning !== 'none' && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <PriceWarningBanner warning={priceWarning} precio={precio} costoVar={costoVar} demandFactor={demandFactor} unidades={unidades} unidadesEfect={unidadesEfect} />
        </motion.div>
      )}

      {/* ── Sección 2: Break-even chart ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <BreakEvenChart
          data={chartData}
          breakEvenUnits={isFinite(be.unidades) ? be.unidades : 0}
          currentUnits={unidades}
          costosFijos={costosFijos}
          precio={precio}
          costoVar={costoVar}
        />
      </motion.div>

      {/* ── Sección 3: Veredicto ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="rounded-2xl p-5" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
          {/* Veredicto header */}
          <div className="flex items-center gap-3 mb-5">
            <VerdictIcon size={22} strokeWidth={2} style={{ color: meta.iconColor }} />
            <p className="text-lg font-black" style={{ color: meta.darkBox ? meta.text : 'var(--color-text)' }}>{meta.label}</p>
            <span className="text-xs ml-auto" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-secondary)', opacity: meta.darkBox ? 0.7 : 1 }}>
              {unidades.toLocaleString()} uds/mes · {fmt(precio)}/u
            </span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Punto de equilibrio', value: isFinite(be.unidades) ? Math.ceil(be.unidades).toLocaleString() : '∞', sub: 'unidades / mes',   color: '#f4f4f5' },
              { label: 'Ventas mínimas',      value: isFinite(be.ventasBreakEven) ? fmt(be.ventasBreakEven) : '∞',          sub: 'para no perder',   color: '#60a5fa' },
              { label: 'Utilidad mensual',    value: fmt(income.utilidadOperativa),  sub: `margen ${(income.margenOperativo * 100).toFixed(1)}%`,     color: income.utilidadOperativa >= 0 ? '#4ade80' : '#f87171' },
              { label: 'Margen de seguridad', value: `${(be.margenSeguridad * 100).toFixed(1)}%`, sub: 'caída tolerable', color: be.margenSeguridad >= 0.2 ? '#4ade80' : be.margenSeguridad >= 0 ? '#fbbf24' : '#f87171' },
              { label: 'Recuperación inv.',   value: mesRecuperacion ? `Mes ${mesRecuperacion}` : 'N/A', sub: `${fmt(inversion)} inicial`, color: mesRecuperacion ? '#4ade80' : '#f87171' },
            ].map(({ label, value, sub, color }) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-secondary)', opacity: meta.darkBox ? 0.6 : 1 }}>{label}</p>
                <p className="text-xl font-black" style={{ color: meta.darkBox ? color : color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-muted)', opacity: meta.darkBox ? 0.5 : 1 }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Margen de contribución */}
          <div className="mt-4 pt-4 flex items-center gap-6 flex-wrap" style={{ borderTop: `1px solid ${meta.border}` }}>
            <div>
              <span className="text-xs" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-secondary)', opacity: meta.darkBox ? 0.6 : 1 }}>Margen de contribución: </span>
              <span className="text-sm font-bold" style={{ color: meta.darkBox ? '#f4f4f5' : 'var(--color-text)' }}>
                {fmt(mc)} / unidad
              </span>
              <span className="text-xs ml-1" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-muted)', opacity: meta.darkBox ? 0.5 : 1 }}>
                ({precio > 0 ? ((mc / precio) * 100).toFixed(0) : 0}% del precio)
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Sección 4: Simulación ¿qué pasa si…? ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>¿Qué pasa si mis ventas cambian?</p>
          <InfoTooltip text="Muestra cuánto ganarías o perderías si vendes más o menos de lo estimado. El escenario base son tus unidades actuales." />
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Sensibilidad de la utilidad operativa ante cambios en el volumen de ventas
        </p>

        {/* Cabecera tabla */}
        <div className="grid text-[10px] font-bold uppercase tracking-widest mb-1 px-1"
          style={{ gridTemplateColumns: '80px 1fr 1fr auto', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
          <span>Escenario</span>
          <span>Ventas</span>
          <span>Utilidad</span>
          <span></span>
        </div>

        {[
          { label: '−30%', delta: -0.30 },
          { label: '−10%', delta: -0.10 },
          { label: 'Base',  delta:  0,    isBase: true },
          { label: '+10%', delta: +0.10 },
          { label: '+30%', delta: +0.30 },
        ].map(row => (
          <ScenarioRow
            key={row.label}
            label={row.label}
            delta={row.delta}
            unidades={unidades}
            precio={precio}
            costoVar={costoVar}
            costosFijos={costosFijos}
            isBase={row.isBase}
          />
        ))}
      </motion.div>

      {/* ── Sección 5: Proyección 6 meses ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Proyección 6 meses
            <InfoTooltip text="Muestra cómo evoluciona tu flujo de caja mes a mes incluyendo el crecimiento estimado. El acumulado empieza negativo por la inversión inicial y sube hasta cruzar cero en el mes de recuperación." />
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>
        <CashFlowChart data={cashFlowData} mesRecuperacion={mesRecuperacion} />
      </motion.div>

      {/* ── Sección 6: Diagnóstico estratégico ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}>
        <div className="rounded-2xl p-5" style={{ background: '#1e1230', border: '1px solid #4c1d95' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <Lightbulb size={18} strokeWidth={1.75} style={{ color: '#a78bfa' }} />
            <p className="text-sm font-bold" style={{ color: '#e9d5ff' }}>Plan de acción estratégico</p>
            <span
              className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#4c1d95', color: '#c4b5fd' }}
            >
              {meta.label}
            </span>
          </div>

          {/* Estrategias */}
          <div className="space-y-3">
            {strategies.map((s, i) => {
              const SIcon = s.icon
              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid #4c1d9540' }}
                >
                  <div
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                    style={{ background: '#4c1d95' }}
                  >
                    <SIcon size={13} strokeWidth={2} style={{ color: '#c4b5fd' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#ddd6fe' }}>{s.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#a78bfa' }}>{s.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer hint */}
          <p className="text-[10px] mt-4 pt-3" style={{ borderTop: '1px solid #4c1d9540', color: '#6d28d9' }}>
            Estas sugerencias se calculan automáticamente con base en tus parámetros actuales.
          </p>
        </div>
      </motion.div>

    </div>
  )
}
