'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useOnboardingStore, type BusinessStatus } from '@/store/onboardingStore'
import { useRouter } from 'next/navigation'
import SquareField from '@/components/ui/SquareField'
import dynamic from 'next/dynamic'
import {
  Flag, Store, Rocket, Lightbulb, Tag, PenLine, Wallet,
  BarChart2, Target, CalendarDays, Map, ShoppingCart,
  MessageSquare, MapPin, TrendingUp, User,
} from 'lucide-react'

const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  { ssr: false, loading: () => <div className="rounded-2xl border" style={{ height: 300, borderColor: 'var(--color-border)', background: 'var(--color-card)' }} /> }
)

// ─── Paleta de temas ──────────────────────────────────────────────────────────
type Theme = 'blue' | 'purple' | 'yellow' | 'green' | 'red'

const THEME: Record<Theme, {
  bg: string; border: string; badge: string; badgeText: string; ring: string; label: string
}> = {
  blue:   { bg: '', border: '',   badge: '',   badgeText: '',   ring: 'focus:ring-gray-400',   label: 'Contexto' },
  purple: { bg: '', border: '',   badge: '',   badgeText: '',   ring: 'focus:ring-gray-400',   label: 'Categoría' },
  yellow: { bg: '', border: '',   badge: '',   badgeText: '',   ring: 'focus:ring-gray-400',   label: 'Finanzas' },
  green:  { bg: '', border: '',   badge: '',   badgeText: '',   ring: 'focus:ring-gray-400',   label: 'Planificación' },
  red:    { bg: '', border: '',   badge: '',   badgeText: '',   ring: 'focus:ring-gray-400',   label: 'Riesgos' },
}

// ─── Variantes de animación (slide) ──────────────────────────────────────────
const variants = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
}
const spring = { type: 'spring' as const, stiffness: 280, damping: 28 }

// ─── Helpers de estilos por tema ──────────────────────────────────────────────
function inputCls(_theme: Theme) {
  return `w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-300 field-input placeholder:text-[color:var(--color-text-muted)]`
}
function optionBtn(_theme: Theme, selected: boolean) {
  return `flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 text-sm font-medium transition-colors
    ${selected
      ? 'border-gray-900 bg-gray-50 text-gray-900'
      : 'border-[color:var(--color-border)] bg-white text-[color:var(--color-text-secondary)] hover:border-gray-400'}`
}
function chipBtn(_theme: Theme, selected: boolean) {
  return `py-2.5 px-3 rounded-xl border text-sm font-medium transition text-left
    ${selected
      ? 'border-gray-900 bg-gray-50 text-gray-900'
      : 'border-[color:var(--color-border)] bg-white text-[color:var(--color-text-secondary)] hover:border-gray-400'}`
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
interface NavProps { onBack?: () => void; onNext: () => void; canNext: boolean; isLast?: boolean }
function Nav({ onBack, onNext, canNext, isLast }: NavProps) {
  const enabled = isLast ? true : canNext
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition"
          style={{ border: '1px solid #e5e7eb', color: '#6b7280', background: '#fff' }}>
          ← Atrás
        </button>
      )}
      <button onClick={onNext} disabled={!enabled}
        className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
        style={enabled
          ? { background: '#0f0f10', color: '#fff' }
          : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
        }>
        {isLast ? 'Ver resultados →' : 'Continuar →'}
      </button>
    </div>
  )
}

// ─── Wrappers de label y hint ─────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl leading-snug tracking-tight"
      style={{
        fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
        fontWeight: 700,
        fontStyle: 'italic',
        color: '#0f0f10',
      }}
    >
      {children}
    </h2>
  )
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>{children}</p>
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>{children}</p>
}

// ─── MoneyInput — campo dinero con prefijo $ verde y formato con comas ────────
function MoneyInput({ theme, placeholder, value, onChange }: {
  theme: Theme; placeholder?: string; value: string; onChange: (raw: string) => void
}) {
  const fmt = (raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ''), 10)
    if (isNaN(n)) return ''
    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(n)
  }
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-sm font-semibold select-none" style={{ color: '#10b981' }}>$</span>
      <input
        className={inputCls(theme)}
        style={{ paddingLeft: '1.75rem' }}
        placeholder={placeholder}
        value={fmt(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          onChange(raw)
        }}
        inputMode="numeric"
      />
    </div>
  )
}

