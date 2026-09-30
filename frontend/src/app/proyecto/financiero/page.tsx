'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, CheckCircle, XCircle, AlertCircle, Lightbulb, ArrowUpRight, Scissors, Users, Target, TrendingDown, TriangleAlert, RotateCcw, Save, ChevronDown } from 'lucide-react'
import { calcBreakEven, calcIncomeStatement, calcProjection, calcDemandFactor, getPriceWarning, type PriceWarning } from '@/lib/financial'
import BreakEvenChart from '@/components/charts/BreakEvenChart'
import CashFlowChart from '@/components/charts/CashFlowChart'
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

// Deltas para la tabla de escenarios y el switch de la gráfica
const SCENARIO_DELTAS = [
  { label: '−50%', delta: -0.50 },
  { label: '−20%', delta: -0.20 },
  { label: 'Base',  delta:  0,    isBase: true },
  { label: '+20%', delta: +0.20 },
  { label: '+50%', delta: +0.50 },
]

// ─── Leer todos los productos del onboarding del LS ──────────────────────────
interface ProductLS { name: string; price: number; cost: number; unit: string; units: number }

function readProductsFromLS(): ProductLS[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem('viabl_business_data_v1')
    if (!raw) return []
    const ls: Record<string, string> = JSON.parse(raw)

    const products: ProductLS[] = []

    // Producto 1
    if (ls.product1Name && ls.product1Price) {
      products.push({
        name:  ls.product1Name,
        price: parseFloat(ls.product1Price) || 0,
        cost:  parseFloat(ls.product1Cost || '0') || 0,
        unit:  ls.product1Unit || 'unidad',
        units: 0, // se llenará con la distribución de monthlyUnits
      })
    }
    // Producto 2
    if (ls.product2Name && ls.product2Price) {
      products.push({
        name:  ls.product2Name,
        price: parseFloat(ls.product2Price) || 0,
        cost:  parseFloat(ls.product2Cost || '0') || 0,
        unit:  ls.product2Unit || 'unidad',
        units: 0,
      })
    }
    // Productos extra (3-5)
    if (ls.extraProducts) {
      const extras = JSON.parse(ls.extraProducts) as { name: string; price: string; cost: string; unit: string }[]
      for (const e of extras.slice(0, 3)) {
        if (e.name && e.price) {
          products.push({
            name:  e.name,
            price: parseFloat(e.price) || 0,
            cost:  parseFloat(e.cost || '0') || 0,
            unit:  e.unit || 'unidad',
            units: 0,
          })
        }
      }
    }
    return products
  } catch { return [] }
}

// ─── Calcular precio/costo ponderados a partir de mix de productos ─────────────
function calcWeightedPriceAndCost(products: ProductLS[]): { precio: number; costoVar: number; totalUnits: number } {
  const totalUnits = products.reduce((s, p) => s + p.units, 0)
  if (totalUnits === 0 || products.length === 0) {
    return { precio: products[0]?.price ?? 0, costoVar: products[0]?.cost ?? 0, totalUnits: 0 }
  }
  const precio  = products.reduce((s, p) => s + p.price * p.units, 0) / totalUnits
  const costoVar = products.reduce((s, p) => s + p.cost  * p.units, 0) / totalUnits
  return { precio, costoVar, totalUnits }
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
  const [focused, setFocused] = useState(false)
  useEffect(() => { setDisplay(fmtCommas(value)) }, [value])

  return (
    <div
      className="flex items-center gap-1"
      style={{
        borderBottom: `1.5px solid ${focused ? '#ffffff' : 'rgba(255,255,255,0.18)'}`,
        transition: 'border-color 0.18s',
        paddingBottom: 2,
      }}
    >
      <DollarSign size={12} strokeWidth={2.5} style={{ color: '#16a34a', flexShrink: 0 }} />
      <input
        type="text" inputMode="decimal" value={display}
        onChange={e => { const c = e.target.value.replace(/[^0-9.]/g, ''); setDisplay(c); onChange(c) }}
        onBlur={() => { const n = parse(display); setDisplay(fmtCommas(String(n))); onChange(String(n)); setFocused(false) }}
        onFocus={() => { const n = parse(display); setDisplay(isNaN(n) ? '' : String(n)); setFocused(true) }}
        className="flex-1 bg-transparent text-sm py-1 outline-none min-w-0 font-medium"
        style={{ color: '#f4f4f5' }}
      />
    </div>
  )
}

