'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ClipboardList, BarChart3, DollarSign, MapPin, Users,
  Store, Rocket, Lightbulb, PenLine, RotateCcw, Check,
  TrendingUp, ArrowUpRight,
} from 'lucide-react'
import { useLocalBusinessData } from '@/hooks/useLocalBusinessData'
import { useOnboardingStore, type OnboardingData } from '@/store/onboardingStore'
import SquareField from '@/components/ui/SquareField'

// ─── Editable field ───────────────────────────────────────────────────────────
interface EditableFieldProps {
  label: string
  fieldKey: keyof OnboardingData
  value: string | undefined
  onSave: (key: keyof OnboardingData, value: string) => void
  placeholder?: string
  multiline?: boolean
  type?: string
}

function EditableField({
  label, fieldKey, value, onSave,
  placeholder = '—', multiline = false, type = 'text',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => { if (!editing) setDraft(value ?? '') }, [value, editing])

  function confirm() { onSave(fieldKey, draft); setEditing(false) }
  function cancel()  { setDraft(value ?? ''); setEditing(false) }

  return (
    <div
      className="group flex items-start gap-4 py-3 last:border-0"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Label */}
      <span
        className="shrink-0 pt-[9px] text-[10px] font-semibold uppercase tracking-widest w-36"
        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.07em' }}
      >
        {label}
      </span>

      {/* Value / edit */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2"
            >
              {multiline ? (
                <textarea
                  rows={3}
                  className="flex-1 field-input resize-none w-full"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  autoFocus
                />
              ) : (
                <input
                  type={type}
                  className="flex-1 field-input"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
                  autoFocus
                />
              )}
              <div className="flex gap-1 shrink-0 pt-1">
                <button
                  onClick={confirm}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={cancel}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition"
                  style={{ background: 'var(--color-card-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  <RotateCcw size={12} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 cursor-pointer rounded-lg px-2 -mx-2 transition-all"
              style={{ minHeight: '2.25rem' }}
              onClick={() => { setDraft(value ?? ''); setEditing(true) }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <p
                className={`text-sm flex-1 leading-relaxed ${value ? 'font-medium' : 'italic'}`}
                style={{ color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              >
                {value || placeholder}
              </p>
              <span className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                <PenLine size={12} strokeWidth={1.75} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sub-group label (within a section) ──────────────────────────────────────
function GroupLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 pt-5 pb-2">
      <span
        className="text-[9px] font-black uppercase tracking-[0.12em]"
        style={{ color }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: `${color}30` }} />
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ReactNode
  title: string
  badge?: string
  badgeColor?: string
  accentColor?: string
  children: React.ReactNode
  defaultOpen?: boolean
}
function Section({
  icon, title, badge, badgeColor = 'bg-gray-100 text-gray-500',
  accentColor, children, defaultOpen = false,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderTop: accentColor ? `2px solid ${accentColor}` : '1px solid var(--color-border)',
        boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.05)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-[14px] text-left transition-colors"
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
      >
        {/* Tinted icon pill */}
        <span
          className="flex items-center justify-center w-[30px] h-[30px] rounded-xl shrink-0"
          style={{
            background: accentColor ? `${accentColor}18` : 'var(--color-card-hover)',
            color: accentColor ?? 'var(--color-text-secondary)',
          }}
        >
          {icon}
        </span>

        <span className="font-semibold text-[13px] flex-1 tracking-[-0.01em]" style={{ color: 'var(--color-text)' }}>
          {title}
        </span>

        {badge && (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest ${badgeColor}`}
          >
            {badge}
          </span>
        )}

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          style={{ color: 'var(--color-text-muted)', display: 'flex', marginLeft: '2px' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Read-only row (ER data) ──────────────────────────────────────────────────
function ERDisplayRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="flex items-center gap-4 py-2.5 last:border-0"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-widest shrink-0 w-48"
        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.07em' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium flex-1 tabular-nums"
        style={{ color: color || 'var(--color-text)' }}
      >
        {value || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontWeight: 400 }}>—</span>}
      </span>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(v: string | undefined) {
  if (!v) return '—'
  const n = parseFloat(v)
  if (isNaN(n)) return v
  return `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}
function fmtPct(v: string | undefined) {
  if (!v) return '—'
  return `${v}%`
}

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  existente:  { label: 'Negocio existente', dot: '#10b981' },
  nuevo:      { label: 'Próximo a abrir',   dot: '#3b82f6' },
  hipotetico: { label: 'Idea / hipotético', dot: '#7c3aed' },
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function MisDatosPage() {
  const router = useRouter()
  const { data, hydrated, setField, clearData, mergeData, storageAvailable } = useLocalBusinessData()
  const storeData = useOnboardingStore((s) => s.data)

  useEffect(() => {
    if (!hydrated) return
    const hasLocalData = Object.keys(data).length > 0
    if (!hasLocalData) {
      const hasStoreData = Object.keys(storeData).length > 0
      if (hasStoreData) mergeData(storeData, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  function save(key: keyof OnboardingData, value: string) {
    setField(key, value as OnboardingData[typeof key])
  }

  const status    = (data.businessStatus as string) ?? ''
  const statusInfo = STATUS_LABELS[status]
  const isEmpty   = !data.businessName && !data.businessType

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[40vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          className="w-7 h-7 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#000000', borderRightColor: '#00000030' }}
        />
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ClipboardList size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>No hay datos aún</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Completa el onboarding para ver y editar tu información aquí.
        </p>
        <button
          onClick={() => router.push('/onboarding')}
          className="mt-2 px-6 py-3 text-sm font-semibold rounded-xl transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}
        >
          Ir al onboarding →
        </button>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="relative max-w-2xl mx-auto space-y-4">

      {/* Background: grid + animated squares */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.4,
          }}
        />
        <SquareField />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Header (UNTOUCHED: title + subtitle) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 mb-5"
        >
          <div>
            <h1
              className="text-2xl flex items-center gap-2.5"
              style={{ fontFamily: '"Playfair Display","Georgia","Times New Roman",serif', fontWeight: 700, fontStyle: 'italic', color: 'var(--color-text)' }}
            >
              <ClipboardList size={24} strokeWidth={1.75} />
              Mis Datos
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Haz click en cualquier campo para editarlo. Los cambios se guardan automáticamente.
            </p>
          </div>
          {/* Storage dot */}
          <span
            className="flex items-center gap-1.5 text-[11px] font-medium shrink-0 mt-2"
            style={{ color: storageAvailable ? '#16a34a' : '#b91c1c' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: storageAvailable ? '#16a34a' : '#b91c1c' }}
            />
            {storageAvailable ? 'Guardado' : 'Sin persistencia'}
          </span>
        </motion.div>

        {/* ── Identity card ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: '#0f0f10', border: '1px solid #1f1f23' }}
        >
          {/* Top row: name + type + status */}
          <div className="px-5 pt-5 pb-4 flex flex-wrap gap-x-8 gap-y-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4b5563' }}>Negocio</p>
              <p className="text-base font-bold truncate" style={{ color: '#f4f4f5' }}>{data.businessName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4b5563' }}>Tipo</p>
              <p className="text-sm font-medium" style={{ color: '#d1d5db' }}>{data.businessType || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4b5563' }}>Ciudad</p>
              <p className="text-sm font-medium" style={{ color: '#d1d5db' }}>{data.targetCity || data.locationCity || '—'}</p>
            </div>
            {statusInfo && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4b5563' }}>Etapa</p>
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#60a5fa' }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusInfo.dot }} />
                  {statusInfo.label}
                </span>
              </div>
            )}
          </div>
          {/* Thin accent bottom bar */}
          <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #7c3aed 50%, transparent 100%)' }} />
        </motion.div>

        {/* ── Section A: Identidad ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <Section
            icon={<PenLine size={15} strokeWidth={1.75} />}
            title="Identidad del negocio"
            badge="A"
            badgeColor="bg-blue-50 text-blue-700 border border-blue-200"
            accentColor="#3b82f6"
            defaultOpen
          >
            <EditableField label="Nombre"         fieldKey="businessName"        value={data.businessName}        onSave={save} placeholder="Sin nombre" />
            <EditableField label="Tipo"           fieldKey="businessType"        value={data.businessType}        onSave={save} placeholder="Sin tipo" />
            <EditableField label="Descripción"    fieldKey="businessDescription" value={data.businessDescription} onSave={save} placeholder="Sin descripción" multiline />
          </Section>
        </motion.div>

        {/* ── Section B: Finanzas base ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
          <Section
            icon={<DollarSign size={15} strokeWidth={1.75} />}
            title="Finanzas base"
            badge="B"
            badgeColor="bg-amber-50 text-amber-700 border border-amber-200"
            accentColor="#f59e0b"
          >
            <GroupLabel label="Producto 1" color="#f59e0b" />
            <EditableField label="Nombre"          fieldKey="product1Name"  value={data.product1Name}  onSave={save} placeholder="No ingresado" />
            <EditableField label="Precio venta"    fieldKey="product1Price" value={data.product1Price} onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Costo unitario"  fieldKey="product1Cost"  value={data.product1Cost}  onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Unidad"          fieldKey="product1Unit"  value={data.product1Unit}  onSave={save} placeholder="No ingresada" />

            <GroupLabel label="Producto 2" color="#f59e0b" />
            <EditableField label="Nombre"          fieldKey="product2Name"  value={data.product2Name}  onSave={save} placeholder="No ingresado" />
            <EditableField label="Precio venta"    fieldKey="product2Price" value={data.product2Price} onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Costo unitario"  fieldKey="product2Cost"  value={data.product2Cost}  onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Unidad"          fieldKey="product2Unit"  value={data.product2Unit}  onSave={save} placeholder="No ingresada" />

            <GroupLabel label="Global" color="#f59e0b" />
            <EditableField label="Gastos fijos/mes" fieldKey="monthlyFixedCosts" value={data.monthlyFixedCosts} onSave={save} placeholder="No ingresado" type="number" />
          </Section>
        </motion.div>

        {/* ── Section C: Ubicación ─────────────────────────────────────────── */}
        {(data.targetCity || data.targetZone || data.locationCountry || data.locationCity) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <Section
              icon={<MapPin size={15} strokeWidth={1.75} />}
              title="Ubicación"
              badge="C"
              badgeColor="bg-blue-50 text-blue-700 border border-blue-200"
              accentColor="#3b82f6"
            >
              {data.targetCity          !== undefined && <EditableField label="Ciudad objetivo"   fieldKey="targetCity"            value={data.targetCity}            onSave={save} />}
              {data.targetZone          !== undefined && <EditableField label="Zona / Colonia"     fieldKey="targetZone"            value={data.targetZone}            onSave={save} placeholder="No especificada" />}
              {data.locationCountry     !== undefined && <EditableField label="País"               fieldKey="locationCountry"       value={data.locationCountry}       onSave={save} placeholder="No especificado" />}
              {data.locationState       !== undefined && <EditableField label="Estado"             fieldKey="locationState"         value={data.locationState}         onSave={save} placeholder="No especificado" />}
              {data.locationCity        !== undefined && <EditableField label="Ciudad del local"   fieldKey="locationCity"          value={data.locationCity}          onSave={save} placeholder="No especificada" />}
              {data.locationNeighborhood !== undefined && <EditableField label="Colonia / Fracc."  fieldKey="locationNeighborhood"  value={data.locationNeighborhood}  onSave={save} placeholder="No especificada" />}
            </Section>
          </motion.div>
        )}

        {/* ── Section D: Cliente objetivo ──────────────────────────────────── */}
        {(data.targetCustomer || data.salesChannel) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
            <Section
              icon={<Users size={15} strokeWidth={1.75} />}
              title="Cliente objetivo"
              badge="D"
              badgeColor="bg-purple-50 text-purple-700 border border-purple-200"
              accentColor="#7c3aed"
            >
              {data.targetCustomer  !== undefined && <EditableField label="Perfil de cliente"    fieldKey="targetCustomer"  value={data.targetCustomer}  onSave={save} />}
              {data.salesChannel    !== undefined && <EditableField label="Canal de venta"        fieldKey="salesChannel"    value={data.salesChannel}    onSave={save} />}
              {data.estimatedBudget !== undefined && <EditableField label="Presupuesto est. ($)"  fieldKey="estimatedBudget" value={data.estimatedBudget} onSave={save} type="number" />}
            </Section>
          </motion.div>
        )}

        {/* ── Section E: Negocio existente ─────────────────────────────────── */}
        {status === 'existente' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section
              icon={<Store size={15} strokeWidth={1.75} />}
              title="Datos del negocio actual"
              badge="E"
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              accentColor="#10b981"
            >
              <EditableField label="Meses operando"    fieldKey="monthsOperating"        value={data.monthsOperating}        onSave={save} placeholder="No ingresado" type="number" />
              <EditableField label="Empleados"          fieldKey="employeeCount"          value={data.employeeCount}          onSave={save} placeholder="No ingresado" type="number" />
              <EditableField label="Ingresos/mes"       fieldKey="currentMonthlyRevenue"  value={data.currentMonthlyRevenue}  onSave={save} placeholder="No ingresado" type="number" />
              <EditableField label="Gastos fijos/mes"   fieldKey="currentMonthlyExpenses" value={data.currentMonthlyExpenses} onSave={save} placeholder="No ingresado" type="number" />
              <EditableField label="Mayor reto"         fieldKey="mainChallenge"          value={data.mainChallenge}          onSave={save} />
            </Section>
          </motion.div>
        )}

        {/* ── Section E: Negocio nuevo ─────────────────────────────────────── */}
        {status === 'nuevo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section
              icon={<Rocket size={15} strokeWidth={1.75} />}
              title="Plan de apertura"
              badge="E"
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              accentColor="#10b981"
            >
              <EditableField label="Fecha apertura"    fieldKey="plannedOpeningDate" value={data.plannedOpeningDate} onSave={save} placeholder="No especificada" type="month" />
              <EditableField label="Inversión inicial" fieldKey="initialInvestment"  value={data.initialInvestment}  onSave={save} placeholder="No ingresada"  type="number" />
            </Section>
          </motion.div>
        )}

        {/* ── Section E: Hipotético ─────────────────────────────────────────── */}
        {status === 'hipotetico' && data.problemSolved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section
              icon={<Lightbulb size={15} strokeWidth={1.75} />}
              title="Propuesta de valor"
              badge="E"
              badgeColor="bg-purple-50 text-purple-700 border border-purple-200"
              accentColor="#7c3aed"
            >
              <EditableField label="Problema que resuelves" fieldKey="problemSolved" value={data.problemSolved} onSave={save} multiline />
            </Section>
          </motion.div>
        )}

        {/* ── Section F: Estado de Resultados ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
          <Section
            icon={<BarChart3 size={15} strokeWidth={2} />}
            title="Parámetros financieros"
            badge="F"
            badgeColor="bg-blue-50 text-blue-700 border border-blue-200"
            accentColor="#3b82f6"
          >
            {/* Link to edit */}
            <div className="flex items-center justify-between mt-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Datos del Estado de Resultados
              </p>
              <button
                onClick={() => window.location.href = '/proyecto/financiero/estado-resultados'}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#3b82f6' }}
              >
                Editar allí
                <ArrowUpRight size={11} strokeWidth={2.5} />
              </button>
            </div>

            {/* Ingresos */}
            <GroupLabel label="Ingresos" color="#3b82f6" />
            <ERDisplayRow label="Precio promedio / unidad"  value={fmtMoney(data.er_precioPromedio)} />
            <ERDisplayRow label="Unidades vendidas / mes"   value={data.er_ventasEstimadasMes ? Number(data.er_ventasEstimadasMes).toLocaleString('es-MX') : '—'} />
            <ERDisplayRow label="Otros ingresos / mes"      value={fmtMoney(data.er_otrosIngresos)} />

            {/* Costos */}
            <GroupLabel label="Costos y Gastos" color="#ef4444" />
            <ERDisplayRow label="Costo variable / unidad"      value={fmtMoney(data.er_costoVariableUnitario)} />
            <ERDisplayRow label="Gastos operativos / mes"      value={fmtMoney(data.er_gastosOperativosFijos)} />
            <ERDisplayRow label="Gastos administrativos / mes" value={fmtMoney(data.er_gastosAdministrativos)} />

            {/* Proyección */}
            <GroupLabel label="Proyección e Inversión" color="#f59e0b" />
            <ERDisplayRow label="Inversión inicial"   value={fmtMoney(data.er_inversionInicial)} />
            <ERDisplayRow label="Tasa de impuestos"   value={fmtPct(data.er_impuestosPct)} />
            <ERDisplayRow label="Crecimiento mensual" value={fmtPct(data.er_tasaCrecimiento)} />
          </Section>
        </motion.div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            ¿Quieres rehacer el cuestionario completo?
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push('/onboarding')}
              className="text-xs px-3.5 py-2 rounded-xl font-medium transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
            >
              Rehacer cuestionario
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Borrar todos los datos guardados localmente? Esta acción no se puede deshacer.')) {
                  clearData()
                }
              }}
              className="text-xs px-3.5 py-2 rounded-xl font-medium transition-colors"
              style={{ border: '1px solid #fecaca', color: '#b91c1c' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
            >
              Borrar datos
            </button>
          </div>
        </motion.div>

        {/* bottom breathing room */}
        <div className="pb-6" />

      </div>
    </div>
  )
}
