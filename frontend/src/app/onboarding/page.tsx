'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Flag, Tag, PenLine, MapPin, Clock, Wallet, TrendingUp, User,
  Store, Rocket, Lightbulb,
} from 'lucide-react'
import { useOnboardingStore, type BusinessStatus } from '@/store/onboardingStore'

const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  { ssr: false, loading: () => <div className="rounded-2xl border" style={{ height: 300, borderColor: 'var(--color-border)', background: 'var(--color-card)' }} /> }
)

// ─── Themes ───────────────────────────────────────────────────────────────────
type Theme = 'blue' | 'purple' | 'yellow' | 'green' | 'red'

const THEME: Record<Theme, { accent: string; ring: string; bg: string; chip: string; chipSel: string }> = {
  blue:   { accent: '#2563eb', ring: '#2563eb40', bg: '#eff6ff', chip: '#dbeafe', chipSel: '#1d4ed8' },
  purple: { accent: '#7c3aed', ring: '#7c3aed40', bg: '#f5f3ff', chip: '#ede9fe', chipSel: '#5b21b6' },
  yellow: { accent: '#d97706', ring: '#d9770640', bg: '#fffbeb', chip: '#fef3c7', chipSel: '#92400e' },
  green:  { accent: '#16a34a', ring: '#16a34a40', bg: '#f0fdf4', chip: '#dcfce7', chipSel: '#166534' },
  red:    { accent: '#dc2626', ring: '#dc262640', bg: '#fef2f2', chip: '#fee2e2', chipSel: '#991b1b' },
}

// ─── Animations ───────────────────────────────────────────────────────────────
const variants = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
}
const spring = { type: 'spring' as const, stiffness: 280, damping: 28 }