// ─── PctInput ─────────────────────────────────────────────────────────────────
function PctInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      className="flex items-center gap-1"
      style={{
        borderBottom: `1.5px solid ${focused ? '#ffffff' : 'rgba(255,255,255,0.18)'}`,
        transition: 'border-color 0.18s',
        paddingBottom: 2,
      }}
    >
      <input
        type="number" min={0} max={100} step={0.5} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm py-1 outline-none min-w-0 font-medium"
        style={{ color: '#f4f4f5' }}
      />
      <span className="text-sm font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>%</span>
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

  // ─── Idea B: toggle IVA ───────────────────────────────────────────────────
  const [ivaIncluido, setIvaIncluido] = useState(false)

  // ─── Idea D: horizonte de proyección ─────────────────────────────────────
  const [horizonte, setHorizonte] = useState<3 | 6 | 12>(6)

  // ─── Multi-producto: lista de productos + unidades editables por producto ─
  const [products, setProducts] = useState<ProductLS[]>([])
  const [originalProducts, setOriginalProducts] = useState<ProductLS[]>([])
  const [modoMultiProducto, setModoMultiProducto] = useState(true)

  // ─── Switch escenario en gráfica BE ───────────────────────────────────────
  const [scenarioIdx, setScenarioIdx] = useState(2) // índice 2 = Base

  // ─── Accordion "¿Qué pasa si…?" ──────────────────────────────────────────
  const [scenariosOpen, setScenariosOpen] = useState(false)

  // ─── Popup confirmación "Guardar como original" ────────────────────────────
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // ─── Estados de botón presionado (efecto click) ───────────────────────────
  const [resetPressed, setResetPressed] = useState(false)
  const [savePressed, setSavePressed] = useState(false)

  // ─── Valores originales de referencia (se actualizan solo al guardar) ─────
  const [origFields, setOrigFields] = useState<typeof DEFAULTS>(DEFAULTS)

  useEffect(() => {
    const ls = readLS()
    // Preferir datos del onboarding; caer en sim_* si no hay nada
    const precio   = ls.product1Price     ?? ls.er_precioPromedio        ?? ls.sim_precio      ?? DEFAULTS.sim_precio
    const unidades = ls.monthlyUnits      ?? ls.er_ventasEstimadasMes    ?? ls.sim_unidades    ?? DEFAULTS.sim_unidades
    const costoVar = ls.product1Cost      ?? ls.er_costoVariableUnitario ?? ls.sim_costoVar    ?? DEFAULTS.sim_costoVar
    const fijos    = ls.monthlyFixedCosts ?? ls.er_gastosOperativosFijos ?? ls.sim_costosFijos ?? DEFAULTS.sim_costosFijos
    const inv      = ls.capitalAvailable  ?? ls.er_inversionInicial      ?? ls.sim_inversion   ?? DEFAULTS.sim_inversion
    const crec     = ls.er_tasaCrecimiento ?? ls.sim_crecimiento          ?? DEFAULTS.sim_crecimiento

    const loaded = { sim_precio: precio, sim_unidades: unidades, sim_costoVar: costoVar, sim_costosFijos: fijos, sim_inversion: inv, sim_crecimiento: crec }
    setFields(loaded)
    setOrigFields(loaded)

    // Cargar productos del LS con distribución uniforme de unidades
    const prods = readProductsFromLS()
    const totalUds = parseFloat(unidades) || 0
    const udsPerProduct = prods.length > 0 ? Math.round(totalUds / prods.length) : 0
    const loadedProducts = prods.map(p => ({ ...p, units: udsPerProduct }))
    setProducts(loadedProducts)
    setOriginalProducts(loadedProducts)

    setHydrated(true)
  }, [])

  const set = useCallback((k: keyof Fields, v: string) => {
    setFields(prev => {
      const next = { ...prev, [k]: v }
      writeLS(next as Record<string, string>)
      return next
    })
  }, [])

  // ─── "Guardar como original" — persiste campos + productos y sincroniza entre modos ──
  function guardarComoOriginal() {
    // Calcular los valores canónicos: si multi-producto activo, derivar precio/costo/uds del mix
    let canonPrecio   = fields.sim_precio
    let canonCostoVar = fields.sim_costoVar
    let canonUnidades = fields.sim_unidades

    if (modoMultiProducto && products.length > 0) {
      const { precio: mp, costoVar: mc, totalUnits: tu } = calcWeightedPriceAndCost(products)
      if (tu > 0) {
        canonPrecio   = String(Math.round(mp))
        canonCostoVar = String(Math.round(mc))
        canonUnidades = String(tu)
      }
    }

    const patch: Record<string, string> = {
      product1Price:     canonPrecio,
      monthlyUnits:      canonUnidades,
      product1Cost:      canonCostoVar,
      monthlyFixedCosts: fields.sim_costosFijos,
      capitalAvailable:  fields.sim_inversion,
      sim_crecimiento:   fields.sim_crecimiento,
    }

    // Guardar productos actuales en LS (siempre, independiente del modo)
    if (products.length > 0) {
      if (products[0]) {
        patch.product1Name  = products[0].name
        patch.product1Price = String(products[0].price)
        patch.product1Cost  = String(products[0].cost)
        patch.product1Unit  = products[0].unit
      }
      if (products[1]) {
        patch.product2Name  = products[1].name
        patch.product2Price = String(products[1].price)
        patch.product2Cost  = String(products[1].cost)
        patch.product2Unit  = products[1].unit
      }
      patch.extraProducts = products.length > 2
        ? JSON.stringify(products.slice(2).map(p => ({ name: p.name, price: String(p.price), cost: String(p.cost), unit: p.unit })))
        : '[]'
    }

    // Si el modo es single-producto, actualizar también el primer producto del array
    if (!modoMultiProducto && products.length > 0) {
      const updatedProducts = products.map((p, i) =>
        i === 0 ? { ...p, price: parseFloat(canonPrecio) || p.price, cost: parseFloat(canonCostoVar) || p.cost } : p
      )
      setProducts(updatedProducts)
      setOriginalProducts(updatedProducts.map(p => ({ ...p })))
    } else {
      setOriginalProducts(products.map(p => ({ ...p })))
    }

    // Sincronizar fields con los valores canónicos para que single-producto refleje el mix
    const newFields = { ...fields, sim_precio: canonPrecio, sim_costoVar: canonCostoVar, sim_unidades: canonUnidades }
    setFields(newFields)
    setOrigFields(newFields)

    writeLS(patch)
    setShowSaveConfirm(false)
  }

  // ─── "Restablecer al original" — vuelve a los valores originales + productos originales ──
  function restablecerAlOriginal() {
    setFields({ ...origFields })
    setProducts(originalProducts.map(p => ({ ...p })))
  }

  // ─── Helpers para detectar campos editados vs. original ───────────────────
  function isDirtyField(key: keyof typeof DEFAULTS): boolean {
    return fields[key] !== origFields[key]
  }

  function isDirtyProduct(i: number, col: 'price' | 'cost' | 'units' | 'name'): boolean {
    const orig = originalProducts[i]
    if (!orig) return true // producto nuevo = siempre "sin guardar"
    return products[i]?.[col] !== orig[col]
  }

  // ─── Derived ────────────────────────────────────────────────────────────────
  // Modo multi-producto: precio/costo ponderados por el mix de unidades
  const { precio: precioMP, costoVar: costoVarMP, totalUnits: totalUnitsMP } = modoMultiProducto && products.length > 1
    ? calcWeightedPriceAndCost(products)
    : { precio: 0, costoVar: 0, totalUnits: 0 }

  // Idea B: precio efectivo sin IVA si el toggle está activo (IVA MX = 16%)
  const precioRaw   = modoMultiProducto && products.length > 1 ? precioMP : parse(fields.sim_precio)
  const precio      = ivaIncluido ? precioRaw / 1.16 : precioRaw
  const unidades    = modoMultiProducto && products.length > 1 ? totalUnitsMP : parse(fields.sim_unidades)
  const costoVar    = modoMultiProducto && products.length > 1 ? costoVarMP  : parse(fields.sim_costoVar)
  const costosFijos = parse(fields.sim_costosFijos)
  const inversion   = parse(fields.sim_inversion)
  const crecimiento = parse(fields.sim_crecimiento) / 100

  // Unidades con escenario del switch (solo para el chart, no modifica los cálculos base)
  const scenarioDelta = SCENARIO_DELTAS[scenarioIdx]?.delta ?? 0
  const unidadesConEscenario = Math.round(unidades * (1 + scenarioDelta))

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
  const projection = calcProjection({ ventasBase: income.ingresos, tasaCrecimiento: crecimiento, costoVariable: costoVarFrac, costosFijos, inflacionEstimada: 0, horizonteMeses: horizonte, inversionInicial: inversion })
  const cashFlowData = projection.map(p => ({ month: `Mes ${p.mes}`, cashFlow: Math.round(p.flujoCaja), accumulated: Math.round(p.acumulado) }))
  const mesRecuperacion = projection.find(p => p.acumulado >= 0)?.mes ?? null

  // Eje X: intervalos estrictamente regulares (sin excepciones en la secuencia)
  const safeMaxRef = isFinite(be.unidades) ? Math.max(be.unidades, unidadesEfect) : Math.max(unidadesEfect * 2, 100)
  const rawStep = (safeMaxRef * 1.8 || 1000) / 10
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(rawStep, 1))))
  const step = ([1, 2, 5, 10].map(m => m * mag).find(s => s >= rawStep) ?? mag * 10)
  const maxBE = step * 10
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const u = step * i
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
            <h1 className="text-2xl flex items-center gap-2.5" style={{ fontFamily: '"Playfair Display","Georgia","Times New Roman",serif', fontWeight: 700, fontStyle: 'italic', color: 'var(--color-text)' }}>
              <TrendingUp size={24} strokeWidth={2} />
              Simulador de Rentabilidad
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              ¿Es viable tu idea? Ajusta los números y descúbrelo — guardado automáticamente
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Sección 1: Parámetros — dark box con modo onboarding/manual (Idea F) ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid #1f1f1f' }}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#52525b' }}>
                Parámetros del negocio
              </p>
              {/* Indicador global "Sin guardar" */}
              {(Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).some(k => isDirtyField(k)) || products.length !== originalProducts.length || products.some((_, i) => isDirtyProduct(i, 'price') || isDirtyProduct(i, 'cost') || isDirtyProduct(i, 'units') || isDirtyProduct(i, 'name')) ? (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#fb923c18', color: '#fb923c', border: '1px solid #fb923c30' }}>
                  Sin guardar
                </span>
              ) : null}
            </div>
            {/* Toggle IVA */}
            <button
              onClick={() => setIvaIncluido(v => !v)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition"
              style={ivaIncluido
                ? { background: '#16a34a20', color: '#4ade80', border: '1px solid #16a34a40' }
                : { background: '#ffffff10', color: '#71717a', border: '1px solid #27272a' }}
            >
              IVA {ivaIncluido ? 'incl. ✓' : 'excl.'}
              <InfoTooltip variant="dark" text="Activa si tu precio incluye IVA (16%). El simulador descuenta el impuesto para calcular el margen real." />
            </button>
          </div>

          {/* IVA hint */}
          {ivaIncluido && (
            <div className="mb-3 px-2 py-1.5 rounded-lg text-[11px]" style={{ background: '#16a34a10', color: '#4ade80', border: '1px solid #16a34a20' }}>
              Precio sin IVA: <span className="font-bold">${(precioRaw / 1.16).toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span> — este es el valor usado en los cálculos
            </div>
          )}

          {/* Tabla de productos — siempre visible */}
          {products.length > 0 ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                {/* Cabecera */}
                <div className="grid text-[10px] font-bold uppercase tracking-widest px-2"
                  style={{ gridTemplateColumns: '1fr 72px 72px 68px 28px', gap: '0.4rem', color: '#52525b' }}>
                  <span>Producto</span>
                  <span>Precio $</span>
                  <span>Costo $</span>
                  <span className="flex items-center gap-0.5">
                    Ventas
                    <InfoTooltip variant="dark" text="Unidades vendidas por mes para este producto." />
                  </span>
                  <span />
                </div>
                {products.map((p, i) => {
                  const isNew = p.name === '' && p.price === 0 && p.cost === 0
                  const dirtyName  = isDirtyProduct(i, 'name')
                  const dirtyPrice = isDirtyProduct(i, 'price')
                  const dirtyCost  = isDirtyProduct(i, 'cost')
                  const dirtyUnits = isDirtyProduct(i, 'units')
                  return (
                    <div key={i} className="group grid items-center px-2 py-2 rounded-xl transition-colors"
                      style={{ gridTemplateColumns: '1fr 72px 72px 68px 28px', gap: '0.4rem', background: '#0d0d0d', border: '1px solid #1f1f1f' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3f3f46' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1f1f1f' }}>
                      {/* Nombre */}
                      <input
                        type="text"
                        value={p.name}
                        placeholder={isNew ? 'Nombre del producto' : p.name}
                        onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                        className="w-full bg-transparent text-[11px] font-medium outline-none truncate"
                        style={{ color: dirtyName ? '#fb923c' : (p.name ? '#e4e4e7' : '#52525b'), caretColor: '#c4b5fd' }}
                      />
                      {/* Precio */}
                      <input
                        type="number" min={0}
                        value={p.price || ''}
                        placeholder="0"
                        onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value) || 0 } : x))}
                        className="w-full bg-transparent text-[11px] text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: dirtyPrice ? '#fb923c' : '#a1a1aa', borderBottom: `1px solid ${dirtyPrice ? '#f9733660' : '#27272a'}`, caretColor: '#c4b5fd' }}
                        onFocus={e => { e.currentTarget.style.borderBottomColor = dirtyPrice ? '#fb923c' : '#7c3aed'; e.currentTarget.style.color = '#e4e4e7' }}
                        onBlur={e => { e.currentTarget.style.borderBottomColor = dirtyPrice ? '#f9733660' : '#27272a'; e.currentTarget.style.color = dirtyPrice ? '#fb923c' : '#a1a1aa' }}
                      />
                      {/* Costo */}
                      <input
                        type="number" min={0}
                        value={p.cost || ''}
                        placeholder="0"
                        onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, cost: parseFloat(e.target.value) || 0 } : x))}
                        className="w-full bg-transparent text-[11px] text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: dirtyCost ? '#fb923c' : '#a1a1aa', borderBottom: `1px solid ${dirtyCost ? '#f9733660' : '#27272a'}`, caretColor: '#c4b5fd' }}
                        onFocus={e => { e.currentTarget.style.borderBottomColor = dirtyCost ? '#fb923c' : '#7c3aed'; e.currentTarget.style.color = '#e4e4e7' }}
                        onBlur={e => { e.currentTarget.style.borderBottomColor = dirtyCost ? '#f9733660' : '#27272a'; e.currentTarget.style.color = dirtyCost ? '#fb923c' : '#a1a1aa' }}
                      />
                      {/* Unidades */}
                      <input
                        type="number" min={0}
                        value={p.units || ''}
                        placeholder="0"
                        onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, units: parseInt(e.target.value) || 0 } : x))}
                        className="w-full bg-transparent text-[11px] font-semibold text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: dirtyUnits ? '#fb923c' : '#c4b5fd', borderBottom: `1px solid ${dirtyUnits ? '#f9733660' : '#27272a'}`, caretColor: '#c4b5fd' }}
                        onFocus={e => { e.currentTarget.style.borderBottomColor = dirtyUnits ? '#fb923c' : '#7c3aed' }}
                        onBlur={e => { e.currentTarget.style.borderBottomColor = dirtyUnits ? '#f9733660' : '#27272a' }}
                      />
                      {/* Eliminar */}
                      <button
                        onClick={() => setProducts(products.filter((_, j) => j !== i))}
                        className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded-md transition-all"
                        style={{ color: '#71717a', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#450a0a'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#71717a' }}
                        title="Eliminar producto"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
                {/* Botón agregar nuevo producto */}
                <button
                  onClick={() => setProducts([...products, { name: '', price: 0, cost: 0, unit: 'unidad', units: 0 }])}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all"
                  style={{ color: '#52525b', border: '1px dashed #27272a', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60'; (e.currentTarget as HTMLElement).style.color = '#c4b5fd'; (e.currentTarget as HTMLElement).style.background = '#7c3aed08' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLElement).style.color = '#52525b'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Agregar producto
                </button>
              </div>
              {/* Resumen ponderado */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] pt-2" style={{ borderTop: '1px solid #1f1f1f' }}>
                <span style={{ color: '#52525b' }}>Precio prom.:</span>
                <span className="font-bold" style={{ color: '#e4e4e7' }}>${precio.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span>
                <span style={{ color: '#52525b' }}>Costo prom.:</span>
                <span className="font-bold" style={{ color: '#e4e4e7' }}>${costoVar.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span>
                <span style={{ color: '#52525b' }}>Total:</span>
                <span className="font-bold" style={{ color: '#c4b5fd' }}>{unidades.toLocaleString('es-MX')} uds/mes</span>
              </div>
              {/* Costos fijos, inversión y crecimiento en modo multi-producto */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-3 pt-3" style={{ borderTop: '1px solid #1f1f1f' }}>
                <div>
                  <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                    Costos fijos / mes
                    <InfoTooltip variant="dark" text="Renta, sueldos, servicios y licencias." />
                  </label>
                  <MoneyInput value={fields.sim_costosFijos} onChange={v => set('sim_costosFijos', v)} />
                  {isDirtyField('sim_costosFijos') && <p className="text-[10px] mt-0.5" style={{ color: '#fb923c' }}>Sin guardar</p>}
                </div>
                <div>
                  <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                    Inversión inicial
                    <InfoTooltip variant="dark" text="Capital para abrir: equipo, local, inventario." />
                  </label>
                  <MoneyInput value={fields.sim_inversion} onChange={v => set('sim_inversion', v)} />
                  {isDirtyField('sim_inversion') && <p className="text-[10px] mt-0.5" style={{ color: '#fb923c' }}>Sin guardar</p>}
                </div>
                <div>
                  <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: '#a1a1aa' }}>
                    Crec. mensual
                    <InfoTooltip variant="dark" text="Crecimiento estimado en ventas por mes." />
                  </label>
                  <PctInput value={fields.sim_crecimiento} onChange={v => set('sim_crecimiento', v)} />
                  {isDirtyField('sim_crecimiento') && <p className="text-[10px] mt-0.5" style={{ color: '#fb923c' }}>Sin guardar</p>}
                </div>
              </div>
            </div>
          ) : (
            /* Sin productos en LS — fallback a inputs manuales */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              {([
                { key: 'sim_precio'     as const, label: 'Precio / unidad',    tooltip: 'Precio al que vendes cada unidad o servicio.',                                                           type: 'money' },
                { key: 'sim_unidades'   as const, label: 'Unidades / mes',     tooltip: 'Cuántas unidades planeas vender al mes. 2–5% del mercado potencial es una cuota conservadora.',         type: 'money' },
                { key: 'sim_costoVar'   as const, label: 'Costo variable / u', tooltip: 'Lo que te cuesta producir o entregar cada unidad: materia prima, empaque, comisión.',                   type: 'money' },
                { key: 'sim_costosFijos'as const, label: 'Costos fijos / mes', tooltip: 'Renta, sueldos, servicios y licencias — lo que pagas aunque no vendas nada.',                           type: 'money' },
                { key: 'sim_inversion'  as const, label: 'Inversión inicial',  tooltip: 'Capital para abrir: equipo, local, inventario inicial, permisos.',                                      type: 'money' },
                { key: 'sim_crecimiento'as const, label: 'Crec. mensual',      tooltip: 'Crecimiento estimado en ventas por mes. 3–5% es conservador para negocio nuevo.',                       type: 'pct'   },
              ] as { key: keyof typeof DEFAULTS; label: string; tooltip: string; type: 'money' | 'pct' }[]).map(({ key, label, tooltip, type }) => {
                const dirty = isDirtyField(key)
                return (
                  <div key={key}>
                    <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: dirty ? '#fb923c' : '#a1a1aa' }}>
                      {label}
                      <InfoTooltip variant="dark" text={tooltip} />
                    </label>
                    {type === 'pct'
                      ? <PctInput value={fields[key]} onChange={v => set(key, v)} />
                      : <MoneyInput value={fields[key]} onChange={v => set(key, v)} />}
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer: Restablecer al original + Guardar como original */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #1f1f1f' }}>
            <button
              onClick={() => {
                setResetPressed(true)
                setTimeout(() => setResetPressed(false), 150)
                restablecerAlOriginal()
              }}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: resetPressed ? '#ffffff20' : '#ffffff08',
                color: '#71717a',
                border: '1px solid #27272a',
                transform: resetPressed ? 'scale(0.96)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!resetPressed) { (e.currentTarget as HTMLElement).style.background = '#ffffff15'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; (e.currentTarget as HTMLElement).style.borderColor = '#3f3f46' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff08'; (e.currentTarget as HTMLElement).style.color = '#71717a'; (e.currentTarget as HTMLElement).style.borderColor = '#27272a' }}
            >
              <RotateCcw size={11} strokeWidth={2.5} />
              Restablecer al original
            </button>
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: savePressed ? '#16a34a30' : '#16a34a15',
                color: '#4ade80',
                border: '1px solid #16a34a30',
                transform: savePressed ? 'scale(0.96)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!savePressed) { (e.currentTarget as HTMLElement).style.background = '#16a34a25'; (e.currentTarget as HTMLElement).style.borderColor = '#16a34a50' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#16a34a15'; (e.currentTarget as HTMLElement).style.borderColor = '#16a34a30' }}
            >
              <Save size={11} strokeWidth={2.5} />
              Guardar como original
            </button>
          </div>

          {/* Popup confirmación guardar */}
          {showSaveConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="rounded-2xl p-5 w-72" style={{ background: '#111', border: '1px solid #27272a' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#e4e4e7' }}>¿Guardar cambios?</p>
                <p className="text-[11px] mb-4" style={{ color: '#71717a' }}>
                  Los valores actuales reemplazarán los datos de referencia del onboarding. No se puede deshacer.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowSaveConfirm(false)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#1f1f1f', color: '#71717a', border: '1px solid #27272a' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2a2a2a' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1f1f1f' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setSavePressed(true)
                      setTimeout(() => setSavePressed(false), 150)
                      guardarComoOriginal()
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#16a34a20', color: '#4ade80', border: '1px solid #16a34a40' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#16a34a35' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#16a34a20' }}
                  >
                    <Save size={10} strokeWidth={2.5} />
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Banner de advertencia de precio ── */}
      {priceWarning !== 'none' && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <PriceWarningBanner warning={priceWarning} precio={precio} costoVar={costoVar} demandFactor={demandFactor} unidades={unidades} unidadesEfect={unidadesEfect} />
        </motion.div>
      )}

      {/* ── Sección 2: Break-even chart con switch de escenarios ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <BreakEvenChart
          data={chartData}
          breakEvenUnits={isFinite(be.unidades) ? be.unidades : 0}
          currentUnits={unidadesConEscenario}
          costosFijos={costosFijos}
          precio={precio}
          costoVar={costoVar}
          scenarioIdx={scenarioIdx}
          onScenarioChange={setScenarioIdx}
          baseUnits={unidades}
        />
      </motion.div>

      {/* ── Sección 3: Veredicto ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="rounded-2xl p-5" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
          {/* Veredicto header */}
          <div className="flex items-center gap-3 mb-5">
            <VerdictIcon size={22} strokeWidth={2} style={{ color: meta.iconColor }} />
            <p className="text-lg font-black" style={{ color: meta.darkBox ? meta.text : 'var(--color-text)' }}>{meta.label}</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Punto de equilibrio', value: isFinite(be.unidades) ? Math.ceil(be.unidades).toLocaleString() : '∞', sub: 'unidades / mes',   color: '#f4f4f5' },
              { label: 'Ventas mínimas',      value: isFinite(be.ventasBreakEven) ? fmt(be.ventasBreakEven) : '∞',          sub: 'para no perder',   color: '#60a5fa' },
              { label: 'Utilidad mensual',    value: fmt(income.utilidadOperativa),  sub: `margen ${(income.margenOperativo * 100).toFixed(1)}%`,     color: income.utilidadOperativa >= 0 ? '#4ade80' : '#f87171' },
              { label: 'Margen de seguridad', value: `${(be.margenSeguridad * 100).toFixed(1)}%`, sub: 'caída tolerable', color: be.margenSeguridad >= 0.2 ? '#4ade80' : be.margenSeguridad >= 0 ? '#fbbf24' : '#f87171' },
              { label: 'Recuperación inv.',   value: mesRecuperacion ? `Mes ${mesRecuperacion}` : 'N/A', sub: `${fmt(inversion)} inicial`, color: mesRecuperacion ? '#4ade80' : '#f87171' },
              { label: 'Margen contribución', value: fmt(mc), sub: `${precio > 0 ? ((mc / precio) * 100).toFixed(0) : 0}% del precio`, color: mc >= 0 ? '#f4f4f5' : '#f87171' },
            ].map(({ label, value, sub, color }) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-secondary)', opacity: meta.darkBox ? 0.6 : 1 }}>{label}</p>
                <p className="text-xl font-black" style={{ color: meta.darkBox ? color : color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-muted)', opacity: meta.darkBox ? 0.5 : 1 }}>{sub}</p>
              </div>
            ))}
          </div>
          {/* Accordion: ¿Qué pasa si mis ventas cambian? */}
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${meta.border}` }}>
            <button
              onClick={() => setScenariosOpen(v => !v)}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold" style={{ color: meta.darkBox ? meta.text : 'var(--color-text-secondary)' }}>
                  ¿Qué pasa si mis ventas cambian?
                </p>
                <InfoTooltip text="Muestra cuánto ganarías o perderías si vendes más o menos de lo estimado. El escenario base son tus unidades actuales." />
              </div>
              <ChevronDown
                size={14} strokeWidth={2}
                style={{
                  color: meta.darkBox ? meta.text : 'var(--color-text-muted)',
                  transform: scenariosOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  opacity: meta.darkBox ? 0.6 : 1,
                }}
              />
            </button>

            {scenariosOpen && (
              <div className="mt-3 space-y-0.5">
                {SCENARIO_DELTAS.map(row => (
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
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Sección 5: Proyección (horizonte ajustable — Idea D) ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Proyección de flujo de caja</p>
          <InfoTooltip text="Muestra cómo evoluciona tu flujo de caja mes a mes incluyendo el crecimiento estimado. El acumulado empieza negativo por la inversión inicial y sube hasta cruzar cero en el mes de recuperación." />
        </div>
        {/* Selector de horizonte */}
        <div className="flex gap-1.5 mb-3">
          {([3, 6, 12] as const).map(h => (
            <button key={h} onClick={() => setHorizonte(h)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={horizonte === h
                ? { background: '#000', color: '#fff', border: '1px solid #27272a' }
                : { background: 'var(--color-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
              {h}m
            </button>
          ))}
          {horizonte !== 6 && !mesRecuperacion && (
            <span className="ml-2 text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>
              Prueba con 12m para ver si se recupera la inversión
            </span>
          )}
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

        </div>
      </motion.div>

    </div>
  )
}
