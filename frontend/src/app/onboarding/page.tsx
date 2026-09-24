'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore, type BusinessStatus, type OnboardingData } from '@/store/onboardingStore'
import { useRouter } from 'next/navigation'
import StarField from '@/components/ui/StarField'
import {
  Flag, Store, Rocket, Lightbulb, Tag, PenLine, Wallet,
  BarChart2, Target, CalendarDays, Map, ShoppingCart,
  MessageSquare, MapPin, TrendingUp, User,
} from 'lucide-react'

// ─── Paleta de temas ──────────────────────────────────────────────────────────
type Theme = 'blue' | 'purple' | 'yellow' | 'green' | 'red'

const THEME: Record<Theme, {
  bg: string; border: string; badge: string; badgeText: string; ring: string; label: string
}> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100',   badgeText: 'text-blue-700',   ring: 'focus:ring-blue-400',   label: 'Contexto' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100', badgeText: 'text-purple-700', ring: 'focus:ring-purple-400', label: 'Categoría' },
  yellow: { bg: 'bg-amber-50',  border: 'border-amber-300',  badge: 'bg-amber-100',  badgeText: 'text-amber-700',  ring: 'focus:ring-amber-400',  label: 'Finanzas' },
  green:  { bg: 'bg-emerald-50',border: 'border-emerald-300',badge: 'bg-emerald-100',badgeText: 'text-emerald-700',ring: 'focus:ring-emerald-400',label: 'Planificación' },
  red:    { bg: 'bg-red-50',    border: 'border-red-300',    badge: 'bg-red-100',    badgeText: 'text-red-700',    ring: 'focus:ring-red-400',    label: 'Riesgos' },
}

// ─── Variantes de animación (slide) ──────────────────────────────────────────
const variants = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
}
const spring = { type: 'spring' as const, stiffness: 280, damping: 28 }

// ─── Helpers de estilos por tema ──────────────────────────────────────────────
function inputCls(theme: Theme) {
  return `w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${THEME[theme].ring} field-input placeholder:text-[color:var(--color-text-muted)]`
}
function optionBtn(theme: Theme, selected: boolean) {
  return `flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 text-sm font-medium transition-colors
    ${selected
      ? `${THEME[theme].border} ${THEME[theme].bg} ${THEME[theme].badgeText}`
      : 'border-[color:var(--color-border)] bg-[color:var(--color-card)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]'}`
}
function chipBtn(theme: Theme, selected: boolean) {
  return `py-2.5 px-3 rounded-xl border text-sm font-medium transition text-left
    ${selected
      ? `${THEME[theme].border} ${THEME[theme].bg} ${THEME[theme].badgeText}`
      : 'border-[color:var(--color-border)] bg-[color:var(--color-card)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]'}`
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
interface NavProps { onBack?: () => void; onNext: () => void; canNext: boolean; isLast?: boolean }
function Nav({ onBack, onNext, canNext, isLast }: NavProps) {
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-card)' }}>
          ← Atrás
        </button>
      )}
      <button onClick={onNext} disabled={!canNext}
        className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
        style={canNext
          ? { background: 'var(--color-accent)', color: 'var(--color-accent-fg)' }
          : { background: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }
        }>
        {isLast ? 'Ver resultados →' : 'Continuar →'}
      </button>
    </div>
  )
}