// ─── Wrapper de carta con tema ────────────────────────────────────────────────
function StepCard({ theme: _theme, icon, badgeLabel, children }: {
  theme: Theme; icon: React.ReactNode; badgeLabel: string; children: React.ReactNode
}) {
  return (
    <div className="w-full rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="px-6 pt-7 pb-2">
        <div className="flex items-center justify-between mb-5">
          <span className="flex items-center" style={{ color: '#6b7280' }}>{icon}</span>
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>
            {badgeLabel}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── PASOS ────────────────────────────────────────────────────────────────────

// Paso 0 — Etapa del negocio [blue / Contexto]
function Step0({ onNext }: { onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const options: { icon: React.ReactNode; label: string; hint: string; value: BusinessStatus }[] = [
    { icon: <Store size={24} strokeWidth={1.75} />, label: 'Ya existe',   hint: 'Está abierto y operando',     value: 'existente' },
    { icon: <Rocket size={24} strokeWidth={1.75} />, label: 'Voy a abrir', hint: 'Pronto, tengo plan concreto', value: 'nuevo' },
    { icon: <Lightbulb size={24} strokeWidth={1.75} />, label: 'Es una idea', hint: 'Explorando posibilidades', value: 'hipotetico' },
  ]
  return (
    <StepCard theme="blue" icon={<Flag size={28} strokeWidth={1.75} />} badgeLabel="Contexto">
      <Label>¿En qué etapa está tu negocio?</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 mb-2">
        {options.map((o) => (
          <motion.button key={String(o.value)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setField('businessStatus', o.value)}
            className={optionBtn('blue', data.businessStatus === o.value)}>
            <span className="flex items-center justify-center">{o.icon}</span>
            <span className="font-semibold">{o.label}</span>
            <span className="text-xs text-gray-500 text-center">{o.hint}</span>
          </motion.button>
        ))}
      </div>
      <Nav onNext={onNext} canNext={!!data.businessStatus} />
    </StepCard>
  )
}

// Paso 1 — Tipo de negocio [purple / Categoría]
function Step1({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const types = [
    'Cafetería / Restaurante', 'Barbería / Salón', 'Tienda de conveniencia',
    'Ropa / Moda', 'Tecnología / Software', 'Salud / Bienestar',
    'Educación', 'Servicios profesionales', 'Otro',
  ]
  const otroSelected = data.businessType !== undefined &&
    !types.slice(0, -1).includes(data.businessType)
  const displaySelected = otroSelected ? 'Otro' : data.businessType

  function handleSelect(t: string) {
    if (t !== 'Otro') {
      setField('businessType', t)
    } else {
      // Mark as "otro" selection but keep any previous custom text
      if (!otroSelected) setField('businessType', '')
    }
  }

  return (
    <StepCard theme="purple" icon={<Tag size={28} strokeWidth={1.75} />} badgeLabel="Categoría">
      <Label>¿Qué tipo de negocio es?</Label>
      <Hint>Elige la categoría que mejor lo describe.</Hint>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
        {types.map((t) => (
          <button key={t} onClick={() => handleSelect(t)}
            className={chipBtn('purple', displaySelected === t)}>
            {t}
          </button>
        ))}
      </div>
      {otroSelected && (
        <div className="mt-3">
          <FieldLabel>Describe tu tipo de negocio</FieldLabel>
          <input
            className={inputCls('purple')}
            placeholder="ej. Lavandería, Floristería, Papelería…"
            value={data.businessType ?? ''}
            autoFocus
            onChange={(e) => setField('businessType', e.target.value)}
          />
        </div>
      )}
      <div className="mb-2 mt-4">
        <Nav onBack={onBack} onNext={onNext} canNext={!!data.businessType} />
      </div>
    </StepCard>
  )
}

// Paso 2 — Nombre y descripción [blue / Identidad]
function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  return (
    <StepCard theme="blue" icon={<PenLine size={28} strokeWidth={1.75} />} badgeLabel="Identidad">
      <Label>Cuéntanos sobre tu negocio</Label>
      <Hint>Solo lo básico por ahora.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div>
          <FieldLabel>Nombre del negocio</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Café El Buen Gusto"
            value={data.businessName ?? ''}
            onChange={(e) => setField('businessName', e.target.value)} />
        </div>
        <div>
          <FieldLabel>¿Qué ofrece? (una oración)</FieldLabel>
          <textarea rows={3} className={inputCls('blue') + ' resize-none'}
            placeholder="ej. Café de especialidad y postres artesanales para trabajadores de oficina"
            value={data.businessDescription ?? ''}
            onChange={(e) => setField('businessDescription', e.target.value)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.businessName && data.businessDescription)} />
    </StepCard>
  )
}

// ─── Tipo de producto extra ────────────────────────────────────────────────────
interface ProductEntry { name: string; price: string; cost: string; unit: string }
const PRESET_UNITS = ['pieza', 'kg', 'litro', 'hora', 'servicio', 'paquete', 'otro']

// Paso 2.5 — Finanzas base [yellow / Finanzas] — para todos
function ProductBlock({
  num,
  entry,
  onChange,
  onRemove,
}: {
  num: number
  entry: ProductEntry
  onChange: (field: keyof ProductEntry, val: string) => void
  onRemove?: () => void
}) {
  // otroMode tracks whether the user clicked "otro" — separate from the unit value
  const isCustomUnit = entry.unit !== '' && !PRESET_UNITS.slice(0, -1).includes(entry.unit)
  const [otroMode, setOtroMode] = useState(isCustomUnit)
  const chipHighlight = otroMode ? 'otro' : entry.unit

  function handleUnitChip(u: string) {
    if (u === 'otro') {
      setOtroMode(true)
      // Keep previous custom text if any; don't clear a valid preset value
      if (PRESET_UNITS.slice(0, -1).includes(entry.unit)) onChange('unit', '')
    } else {
      setOtroMode(false)
      onChange('unit', u)
    }
  }

  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#374151' }}>Producto {num}</p>
          {num === 1 && (
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>(requerido)</span>
          )}
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove}
            className="text-xs font-medium px-2 py-1 rounded-lg transition"
            style={{ color: '#ef4444', background: '#fee2e2' }}
            title="Eliminar producto">
            ✕
          </button>
        )}
      </div>
      <div>
        <FieldLabel>Nombre del producto / servicio</FieldLabel>
        <input className={inputCls('yellow')} placeholder="ej. Café americano"
          value={entry.name}
          onChange={(e) => onChange('name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Precio de venta ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 50" value={entry.price}
            onChange={(raw) => onChange('price', raw)} />
        </div>
        <div>
          <FieldLabel>Costo por unidad ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 14" value={entry.cost}
            onChange={(raw) => onChange('cost', raw)} />
        </div>
      </div>
      <div>
        <FieldLabel>Unidad de medida</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRESET_UNITS.map((u) => (
            <button key={u} type="button"
              onClick={() => handleUnitChip(u)}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
              style={chipHighlight === u
                ? { borderColor: '#f59e0b', background: '#fef3c7', color: '#92400e' }
                : { borderColor: 'var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text-secondary)' }
              }>
              {u}
            </button>
          ))}
        </div>
        {otroMode && (
          <input
            className={inputCls('yellow') + ' mt-2'}
            placeholder="ej. bandeja, caja, lote…"
            value={entry.unit}
            autoFocus
            onChange={(e) => onChange('unit', e.target.value)}
          />
        )}
      </div>
    </div>
  )
}