// ─── Reusable style helpers ───────────────────────────────────────────────────
function inputCls(theme: Theme) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2`
    + ` bg-white border-gray-200 focus:border-[${THEME[theme].accent}] focus:ring-[${THEME[theme].ring}]`
}

function chipBtn(theme: Theme, selected: boolean) {
  const t = THEME[theme]
  return `px-3 py-2 rounded-xl border text-sm font-medium transition cursor-pointer`
    + (selected
      ? ` border-[${t.accent}] bg-[${t.chip}] text-[${t.chipSel}]`
      : ` border-gray-200 bg-white text-gray-600 hover:border-gray-300`)
}

function optionBtn(theme: Theme, selected: boolean) {
  const t = THEME[theme]
  return `flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition cursor-pointer`
    + (selected
      ? ` border-[${t.accent}] bg-[${t.bg}] text-[${t.chipSel}]`
      : ` border-gray-200 bg-white text-gray-600 hover:border-gray-300`)
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold leading-snug" style={{ color: 'var(--color-text)' }}>{children}</h2>
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm mt-1 mb-1" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold mb-1.5 mt-3" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
}

function MoneyInput({ theme, placeholder, value, onChange }: { theme: Theme; placeholder: string; value: string; onChange: (v: string) => void }) {
  const t = THEME[theme]
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: t.accent }}>$</span>
      <input
        type="text" inputMode="decimal"
        className="w-full rounded-xl border px-3 py-2.5 pl-7 text-sm outline-none transition focus:ring-2"
        style={{ borderColor: '#e5e7eb', background: '#fff', color: 'var(--color-text)' }}
        placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
      />
    </div>
  )
}

// ─── StepCard ─────────────────────────────────────────────────────────────────
function StepCard({ theme, icon, badgeLabel, children }: {
  theme: Theme; icon: React.ReactNode; badgeLabel: string; children: React.ReactNode
}) {
  const t = THEME[theme]
  return (
    <div className="rounded-3xl p-6" style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(229,231,235,0.7)',
      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
    }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: t.bg, color: t.accent }}>
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg"
          style={{ background: t.chip, color: t.chipSel }}>
          {badgeLabel}
        </span>
      </div>
      {children}
    </div>
  )
}

// ─── Nav bar (Back · Skip · Next) ─────────────────────────────────────────────
interface NavProps {
  onBack?: () => void
  onNext: () => void
  onSkip?: () => void
  canNext: boolean
  isLast?: boolean
}
function Nav({ onBack, onNext, onSkip, canNext, isLast }: NavProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack
        ? <button onClick={onBack} className="text-sm font-medium px-4 py-2 rounded-xl transition"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>← Atrás</button>
        : <div />
      }
      <div className="flex items-center gap-2">
        {onSkip && (
          <button onClick={onSkip} className="text-sm font-medium px-4 py-2 rounded-xl transition"
            style={{ color: 'var(--color-text-muted)' }}>
            Saltar
          </button>
        )}
        <motion.button
          onClick={onNext} disabled={!canNext}
          whileHover={canNext ? { scale: 1.03 } : {}} whileTap={canNext ? { scale: 0.97 } : {}}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          style={{
            background: canNext ? '#000' : '#e5e7eb',
            color: canNext ? '#fff' : '#9ca3af',
            cursor: canNext ? 'pointer' : 'not-allowed',
          }}
        >
          {isLast ? 'Finalizar →' : 'Continuar →'}
        </motion.button>
      </div>
    </div>
  )
}

// ─── PASO 0 — Contexto (etapa del negocio) ────────────────────────────────────
function Step0({ onNext }: { onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const options: { icon: React.ReactNode; label: string; hint: string; value: BusinessStatus }[] = [
    { icon: <Store size={24} strokeWidth={1.75} />,    label: 'Ya existe',    hint: 'Está abierto y operando',     value: 'existente'  },
    { icon: <Rocket size={24} strokeWidth={1.75} />,   label: 'Voy a abrir',  hint: 'Pronto, tengo plan concreto', value: 'nuevo'      },
    { icon: <Lightbulb size={24} strokeWidth={1.75} />, label: 'Es una idea', hint: 'Explorando posibilidades',    value: 'hipotetico' },
  ]
  return (
    <StepCard theme="blue" icon={<Flag size={22} strokeWidth={1.75} />} badgeLabel="Contexto">
      <Label>¿En qué etapa está tu negocio?</Label>
      <Hint>Esto adapta el tono de las preguntas, no cambia el análisis.</Hint>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 mb-2">
        {options.map((o) => (
          <motion.button key={String(o.value)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setField('businessStatus', o.value)}
            className={optionBtn('blue', data.businessStatus === o.value)}>
            <span>{o.icon}</span>
            <span className="font-semibold">{o.label}</span>
            <span className="text-xs text-gray-400 text-center">{o.hint}</span>
          </motion.button>
        ))}
      </div>
      <Nav onNext={onNext} canNext={!!data.businessStatus} />
    </StepCard>
  )
}

// ─── PASO 1 — Tipo de negocio ─────────────────────────────────────────────────
function Step1({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const types = [
    'Cafetería / Restaurante', 'Barbería / Salón', 'Tienda de conveniencia',
    'Ropa / Moda', 'Tecnología / Software', 'Salud / Bienestar',
    'Educación', 'Servicios profesionales', 'Otro',
  ]
  const otroSelected = !!data.businessType && !types.slice(0, -1).includes(data.businessType)
  const displaySelected = otroSelected ? 'Otro' : data.businessType

  function handleSelect(t: string) {
    if (t !== 'Otro') { setField('businessType', t) }
    else if (!otroSelected) { setField('businessType', '') }
  }

  return (
    <StepCard theme="purple" icon={<Tag size={22} strokeWidth={1.75} />} badgeLabel="Categoría">
      <Label>¿Qué tipo de negocio es?</Label>
      <Hint>Elige la categoría que mejor lo describe.</Hint>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
        {types.map((t) => (
          <button key={t} onClick={() => handleSelect(t)} className={chipBtn('purple', displaySelected === t)}>{t}</button>
        ))}
      </div>
      {otroSelected && (
        <div className="mt-3">
          <FieldLabel>Describe tu tipo de negocio</FieldLabel>
          <input className={inputCls('purple')} placeholder="ej. Lavandería, Floristería…"
            value={data.businessType ?? ''} autoFocus
            onChange={(e) => setField('businessType', e.target.value)} />
        </div>
      )}
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.businessType} />
    </StepCard>
  )
}

// ─── PASO 2 — Identidad ───────────────────────────────────────────────────────
function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const isHipo = data.businessStatus === 'hipotetico'
  return (
    <StepCard theme="blue" icon={<PenLine size={22} strokeWidth={1.75} />} badgeLabel="Identidad">
      <Label>Cuéntanos sobre tu negocio</Label>
      <Hint>Solo lo básico por ahora.</Hint>
      <div className="flex flex-col gap-1 mt-5 mb-2">
        <FieldLabel>{isHipo ? 'Nombre tentativo (puede cambiar)' : 'Nombre del negocio'}</FieldLabel>
        <input className={inputCls('blue')} placeholder="ej. Café El Buen Gusto"
          value={data.businessName ?? ''}
          onChange={(e) => setField('businessName', e.target.value)} />
        <FieldLabel>¿Qué {isHipo ? 'ofrecería' : 'ofrece'}? (una oración)</FieldLabel>
        <textarea rows={3} className={inputCls('blue') + ' resize-none'}
          placeholder="ej. Café de especialidad y postres artesanales para trabajadores de oficina"
          value={data.businessDescription ?? ''}
          onChange={(e) => setField('businessDescription', e.target.value)} />
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.businessName && data.businessDescription)} />
    </StepCard>
  )
}

// ─── PASO 3 — Ubicación ───────────────────────────────────────────────────────
function Step3({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const [tab, setTab] = useState<'texto' | 'mapa'>('texto')
  const isHipo = data.businessStatus === 'hipotetico'

  function handleMapPick(lat: number, lng: number, displayName?: string) {
    setField('locationLat', lat)
    setField('locationLng', lng)
    if (displayName && !data.locationCity) {
      const parts = displayName.split(',')
      if (parts.length >= 2) setField('locationCity', parts[parts.length - 3]?.trim() ?? parts[0].trim())
    }
  }

  return (
    <StepCard theme="blue" icon={<MapPin size={22} strokeWidth={1.75} />} badgeLabel="Ubicación">
      <Label>¿Dónde {isHipo ? 'estaría' : 'está'} tu negocio?</Label>
      <Hint>Completa la ciudad o fija la ubicación en el mapa.</Hint>

      {/* Tabs */}
      <div className="flex gap-1 mt-4 mb-3 rounded-xl p-1" style={{ background: '#f3f4f6' }}>
        {(['texto', 'mapa'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#2563eb' : 'var(--color-text-secondary)',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
            {t === 'texto' ? '📝  Dirección' : '🗺️  Mapa'}
          </button>
        ))}
      </div>

      {tab === 'texto' && (
        <div className="flex flex-col gap-1 mb-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>País</FieldLabel>
              <input className={inputCls('blue')} placeholder="ej. México"
                value={data.locationCountry ?? ''} onChange={(e) => setField('locationCountry', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Estado</FieldLabel>
              <input className={inputCls('blue')} placeholder="ej. Baja California"
                value={data.locationState ?? ''} onChange={(e) => setField('locationState', e.target.value)} />
            </div>
          </div>
          <FieldLabel>Ciudad</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Tijuana"
            value={data.locationCity ?? ''} onChange={(e) => setField('locationCity', e.target.value)} />
          <FieldLabel>Fraccionamiento / Zona / Colonia</FieldLabel>
          <input className={inputCls('blue')} placeholder="ej. Zona Río, Colonia Laurel"
            value={data.locationNeighborhood ?? ''} onChange={(e) => setField('locationNeighborhood', e.target.value)} />
        </div>
      )}

      {tab === 'mapa' && (
        <div className="mb-2">
          <LocationPickerMap lat={data.locationLat} lng={data.locationLng} onPick={handleMapPick} />
          {data.locationLat != null && (
            <p className="mt-2 text-xs font-medium" style={{ color: '#2563eb' }}>
              ✓ Ubicación fijada: {data.locationLat.toFixed(5)}, {data.locationLng?.toFixed(5)}
            </p>
          )}
        </div>
      )}

      <Nav onBack={onBack} onNext={onNext} canNext={!!data.locationCity || data.locationLat != null} />
    </StepCard>
  )
}

// ─── PASO 4 — Operación ───────────────────────────────────────────────────────
function Step4({ onBack, onNext, onSkip }: { onBack: () => void; onNext: () => void; onSkip: () => void }) {
  const { data, setField } = useOnboardingStore()
  const isHipo = data.businessStatus === 'hipotetico'
  const isExistente = data.businessStatus === 'existente'

  const hourChips = [
    'Matutino (6–14h)', 'Vespertino (14–22h)', 'Corrido (8–20h)', '24 horas', 'Personalizado',
  ]
  const channels = ['Local físico', 'En línea / e-commerce', 'A domicilio / delivery', 'Marketplace', 'Mixto']

  const [customHours, setCustomHours] = useState(
    data.operatingHours && !hourChips.slice(0, -1).includes(data.operatingHours) ? data.operatingHours : ''
  )
  const isCustom = data.operatingHours === 'Personalizado' ||
    (!!data.operatingHours && !hourChips.slice(0, -1).includes(data.operatingHours))

  function handleHourChip(chip: string) {
    if (chip === 'Personalizado') {
      setField('operatingHours', 'Personalizado')
    } else {
      setField('operatingHours', chip)
    }
  }

  return (
    <StepCard theme="green" icon={<Clock size={22} strokeWidth={1.75} />} badgeLabel="Operación">
      <Label>¿Cómo {isExistente ? 'opera' : 'operaría'} tu negocio?</Label>
      <Hint>Todos los campos son opcionales — puedes saltarte este paso.</Hint>

      {/* Horario */}
      <FieldLabel>¿En qué horario {isExistente ? 'está abierto' : 'piensas abrir'}?</FieldLabel>
      <div className="flex flex-wrap gap-2 mt-1">
        {hourChips.map((h) => (
          <button key={h} type="button"
            onClick={() => handleHourChip(h)}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
            style={data.operatingHours === h || (h === 'Personalizado' && isCustom && !hourChips.slice(0, -1).includes(data.operatingHours ?? ''))
              ? { borderColor: '#16a34a', background: '#dcfce7', color: '#166534' }
              : { borderColor: '#e5e7eb', background: '#fff', color: '#6b7280' }}>
            {h}
          </button>
        ))}
      </div>
      {isCustom && (
        <input className={inputCls('green') + ' mt-2'}
          placeholder="ej. Lunes a viernes 9am–6pm"
          value={customHours}
          autoFocus
          onChange={(e) => { setCustomHours(e.target.value); setField('operatingHours', e.target.value) }} />
      )}

      {/* Empleados */}
      <FieldLabel>¿Cuántas personas {isHipo ? 'trabajarían' : 'trabajan o trabajarán'} en el negocio (incluyéndote)?</FieldLabel>
      <input type="number" min={1} className={inputCls('green')} placeholder="ej. 3"
        value={data.employeeCount ?? ''}
        onChange={(e) => setField('employeeCount', e.target.value)} />

      {/* Canal de venta */}
      <FieldLabel>¿Cómo {isHipo ? 'venderías' : isExistente ? 'vendes' : 'venderás'}?</FieldLabel>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {channels.map((c) => (
          <button key={c} onClick={() => setField('salesChannel', c)}
            className={chipBtn('green', data.salesChannel === c)}>
            {c}
          </button>
        ))}
      </div>

      <Nav onBack={onBack} onNext={onNext} onSkip={onSkip} canNext={!!data.salesChannel} />
    </StepCard>
  )
}

// ─── PASO 5 — Productos & costos ──────────────────────────────────────────────
interface ProductEntry { name: string; price: string; cost: string; unit: string }
const PRESET_UNITS = ['pieza', 'kg', 'litro', 'hora', 'servicio', 'paquete', 'otro']

function ProductBlock({ num, entry, onChange, onRemove }: {
  num: number; entry: ProductEntry
  onChange: (field: keyof ProductEntry, val: string) => void
  onRemove?: () => void
}) {
  const isCustomUnit = entry.unit !== '' && !PRESET_UNITS.slice(0, -1).includes(entry.unit)
  const [otroMode, setOtroMode] = useState(isCustomUnit)
  const chipHighlight = otroMode ? 'otro' : entry.unit

  function handleUnitChip(u: string) {
    if (u === 'otro') { setOtroMode(true); if (PRESET_UNITS.slice(0, -1).includes(entry.unit)) onChange('unit', '') }
    else { setOtroMode(false); onChange('unit', u) }
  }

  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#374151' }}>Producto {num}</p>
          {num === 1 && <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>(requerido)</span>}
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove}
            className="text-xs font-medium px-2 py-1 rounded-lg transition"
            style={{ color: '#ef4444', background: '#fee2e2' }}>✕</button>
        )}
      </div>
      <div>
        <FieldLabel>Nombre del producto / servicio</FieldLabel>
        <input className={inputCls('yellow')} placeholder="ej. Café americano"
          value={entry.name} onChange={(e) => onChange('name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Precio de venta ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 50" value={entry.price} onChange={(v) => onChange('price', v)} />
        </div>
        <div>
          <FieldLabel>Costo por unidad ($)</FieldLabel>
          <MoneyInput theme="yellow" placeholder="ej. 14" value={entry.cost} onChange={(v) => onChange('cost', v)} />
        </div>
      </div>
      <div>
        <FieldLabel>Unidad de medida</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRESET_UNITS.map((u) => (
            <button key={u} type="button" onClick={() => handleUnitChip(u)}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
              style={chipHighlight === u
                ? { borderColor: '#f59e0b', background: '#fef3c7', color: '#92400e' }
                : { borderColor: '#e5e7eb', background: '#fff', color: '#6b7280' }}>
              {u}
            </button>
          ))}
        </div>
        {otroMode && (
          <input className={inputCls('yellow') + ' mt-2'} placeholder="ej. bandeja, caja…"
            value={entry.unit} autoFocus onChange={(e) => onChange('unit', e.target.value)} />
        )}
      </div>
    </div>
  )
}

function Step5({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()

  function readProducts(): ProductEntry[] {
    const extra: ProductEntry[] = (() => { try { return JSON.parse(data.extraProducts ?? '[]') } catch { return [] } })()
    const p1: ProductEntry = { name: data.product1Name ?? '', price: data.product1Price ?? '', cost: data.product1Cost ?? '', unit: data.product1Unit ?? '' }
    const p2: ProductEntry = { name: data.product2Name ?? '', price: data.product2Price ?? '', cost: data.product2Cost ?? '', unit: data.product2Unit ?? '' }
    return extra.length > 0 || p2.name ? [p1, p2, ...extra] : [p1]
  }

  const [products, setProducts] = useState<ProductEntry[]>(readProducts)

  function persistProducts(next: ProductEntry[]) {
    setProducts(next)
    const [p1, p2, ...extra] = [...next, { name: '', price: '', cost: '', unit: '' }, { name: '', price: '', cost: '', unit: '' }]
    setField('product1Name', p1.name); setField('product1Price', p1.price); setField('product1Cost', p1.cost); setField('product1Unit', p1.unit)
    setField('product2Name', p2.name); setField('product2Price', p2.price); setField('product2Cost', p2.cost); setField('product2Unit', p2.unit)
    setField('extraProducts', JSON.stringify(extra))
  }

  function updateProduct(idx: number, field: keyof ProductEntry, val: string) {
    persistProducts(products.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }

  const p1 = products[0] ?? { name: '', price: '', cost: '', unit: '' }
  const canNext = !!(p1.name && p1.price && p1.cost && p1.unit && data.monthlyFixedCosts)

  return (
    <StepCard theme="yellow" icon={<Wallet size={22} strokeWidth={1.75} />} badgeLabel="Finanzas">
      <div className="flex items-center justify-between">
        <Label>Números clave de tu negocio</Label>
        <button type="button"
          onClick={() => persistProducts([...products, { name: '', price: '', cost: '', unit: '' }])}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b60' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Agregar producto
        </button>
      </div>
      <Hint>El primer producto es requerido; los demás son opcionales.</Hint>
      <div className="flex flex-col gap-4 mt-4 mb-2">
        {products.map((p, idx) => (
          <ProductBlock key={idx} num={idx + 1} entry={p}
            onChange={(f, v) => updateProduct(idx, f, v)}
            onRemove={idx > 0 ? () => persistProducts(products.filter((_, i) => i !== idx)) : undefined} />
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

// ─── PASO 6 — Escala ──────────────────────────────────────────────────────────
function Step6({ onBack, onNext, onSkip }: { onBack: () => void; onNext: () => void; onSkip: () => void }) {
  const { data, setField } = useOnboardingStore()
  const isHipo = data.businessStatus === 'hipotetico'
  const isExistente = data.businessStatus === 'existente'

  // Calcular ingresos derivados para mostrar como referencia
  const p1Price = parseFloat(data.product1Price ?? '0') || 0
  const units = parseFloat(data.monthlyUnits ?? '0') || 0
  const derivedRevenue = p1Price * units

  return (
    <StepCard theme="green" icon={<TrendingUp size={22} strokeWidth={1.75} />} badgeLabel="Escala">
      <Label>{isExistente ? 'Volumen actual' : 'Estimación de ventas'}</Label>
      <Hint>
        {isHipo
          ? 'No tiene que ser exacto — es una estimación de arranque.'
          : isExistente
          ? 'Aproximados están bien.'
          : 'Una estimación conservadora es mejor que cero.'}
      </Hint>

      <FieldLabel>
        ¿Cuántas unidades al mes {isExistente ? 'vendes' : isHipo ? 'crees que venderías' : 'planeas vender'}?
      </FieldLabel>
      <input type="number" min={0} className={inputCls('green')} placeholder="ej. 400"
        value={data.monthlyUnits ?? ''}
        onChange={(e) => setField('monthlyUnits', e.target.value)} />

      {derivedRevenue > 0 && (
        <p className="text-xs mt-1.5 font-medium" style={{ color: '#16a34a' }}>
          ≈ ${derivedRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} / mes con precio del Producto 1
        </p>
      )}

      <FieldLabel>
        ¿Con cuánto capital {isExistente ? 'cuentas para reinvertir' : 'cuentas para abrir'}? (opcional)
      </FieldLabel>
      <MoneyInput theme="green" placeholder="ej. 80,000" value={data.capitalAvailable ?? ''}
        onChange={(raw) => setField('capitalAvailable', raw)} />

      <Nav onBack={onBack} onNext={onNext} onSkip={onSkip} canNext={!!data.monthlyUnits} />
    </StepCard>
  )
}

// ─── PASO 7 — Cliente & motivación (totalmente skipeable) ─────────────────────
function Step7({ onBack, onNext, onSkip }: { onBack: () => void; onNext: () => void; onSkip: () => void }) {
  const { data, setField } = useOnboardingStore()
  const isHipo = data.businessStatus === 'hipotetico'
  const isExistente = data.businessStatus === 'existente'

  return (
    <StepCard theme="purple" icon={<User size={22} strokeWidth={1.75} />} badgeLabel="Cliente">
      <Label>¿Quién es tu cliente ideal?</Label>
      <Hint>Este paso es opcional — puedes saltarlo y completarlo después.</Hint>

      <FieldLabel>¿A quién le {isHipo ? 'venderías' : 'vendes'}?</FieldLabel>
      <input className={inputCls('purple')} placeholder="ej. Jóvenes universitarios de 18–25 años"
        value={data.targetCustomer ?? ''}
        onChange={(e) => setField('targetCustomer', e.target.value)} />

      <FieldLabel>
        {isExistente
          ? '¿Cuál es tu mayor reto ahora mismo?'
          : isHipo
          ? '¿Qué problema resuelve tu idea?'
          : '¿Por qué crees en este negocio?'}
      </FieldLabel>
      <textarea rows={3} className={inputCls('purple') + ' resize-none'}
        placeholder={
          isExistente
            ? 'ej. Atraer más clientes en temporada baja...'
            : isHipo
            ? 'ej. En mi colonia no hay cafeterías de calidad cerca de las oficinas...'
            : 'ej. Hay poca competencia en la zona y la demanda es alta...'
        }
        value={data.businessMotivation ?? ''}
        onChange={(e) => setField('businessMotivation', e.target.value)} />

      <Nav onBack={onBack} onNext={onNext} onSkip={onSkip} canNext={!!(data.targetCustomer || data.businessMotivation)} isLast />
    </StepCard>
  )
}

// ─── Keyboard focus helper ─────────────────────────────────────────────────────
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('input, textarea, select'))
    .filter(el => !(el as HTMLInputElement).disabled && el.tabIndex !== -1)
}

// ─── SquareField decorativo ───────────────────────────────────────────────────
import SquareField from '@/components/ui/SquareField'

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const STEPS = [Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7]
// Pasos donde el Nav incluye botón Skip (índices)
const SKIPPABLE = new Set([4, 6, 7])

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, direction, setStep, data } = useOnboardingStore()
  const total = STEPS.length
  const mainRef = useRef<HTMLElement>(null)

  function goNext() {
    if (currentStep === total - 1) { router.push('/analisis'); return }
    setStep(currentStep + 1, 1)
  }
  function goBack() {
    if (currentStep === 0) { router.push('/'); return }
    setStep(currentStep - 1, -1)
  }
  function goSkip() {
    if (currentStep === total - 1) { router.push('/analisis'); return }
    setStep(currentStep + 1, 1)
  }

  // Enter key: advance within card or to next step
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if ((document.activeElement as HTMLElement)?.tagName === 'TEXTAREA') return
      if ((document.activeElement as HTMLElement)?.tagName === 'BUTTON') return
      const container = mainRef.current
      if (!container) return
      const focusable = getFocusable(container)
      const idx = focusable.indexOf(document.activeElement as HTMLElement)
      if (idx !== -1 && idx < focusable.length - 1) { e.preventDefault(); focusable[idx + 1].focus() }
      else { e.preventDefault(); goNext() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, total])

  // Persist to localStorage on every data change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const prev = JSON.parse(window.localStorage.getItem('viabl_business_data_v1') || '{}')
      window.localStorage.setItem('viabl_business_data_v1', JSON.stringify({ ...prev, ...data }))
    } catch { /* silent */ }
  }, [data])

  const StepComponent = STEPS[currentStep]
  const isSkippable = SKIPPABLE.has(currentStep)
  const isLast = currentStep === total - 1

  // Build props dynamically — Step0 only gets onNext, rest get onBack+onNext+optional onSkip
  const stepProps = currentStep === 0
    ? { onNext: goNext }
    : {
        onBack: goBack,
        onNext: goNext,
        ...(isSkippable ? { onSkip: goSkip } : {}),
      }

  return (
    <main ref={mainRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
      style={{ background: '#fafafa', color: 'var(--color-text)' }}>

      {/* Grid background — z-0 keeps it strictly behind content */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--color-border, #e5e7eb) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, #e5e7eb) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.5,
        zIndex: 0,
      }} />
      <SquareField style={{ zIndex: 0 }} />

      {/* All foreground content lives above the decorative backgrounds */}
      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 1 }}>
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-10">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{
              width: i === currentStep ? '1.5rem' : '0.375rem',
              background: i === currentStep ? '#3b82f6' : i < currentStep ? '#93c5fd' : 'var(--color-border-strong)',
            }} />
          ))}
        </div>

        {/* Slide window */}
        <div className="w-full max-w-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentStep} custom={direction}
              variants={variants} initial="enter" animate="center" exit="exit" transition={spring}>
              {/* Cast needed because each step has slightly different optional props */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <StepComponent {...(stepProps as any)} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step label */}
        <p className="mt-6 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Paso {currentStep + 1} de {total}
          {isSkippable && !isLast && <span className="ml-1 opacity-60">· opcional</span>}
        </p>
      </div>
    </main>
  )
}