// ─── Wrappers de label y hint ─────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-black leading-snug" style={{ color: 'var(--color-text)' }}>{children}</h2>
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
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
function StepCard({ theme, icon, badgeLabel, children }: {
  theme: Theme; icon: React.ReactNode; badgeLabel: string; children: React.ReactNode
}) {
  const t = THEME[theme]
  return (
    <div className={`w-full border-2 rounded-3xl overflow-hidden ${t.bg} ${t.border}`}>
      <div className="px-6 pt-7 pb-2">
        <div className="flex items-center justify-between mb-5">
          <span className="flex items-center">{icon}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${t.badge} ${t.badgeText}`}>
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
  return (
    <StepCard theme="purple" icon={<Tag size={28} strokeWidth={1.75} />} badgeLabel="Categoría">
      <Label>¿Qué tipo de negocio es?</Label>
      <Hint>Elige la categoría que mejor lo describe.</Hint>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 mb-2">
        {types.map((t) => (
          <button key={t} onClick={() => setField('businessType', t)}
            className={chipBtn('purple', data.businessType === t)}>
            {t}
          </button>
        ))}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.businessType} />
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

// Paso 2.5 — Finanzas base [yellow / Finanzas] — para todos
function ProductBlock({
  theme,
  num,
  nameKey, priceKey, costKey, unitKey,
  nameVal, priceVal, costVal, unitVal,
  onChange,
}: {
  theme: 'yellow'
  num: 1 | 2
  nameKey: keyof OnboardingData
  priceKey: keyof OnboardingData
  costKey: keyof OnboardingData
  unitKey: keyof OnboardingData
  nameVal: string; priceVal: string; costVal: string; unitVal: string
  onChange: (key: keyof OnboardingData, val: string) => void
}) {
  const units = ['pieza', 'kg', 'litro', 'hora', 'servicio', 'paquete', 'otro']
  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ border: '1px solid #f59e0b50', background: '#f59e0b08' }}>
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#d97706' }}>Producto {num}</p>
        {num === 2 && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
        )}
      </div>
      <div>
        <FieldLabel>Nombre del producto / servicio</FieldLabel>
        <input className={inputCls(theme)} placeholder={num === 1 ? 'ej. Café americano' : 'ej. Croissant de mantequilla'}
          value={nameVal}
          onChange={(e) => onChange(nameKey, e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Precio de venta ($)</FieldLabel>
          <MoneyInput theme={theme} placeholder="ej. 50" value={priceVal}
            onChange={(raw) => onChange(priceKey, raw)} />
        </div>
        <div>
          <FieldLabel>Costo por unidad ($)</FieldLabel>
          <MoneyInput theme={theme} placeholder="ej. 14" value={costVal}
            onChange={(raw) => onChange(costKey, raw)} />
        </div>
      </div>
      <div>
        <FieldLabel>Unidad de medida</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {units.map((u) => (
            <button key={u} type="button"
              onClick={() => onChange(unitKey, u)}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
              style={unitVal === u
                ? { borderColor: '#f59e0b', background: '#fef3c7', color: '#92400e' }
                : { borderColor: 'var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text-secondary)' }
              }>
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step25({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const canNext = !!(
    data.product1Name && data.product1Price && data.product1Cost && data.product1Unit &&
    data.monthlyFixedCosts
  )
  return (
    <StepCard theme="yellow" icon={<Wallet size={28} strokeWidth={1.75} />} badgeLabel="Finanzas">
      <Label>Números clave de tu negocio</Label>
      <Hint>El producto 1 es requerido; el producto 2 es opcional.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProductBlock
            theme="yellow" num={1}
            nameKey="product1Name" priceKey="product1Price" costKey="product1Cost" unitKey="product1Unit"
            nameVal={data.product1Name ?? ''} priceVal={data.product1Price ?? ''}
            costVal={data.product1Cost ?? ''} unitVal={data.product1Unit ?? ''}
            onChange={(k, v) => setField(k, v as never)}
          />
          <ProductBlock
            theme="yellow" num={2}
            nameKey="product2Name" priceKey="product2Price" costKey="product2Cost" unitKey="product2Unit"
            nameVal={data.product2Name ?? ''} priceVal={data.product2Price ?? ''}
            costVal={data.product2Cost ?? ''} unitVal={data.product2Unit ?? ''}
            onChange={(k, v) => setField(k, v as never)}
          />
        </div>
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
  return (
    <StepCard theme="blue" icon={<MapPin size={28} strokeWidth={1.75} />} badgeLabel="Ubicación">
      <Label>¿Dónde está (o estará) tu negocio?</Label>
      <Hint>Completar la ciudad es suficiente; el resto es opcional.</Hint>
      <div className="flex flex-col gap-4 mt-5 mb-2">
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
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.locationCity} />
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
export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, direction, setStep, data } = useOnboardingStore()
  const steps = buildSteps(data.businessStatus ?? null)
  const total = steps.length

  function goNext() {
    if (currentStep === total - 1) { router.push('/analisis'); return }
    setStep(currentStep + 1, 1)
  }
  function goBack() {
    if (currentStep === 0) { router.push('/'); return }
    setStep(currentStep - 1, -1)
  }

  const StepComponent = steps[currentStep]

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden" style={{ background: '#ffffff', color: 'var(--color-text)' }}>
      <StarField />

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