function Step25({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()

  // Build a unified products array from store fields
  function readProducts(): ProductEntry[] {
    const extra: ProductEntry[] = (() => {
      try { return JSON.parse(data.extraProducts ?? '[]') } catch { return [] }
    })()
    const p1: ProductEntry = { name: data.product1Name ?? '', price: data.product1Price ?? '', cost: data.product1Cost ?? '', unit: data.product1Unit ?? '' }
    const p2: ProductEntry = { name: data.product2Name ?? '', price: data.product2Price ?? '', cost: data.product2Cost ?? '', unit: data.product2Unit ?? '' }
    // Show p2 only if it has data or extra has items
    const base = extra.length > 0 || p2.name ? [p1, p2, ...extra] : [p1]
    return base
  }

  const [products, setProducts] = useState<ProductEntry[]>(readProducts)

  function persistProducts(next: ProductEntry[]) {
    setProducts(next)
    // slot 1 → product1*, slot 2 → product2*, rest → extraProducts
    const [p1, p2, ...extra] = [...next, { name: '', price: '', cost: '', unit: '' }, { name: '', price: '', cost: '', unit: '' }]
    setField('product1Name', p1.name); setField('product1Price', p1.price)
    setField('product1Cost', p1.cost); setField('product1Unit', p1.unit)
    setField('product2Name', p2.name); setField('product2Price', p2.price)
    setField('product2Cost', p2.cost); setField('product2Unit', p2.unit)
    setField('extraProducts', JSON.stringify(extra))
  }

  function updateProduct(idx: number, field: keyof ProductEntry, val: string) {
    const next = products.map((p, i) => i === idx ? { ...p, [field]: val } : p)
    persistProducts(next)
  }

  function addProduct() {
    persistProducts([...products, { name: '', price: '', cost: '', unit: '' }])
  }

  function removeProduct(idx: number) {
    persistProducts(products.filter((_, i) => i !== idx))
  }

  const p1 = products[0] ?? { name: '', price: '', cost: '', unit: '' }
  const canNext = !!(p1.name && p1.price && p1.cost && p1.unit && data.monthlyFixedCosts)

  return (
    <StepCard theme="yellow" icon={<Wallet size={28} strokeWidth={1.75} />} badgeLabel="Finanzas">
      <div className="flex items-center justify-between">
        <Label>Números clave de tu negocio</Label>
        <button
          type="button"
          onClick={addProduct}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b60' }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Agregar producto
        </button>
      </div>
      <Hint>El primer producto es requerido; los demás son opcionales.</Hint>
      <div className="flex flex-col gap-4 mt-4 mb-2">
        {products.map((p, idx) => (
          <ProductBlock
            key={idx}
            num={idx + 1}
            entry={p}
            onChange={(f, v) => updateProduct(idx, f, v)}
            onRemove={idx > 0 ? () => removeProduct(idx) : undefined}
          />
        ))}
        <div>
          <FieldLabel>Gastos fijos mensuales estimados ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 25,000" value={data.monthlyFixedCosts ?? ''}
            onChange={(raw) => setField('monthlyFixedCosts', raw)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={canNext} />
    </StepCard>
  )
}

// ── Pasos EXISTENTE ───────────────────────────────────────────────────────────

function StepExistente1({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  return (
    <StepCard theme="yellow" icon={<BarChart2 size={28} strokeWidth={1.75} />} badgeLabel="Finanzas">
      <Label>Números actuales de tu negocio</Label>
      <Hint>Aproximados están bien.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Meses abierto</FieldLabel>
            <input type="number" className={inputCls('yellow')} placeholder="ej. 18"
              value={data.monthsOperating ?? ''}
              onChange={(e) => setField('monthsOperating', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Empleados</FieldLabel>
            <input type="number" className={inputCls('yellow')} placeholder="ej. 3"
              value={data.employeeCount ?? ''}
              onChange={(e) => setField('employeeCount', e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel>Ingresos mensuales ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 45,000" value={data.currentMonthlyRevenue ?? ''}
            onChange={(raw) => setField('currentMonthlyRevenue', raw)} />
        </div>
        <div>
          <FieldLabel>Gastos fijos mensuales ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 28,000" value={data.currentMonthlyExpenses ?? ''}
            onChange={(raw) => setField('currentMonthlyExpenses', raw)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.currentMonthlyRevenue} />
    </StepCard>
  )
}

function StepExistente2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const challenges = ['Atraer más clientes', 'Reducir costos', 'Competencia muy fuerte',
    'Falta de flujo de caja', 'Problemas con proveedores', 'Otro']
  return (
    <StepCard theme="red" icon={<Target size={28} strokeWidth={1.75} />} badgeLabel="Riesgos">
      <Label>¿Cuál es tu mayor reto ahora mismo?</Label>
      <div className="grid grid-cols-2 gap-2 mt-5 mb-2">
        {challenges.map((c) => (
          <button key={c} onClick={() => setField('mainChallenge', c)}
            className={chipBtn('red', data.mainChallenge === c)}>
            {c}
          </button>
        ))}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.mainChallenge} />
    </StepCard>
  )
}

// ── Pasos NUEVO ───────────────────────────────────────────────────────────────

function StepNuevo1({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  return (
    <StepCard theme="green" icon={<CalendarDays size={28} strokeWidth={1.75} />} badgeLabel="Planificación">
      <Label>Datos de apertura</Label>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div>
          <FieldLabel>¿Cuándo planeas abrir?</FieldLabel>
          <input type="month" className={inputCls('green')}
            value={data.plannedOpeningDate ?? ''}
            onChange={(e) => setField('plannedOpeningDate', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Inversión inicial disponible ($)</FieldLabel>
          <MoneyInput theme="green" placeholder="ej. 80,000" value={data.initialInvestment ?? ''}
            onChange={(raw) => setField('initialInvestment', raw)} />
        </div>
        <div>
          <FieldLabel>¿Ya tienes local?</FieldLabel>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[{ label: 'Sí, ya tengo', val: true }, { label: 'Todavía no', val: false }].map(({ label, val }) => (
              <button key={String(val)} onClick={() => setField('hasLocation', val)}
                className={chipBtn('green', data.hasLocation === val)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext}
        canNext={!!(data.initialInvestment && data.hasLocation !== null && data.hasLocation !== undefined)} />
    </StepCard>
  )
}

// ── Pasos HIPOTÉTICO ──────────────────────────────────────────────────────────

function StepHipotetico1({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  return (
    <StepCard theme="blue" icon={<Map size={28} strokeWidth={1.75} />} badgeLabel="Mercado">
      <Label>¿Dónde y para quién?</Label>
      <Hint>No tiene que ser exacto — estamos explorando.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div>
          <FieldLabel>Ciudad donde abrirías</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Tijuana, B.C."
            value={data.targetCity ?? ''}
            onChange={(e) => setField('targetCity', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Zona o colonia (opcional)</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Zona Río, Laurel 1"
            value={data.targetZone ?? ''}
            onChange={(e) => setField('targetZone', e.target.value)} />
        </div>
        <div>
          <FieldLabel>¿A quién le venderías?</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Jóvenes universitarios de 18–25 años"
            value={data.targetCustomer ?? ''}
            onChange={(e) => setField('targetCustomer', e.target.value)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.targetCity && data.targetCustomer)} />
    </StepCard>
  )
}

function StepHipotetico2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const channels = ['Local físico', 'En línea / e-commerce', 'A domicilio / delivery', 'Marketplace', 'Mixto']
  return (
    <StepCard theme="green" icon={<ShoppingCart size={28} strokeWidth={1.75} />} badgeLabel="Modelo">
      <Label>Modelo y presupuesto</Label>
      <div className="flex flex-col gap-5 mt-5 mb-2">
        <div>
          <FieldLabel>¿Cómo venderías?</FieldLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channels.map((c) => (
              <button key={c} onClick={() => setField('salesChannel', c)}
                className={chipBtn('green', data.salesChannel === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Presupuesto estimado ($)</FieldLabel>
          <MoneyInput theme="green" placeholder="ej. 50,000" value={data.estimatedBudget ?? ''}
            onChange={(raw) => setField('estimatedBudget', raw)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.salesChannel && data.estimatedBudget)} />
    </StepCard>
  )
}

function StepHipotetico3({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  return (
    <StepCard theme="purple" icon={<MessageSquare size={28} strokeWidth={1.75} />} badgeLabel="Propuesta">
      <Label>¿Qué problema resuelve tu idea?</Label>
      <Hint>Esta respuesta ayuda a analizar el potencial de tu negocio.</Hint>
      <div className="mt-5 mb-2">
        <textarea rows={4} className={inputCls('purple') + ' resize-none'}
          placeholder="ej. En mi colonia no hay cafeterías de calidad cerca de las oficinas..."
          value={data.problemSolved ?? ''}
          onChange={(e) => setField('problemSolved', e.target.value)} />
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.problemSolved} isLast />
    </StepCard>
  )
}

// ─── Pasos adicionales ────────────────────────────────────────────────────────

// Ubicación — compartido por los tres flujos [blue / Ubicación]
function StepUbicacion({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const [tab, setTab] = useState<'texto' | 'mapa'>('texto')

  function handleMapPick(lat: number, lng: number, displayName?: string) {
    setField('locationLat', lat)
    setField('locationLng', lng)
    // Auto-fill city from display name if not already set
    if (displayName && !data.locationCity) {
      const parts = displayName.split(',')
      if (parts.length >= 2) {
        setField('locationCity', parts[parts.length - 3]?.trim() ?? parts[0].trim())
      }
    }
  }

  return (
    <StepCard theme="blue" icon={<MapPin size={28} strokeWidth={1.75} />} badgeLabel="Ubicación">
      <Label>¿Dónde está (o estará) tu negocio?</Label>
      <Hint>Completa la ciudad o fija la ubicación en el mapa.</Hint>

      {/* Tabs */}
      <div className="flex gap-1 mt-4 mb-3 rounded-xl p-1" style={{ background: 'var(--color-surface, #f3f4f6)' }}>
        {(['texto', 'mapa'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === t ? '#ffffff' : 'transparent',
              color: tab === t ? '#2563eb' : 'var(--color-text-secondary)',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t === 'texto' ? '📝  Dirección' : '🗺️  Mapa'}
          </button>
        ))}
      </div>

      {tab === 'texto' && (
        <div className="flex flex-col gap-4 mb-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>País</FieldLabel>
              <input className={inputCls('blue')} placeholder="ej. México"
                value={data.locationCountry ?? ''}
                onChange={(e) => setField('locationCountry', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Estado</FieldLabel>
              <input className={inputCls('blue')} placeholder="ej. Baja California"
                value={data.locationState ?? ''}
                onChange={(e) => setField('locationState', e.target.value)} />
            </div>
          </div>
          <div>
            <FieldLabel>Ciudad</FieldLabel>
            <input className={inputCls('blue')} placeholder="ej. Tijuana"
              value={data.locationCity ?? ''}
              onChange={(e) => setField('locationCity', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Fraccionamiento / Zona / Colonia</FieldLabel>
            <input className={inputCls('blue')} placeholder="ej. Colonia Laurel 1, Zona Río"
              value={data.locationNeighborhood ?? ''}
              onChange={(e) => setField('locationNeighborhood', e.target.value)} />
          </div>
        </div>
      )}

      {tab === 'mapa' && (
        <div className="mb-2">
          <LocationPickerMap
            lat={data.locationLat}
            lng={data.locationLng}
            onPick={handleMapPick}
          />
          {data.locationLat != null && (
            <p className="mt-2 text-xs font-medium" style={{ color: '#2563eb' }}>
              ✓ Ubicación fijada: {data.locationLat.toFixed(5)}, {data.locationLng?.toFixed(5)}
            </p>
          )}
        </div>
      )}

      <Nav onBack={onBack} onNext={onNext}
        canNext={!!data.locationCity || data.locationLat != null} />
    </StepCard>
  )
}

// Estado de resultados inline — solo flujo existente [yellow / Análisis]
function StepEstadoResultadosInline({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const ingresos = parseFloat(data.currentMonthlyRevenue ?? '0') || 0
  const gastosFijos = parseFloat(data.currentMonthlyExpenses ?? '0') || 0
  const pct = parseFloat(data.costVariablePct ?? '40') || 0
  const costosVar = ingresos * (pct / 100)
  const margenContribucion = ingresos - costosVar
  const utilidadOp = margenContribucion - gastosFijos
  const margenPct = ingresos > 0 ? (utilidadOp / ingresos) * 100 : 0
  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(n)
  const positiveColor = '#10b981'
  const negativeColor = '#ef4444'
  return (
    <StepCard theme="yellow" icon={<BarChart2 size={28} strokeWidth={1.75} />} badgeLabel="Análisis">
      <Label>Estado de resultados estimado</Label>
      <Hint>Ajusta el % de costos variables para ver tu margen real.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        {/* Ingresos — read-only */}
        <div className="flex justify-between items-center py-2 px-3 rounded-xl" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Ingresos mensuales</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>${fmt(ingresos)}</span>
        </div>
        {/* Costos variables slider */}
        <div>
          <div className="flex justify-between mb-1">
            <FieldLabel>Costos variables</FieldLabel>
            <span className="text-xs font-semibold" style={{ color: '#d97706' }}>{pct}% = ${fmt(costosVar)}</span>
          </div>
          <input type="range" min={0} max={80} step={1}
            value={pct}
            onChange={(e) => setField('costVariablePct', e.target.value)}
            className="w-full accent-amber-500" />
        </div>
        {/* Gastos fijos — read-only */}
        <div className="flex justify-between items-center py-2 px-3 rounded-xl" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Gastos fijos mensuales</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>${fmt(gastosFijos)}</span>
        </div>
        {/* Computed results */}
        <div className="rounded-xl flex flex-col gap-2 py-3 px-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>Margen de contribución</span>
            <span style={{ color: margenContribucion >= 0 ? positiveColor : negativeColor, fontWeight: 600 }}>${fmt(margenContribucion)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>Utilidad operativa</span>
            <span style={{ color: utilidadOp >= 0 ? positiveColor : negativeColor, fontWeight: 700 }}>${fmt(utilidadOp)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>Margen %</span>
            <span style={{ color: margenPct >= 0 ? positiveColor : negativeColor, fontWeight: 600 }}>{margenPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext />
    </StepCard>
  )
}

// Proyección — solo flujo nuevo [green / Proyección]
function StepProyeccionNuevo({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const ingresos = parseFloat(data.ventasEstimadasMes ?? '0') || 0
  const p1Price = parseFloat(data.product1Price ?? '0') || 0
  const p1Cost = parseFloat(data.product1Cost ?? '0') || 0
  const costRatio = p1Price > 0 ? p1Cost / p1Price : 0.4
  const costosVar = ingresos * costRatio
  const inversion = parseFloat(data.initialInvestment ?? '0') || 0
  const gastosFijos = inversion / 12
  const utilidadOp = ingresos - costosVar - gastosFijos
  const mesCupRaw = utilidadOp > 0 ? Math.ceil(inversion / utilidadOp) : null
  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(n)
  const positiveColor = '#10b981'
  const negativeColor = '#ef4444'
  return (
    <StepCard theme="green" icon={<TrendingUp size={28} strokeWidth={1.75} />} badgeLabel="Proyección">
      <Label>Proyección de primer año</Label>
      <Hint>Estima tus ventas para ver si el negocio es viable.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div>
          <FieldLabel>Ventas estimadas por mes ($)</FieldLabel>
          <MoneyInput theme="green" placeholder="ej. 60,000" value={data.ventasEstimadasMes ?? ''}
            onChange={(raw) => setField('ventasEstimadasMes', raw)} />
        </div>
        <div>
          <FieldLabel>Ticket promedio por venta ($)</FieldLabel>
          <MoneyInput theme="green" placeholder="ej. 250" value={data.ticketPromedio ?? ''}
            onChange={(raw) => setField('ticketPromedio', raw)} />
        </div>
        {ingresos > 0 && (
          <div className="rounded-xl flex flex-col gap-2 py-3 px-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Ingresos proyectados / mes</span>
              <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>${fmt(ingresos)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Costos variables ({(costRatio * 100).toFixed(0)}%)</span>
              <span style={{ color: negativeColor, fontWeight: 600 }}>−${fmt(costosVar)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Inversión amortizada / mes</span>
              <span style={{ color: negativeColor, fontWeight: 600 }}>−${fmt(gastosFijos)}</span>
            </div>
            <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Utilidad operativa / mes</span>
              <span style={{ color: utilidadOp >= 0 ? positiveColor : negativeColor, fontWeight: 700 }}>${fmt(utilidadOp)}</span>
            </div>
            {mesCupRaw !== null && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Mes de recuperación (est.)</span>
                <span style={{ color: positiveColor, fontWeight: 600 }}>Mes {mesCupRaw}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.ventasEstimadasMes} />
    </StepCard>
  )
}

// Perfil de cliente — flujos existente y nuevo [purple / Cliente]
function StepPerfilCliente({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const channels = ['Local físico', 'En línea / e-commerce', 'A domicilio / delivery', 'Marketplace', 'Mixto']
  return (
    <StepCard theme="purple" icon={<User size={28} strokeWidth={1.75} />} badgeLabel="Cliente">
      <Label>¿Quién es tu cliente ideal?</Label>
      <Hint>Describe a tu cliente y cómo le venderás.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div>
          <FieldLabel>¿A quién le vendes?</FieldLabel>
          <input className={inputCls('purple')} placeholder="ej. Jóvenes universitarios de 18–25 años"
            value={data.targetCustomer ?? ''}
            onChange={(e) => setField('targetCustomer', e.target.value)} />
        </div>
        <div>
          <FieldLabel>¿Cómo vendes?</FieldLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channels.map((c) => (
              <button key={c} onClick={() => setField('salesChannel', c)}
                className={chipBtn('purple', data.salesChannel === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.targetCustomer} isLast />
    </StepCard>
  )
}

// ─── Construcción dinámica de pasos ──────────────────────────────────────────
// Orden: [0] etapa, [1] tipo, [2] nombre, [3] finanzas base, [4] ubicación, [5+] específicos
type StepComponent = React.ComponentType<{ onBack: () => void; onNext: () => void }>

function buildSteps(status: BusinessStatus): StepComponent[] {
  const common: StepComponent[] = [Step0, Step1, Step2, Step25, StepUbicacion]
  if (status === 'existente')  return [...common, StepExistente1, StepEstadoResultadosInline, StepExistente2, StepPerfilCliente]
  if (status === 'nuevo')      return [...common, StepNuevo1, StepProyeccionNuevo, StepPerfilCliente]
  if (status === 'hipotetico') return [...common, StepHipotetico1, StepHipotetico2, StepHipotetico3]
  return common
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

/** All focusable inputs/textareas/selects inside a container, in DOM order */
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('input, textarea, select')
  ).filter(el => !(el as HTMLInputElement).disabled && el.tabIndex !== -1)
}

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, direction, setStep, data } = useOnboardingStore()
  const steps = buildSteps(data.businessStatus ?? null)
  const total = steps.length
  const mainRef = useRef<HTMLElement>(null)

  function goNext() {
    if (currentStep === total - 1) { router.push('/analisis'); return }
    setStep(currentStep + 1, 1)
  }
  function goBack() {
    if (currentStep === 0) { router.push('/'); return }
    setStep(currentStep - 1, -1)
  }

  // Enter: focus next input, or advance card when on the last one
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      // Allow newlines in textareas
      if ((document.activeElement as HTMLElement)?.tagName === 'TEXTAREA') return
      // Let buttons handle their own Enter natively
      if ((document.activeElement as HTMLElement)?.tagName === 'BUTTON') return

      const container = mainRef.current
      if (!container) return
      const focusable = getFocusable(container)
      const idx = focusable.indexOf(document.activeElement as HTMLElement)

      if (idx !== -1 && idx < focusable.length - 1) {
        e.preventDefault()
        focusable[idx + 1].focus()
      } else {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, total])

  const StepComponent = steps[currentStep]

  return (
    <main ref={mainRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden" style={{ background: '#fafafa', color: 'var(--color-text)' }}>
      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--color-border, #e5e7eb) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, #e5e7eb) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />
      <SquareField />

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: total }, (_, i) => (
          <div key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentStep ? '1.5rem' : '0.375rem',
              background: i === currentStep ? '#3b82f6' : i < currentStep ? '#93c5fd' : 'var(--color-border-strong)'
            }} />
        ))}
      </div>

      {/* Slide window */}
      <div className="w-full max-w-2xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
          >
            <StepComponent onBack={goBack} onNext={goNext} />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
