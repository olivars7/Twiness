'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ClipboardList, BarChart3, DollarSign, MapPin, Users, Store, Rocket, Lightbulb } from 'lucide-react'
import { useLocalBusinessData } from '@/hooks/useLocalBusinessData'
import { useOnboardingStore, type OnboardingData } from '@/store/onboardingStore'

// ─── Componente de campo editable inline ─────────────────────────────────────
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

  // Sync draft when value changes externally
  useEffect(() => { if (!editing) setDraft(value ?? '') }, [value, editing])

  function confirm() {
    onSave(fieldKey, draft)
    setEditing(false)
  }
  function cancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  const inputCls = 'flex-1 field-input'

  return (
    <div className="group flex items-start gap-3 py-3 last:border-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <p className="text-xs w-40 shrink-0 pt-1.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-2">
              {multiline ? (
                <textarea rows={3} className={inputCls + ' resize-none w-full'}
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  autoFocus />
              ) : (
                <input type={type} className={inputCls}
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
                  autoFocus />
              )}
              <div className="flex gap-1 shrink-0 pt-1">
                <button onClick={confirm}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ✓
                </button>
                <button onClick={cancel}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition bg-gray-100 hover:bg-gray-200 text-gray-500">
                  ✕
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { setDraft(value ?? ''); setEditing(true) }}>
              <p className={`text-sm flex-1 ${value ? '' : 'italic'}`}
                style={{ color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {value || placeholder}
              </p>
              <span className="transition text-xs opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--color-text-muted)' }}>✏️</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sección colapsable ───────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ReactNode; title: string; badge?: string; badgeColor?: string
  accentColor?: string; children: React.ReactNode
}
function Section({ icon, title, badge, badgeColor = 'bg-gray-100 text-gray-500', accentColor, children }: SectionProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card rounded-2xl overflow-hidden"
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : {}}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 transition text-left hover:bg-[var(--color-card-hover)]">
        <span className="flex items-center" style={accentColor ? { color: accentColor } : {}}>{icon}</span>
        <span className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>{title}</span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
        )}
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}
          className="text-xs" style={{ color: 'var(--color-text-muted)' }}>▾</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden">
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Read-only display row for ER data ────────────────────────────────────────
function ERDisplayRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <p className="text-xs w-44 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <p className="text-sm font-medium flex-1" style={{ color: color || 'var(--color-text)' }}>
        {value || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</span>}
      </p>
    </div>
  )
}

// ─── Format $ value for display ───────────────────────────────────────────────
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

// ─── Badge de etapa ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  existente:  { label: 'Negocio existente', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  nuevo:      { label: 'Próximo a abrir',   color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  hipotetico: { label: 'Idea / hipotético', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function MisDatosPage() {
  const router = useRouter()

  // ── 1. Hook local (localStorage) ─────────────────────────────────────────
  const { data, hydrated, setField, clearData, mergeData, storageAvailable } =
    useLocalBusinessData()

  // ── 2. Store global (onboarding) — solo lectura, para seed inicial ────────
  const storeData = useOnboardingStore((s) => s.data)

  // ── 3. Seed: si localStorage estaba vacío, importar datos del store ────────
  useEffect(() => {
    if (!hydrated) return
    const hasLocalData = Object.keys(data).length > 0
    if (!hasLocalData) {
      const hasStoreData = Object.keys(storeData).length > 0
      if (hasStoreData) {
        // overwrite=false → localStorage vacío, así que toma todo del store
        mergeData(storeData, true)
      }
    }
    // Solo ejecutar una vez después de hidratación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // ── 4. Guardar campo ──────────────────────────────────────────────────────
  function save(key: keyof OnboardingData, value: string) {
    setField(key, value as OnboardingData[typeof key])
  }

  // ── 5. Derivados ──────────────────────────────────────────────────────────
  const status = (data.businessStatus as string) ?? ''
  const statusInfo = STATUS_LABELS[status]
  const isEmpty = !data.businessName && !data.businessType

  // ── 6. Pantalla de hidratación ────────────────────────────────────────────
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

  // ── 7. Pantalla vacía ─────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ClipboardList size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>No hay datos aún</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Completa el onboarding para ver y editar tu información aquí.
        </p>
        <button onClick={() => router.push('/onboarding')}
          className="mt-2 px-6 py-3 text-sm font-semibold rounded-xl transition"
          style={{ background: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}>
          Ir al onboarding →
        </button>
      </div>
    )
  }

  // ── 8. Vista principal ────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
            <ClipboardList size={24} strokeWidth={2.2} />
            Mis Datos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Haz click en cualquier campo para editarlo. Los cambios se guardan automáticamente.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 mt-1">
          {statusInfo && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
          {/* Indicador de persistencia */}
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: storageAvailable ? '#f0fdf4' : '#fef2f2',
              color: storageAvailable ? '#15803d' : '#b91c1c',
              border: `1px solid ${storageAvailable ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {storageAvailable ? '● Guardado localmente' : '⚠ Sin persistencia'}
          </span>
        </div>
      </motion.div>

      {/* Dark summary box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <div className="dark-box rounded-2xl p-5 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Negocio</p>
            <p className="text-sm font-semibold">{data.businessName || '—'}</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Tipo</p>
            <p className="text-sm font-semibold">{data.businessType || '—'}</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Ciudad</p>
            <p className="text-sm font-semibold">{data.targetCity || data.locationCity || '—'}</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Etapa</p>
            <p className="text-sm font-semibold dark-box-accent">{statusInfo?.label || '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Sección A: Identidad ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section icon={<span>✏️</span>} title="Identidad del negocio" badge="A" badgeColor="bg-blue-50 text-blue-700 border border-blue-200" accentColor="#3b82f6">
          <EditableField label="Nombre" fieldKey="businessName" value={data.businessName} onSave={save} placeholder="Sin nombre" />
          <EditableField label="Tipo de negocio" fieldKey="businessType" value={data.businessType} onSave={save} placeholder="Sin tipo" />
          <EditableField label="Descripción" fieldKey="businessDescription" value={data.businessDescription}
            onSave={save} placeholder="Sin descripción" multiline />
        </Section>
      </motion.div>

      {/* ── Sección B: Finanzas base ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section icon={<DollarSign size={16} strokeWidth={1.75} />} title="Finanzas base" badge="B" badgeColor="bg-amber-50 text-amber-700 border border-amber-200" accentColor="#f59e0b">
          <p className="text-xs font-bold uppercase tracking-wider pt-1 pb-0.5" style={{ color: '#f59e0b' }}>Producto 1</p>
          <EditableField label="Nombre" fieldKey="product1Name" value={data.product1Name} onSave={save} placeholder="No ingresado" />
          <EditableField label="Precio de venta ($)" fieldKey="product1Price" value={data.product1Price}
            onSave={save} placeholder="No ingresado" type="number" />
          <EditableField label="Costo por unidad ($)" fieldKey="product1Cost" value={data.product1Cost}
            onSave={save} placeholder="No ingresado" type="number" />
          <EditableField label="Unidad de medida" fieldKey="product1Unit" value={data.product1Unit} onSave={save} placeholder="No ingresada" />
          <p className="text-xs font-bold uppercase tracking-wider pt-3 pb-0.5" style={{ color: '#f59e0b' }}>Producto 2</p>
          <EditableField label="Nombre" fieldKey="product2Name" value={data.product2Name} onSave={save} placeholder="No ingresado" />
          <EditableField label="Precio de venta ($)" fieldKey="product2Price" value={data.product2Price}
            onSave={save} placeholder="No ingresado" type="number" />
          <EditableField label="Costo por unidad ($)" fieldKey="product2Cost" value={data.product2Cost}
            onSave={save} placeholder="No ingresado" type="number" />
          <EditableField label="Unidad de medida" fieldKey="product2Unit" value={data.product2Unit} onSave={save} placeholder="No ingresada" />
          <p className="text-xs font-bold uppercase tracking-wider pt-3 pb-0.5" style={{ color: '#f59e0b' }}>Global</p>
          <EditableField label="Gastos fijos / mes ($)" fieldKey="monthlyFixedCosts" value={data.monthlyFixedCosts}
            onSave={save} placeholder="No ingresado" type="number" />
        </Section>
      </motion.div>

      {/* ── Sección C: Ubicación ─────────────────────────────────────────────── */}
      {(data.targetCity || data.targetZone || data.locationCountry || data.locationCity) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section icon={<MapPin size={16} strokeWidth={1.75} />} title="Ubicación" badge="C" badgeColor="bg-blue-50 text-blue-700 border border-blue-200" accentColor="#3b82f6">
            {data.targetCity !== undefined && (
              <EditableField label="Ciudad objetivo" fieldKey="targetCity" value={data.targetCity} onSave={save} />
            )}
            {data.targetZone !== undefined && (
              <EditableField label="Zona / Colonia" fieldKey="targetZone" value={data.targetZone} onSave={save} placeholder="No especificada" />
            )}
            {data.locationCountry !== undefined && (
              <EditableField label="País" fieldKey="locationCountry" value={data.locationCountry} onSave={save} placeholder="No especificado" />
            )}
            {data.locationState !== undefined && (
              <EditableField label="Estado" fieldKey="locationState" value={data.locationState} onSave={save} placeholder="No especificado" />
            )}
            {data.locationCity !== undefined && (
              <EditableField label="Ciudad del local" fieldKey="locationCity" value={data.locationCity} onSave={save} placeholder="No especificada" />
            )}
            {data.locationNeighborhood !== undefined && (
              <EditableField label="Fraccionamiento / Zona / Colonia" fieldKey="locationNeighborhood"
                value={data.locationNeighborhood} onSave={save} placeholder="No especificada" />
            )}
          </Section>
        </motion.div>
      )}

      {/* ── Sección D: Cliente objetivo ──────────────────────────────────────── */}
      {(data.targetCustomer || data.salesChannel) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section icon={<Users size={16} strokeWidth={1.75} />} title="Cliente objetivo" badge="D" badgeColor="bg-purple-50 text-purple-700 border border-purple-200" accentColor="#7c3aed">
            {data.targetCustomer !== undefined && (
              <EditableField label="Perfil de cliente" fieldKey="targetCustomer" value={data.targetCustomer} onSave={save} />
            )}
            {data.salesChannel !== undefined && (
              <EditableField label="Canal de venta" fieldKey="salesChannel" value={data.salesChannel} onSave={save} />
            )}
            {data.estimatedBudget !== undefined && (
              <EditableField label="Presupuesto estimado ($)" fieldKey="estimatedBudget" value={data.estimatedBudget}
                onSave={save} type="number" />
            )}
          </Section>
        </motion.div>
      )}

      {/* ── Sección E: Negocio existente ─────────────────────────────────────── */}
      {status === 'existente' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section icon={<Store size={16} strokeWidth={1.75} />} title="Datos del negocio actual" badge="E" badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200" accentColor="#10b981">
            <EditableField label="Meses operando" fieldKey="monthsOperating" value={data.monthsOperating}
              onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Empleados" fieldKey="employeeCount" value={data.employeeCount}
              onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Ingresos / mes ($)" fieldKey="currentMonthlyRevenue" value={data.currentMonthlyRevenue}
              onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Gastos fijos / mes ($)" fieldKey="currentMonthlyExpenses" value={data.currentMonthlyExpenses}
              onSave={save} placeholder="No ingresado" type="number" />
            <EditableField label="Mayor reto" fieldKey="mainChallenge" value={data.mainChallenge} onSave={save} />
          </Section>
        </motion.div>
      )}

      {/* ── Sección E: Negocio nuevo ─────────────────────────────────────────── */}
      {status === 'nuevo' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section icon={<Rocket size={16} strokeWidth={1.75} />} title="Plan de apertura" badge="E" badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200" accentColor="#10b981">
            <EditableField label="Fecha de apertura" fieldKey="plannedOpeningDate" value={data.plannedOpeningDate}
              onSave={save} placeholder="No especificada" type="month" />
            <EditableField label="Inversión inicial ($)" fieldKey="initialInvestment" value={data.initialInvestment}
              onSave={save} placeholder="No ingresada" type="number" />
          </Section>
        </motion.div>
      )}

      {/* ── Sección E: Hipotético ────────────────────────────────────────────── */}
      {status === 'hipotetico' && data.problemSolved && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section icon={<Lightbulb size={16} strokeWidth={1.75} />} title="Propuesta de valor" badge="E" badgeColor="bg-purple-50 text-purple-700 border border-purple-200" accentColor="#7c3aed">
            <EditableField label="Problema que resuelves" fieldKey="problemSolved" value={data.problemSolved}
              onSave={save} multiline />
          </Section>
        </motion.div>
      )}

      {/* ── Sección F: Estado de Resultados ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}>
        <Section
          icon={<BarChart3 size={16} strokeWidth={2} />}
          title="Parámetros de Estado de Resultados"
          badge="F"
          badgeColor="bg-blue-50 text-blue-700 border border-blue-200"
          accentColor="#3b82f6"
        >
          <p className="text-xs mt-1 mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Datos utilizados en la subpágina de Estado de Resultados.{' '}
            <span
              className="underline cursor-pointer"
              style={{ color: '#3b82f6' }}
              onClick={() => window.location.href = '/proyecto/financiero/estado-resultados'}
            >
              Editar allí →
            </span>
          </p>

          <p className="text-[10px] font-bold uppercase tracking-wider pt-1 pb-0.5 flex items-center gap-1" style={{ color: '#3b82f6' }}>
            <DollarSign size={10} strokeWidth={2.5} /> Ingresos
          </p>
          <ERDisplayRow label="Precio promedio / unidad"     value={fmtMoney(data.er_precioPromedio)} />
          <ERDisplayRow label="Unidades vendidas / mes"      value={data.er_ventasEstimadasMes ? Number(data.er_ventasEstimadasMes).toLocaleString('es-MX') : '—'} />
          <ERDisplayRow label="Otros ingresos / mes"         value={fmtMoney(data.er_otrosIngresos)} />

          <p className="text-[10px] font-bold uppercase tracking-wider pt-3 pb-0.5 flex items-center gap-1" style={{ color: '#ef4444' }}>
            <span>−</span> Costos y Gastos
          </p>
          <ERDisplayRow label="Costo variable / unidad"      value={fmtMoney(data.er_costoVariableUnitario)} />
          <ERDisplayRow label="Gastos operativos fijos / mes" value={fmtMoney(data.er_gastosOperativosFijos)} />
          <ERDisplayRow label="Gastos administrativos / mes"  value={fmtMoney(data.er_gastosAdministrativos)} />

          <p className="text-[10px] font-bold uppercase tracking-wider pt-3 pb-0.5" style={{ color: '#f59e0b' }}>
            Proyección e Inversión
          </p>
          <ERDisplayRow label="Inversión inicial"           value={fmtMoney(data.er_inversionInicial)} />
          <ERDisplayRow label="Tasa de impuestos"           value={fmtPct(data.er_impuestosPct)} />
          <ERDisplayRow label="Crecimiento mensual"         value={fmtPct(data.er_tasaCrecimiento)} />
        </Section>
      </motion.div>

      {/* CTA al onboarding + borrar datos */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="pt-2 pb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>¿Quieres rehacer el cuestionario completo?</p>
        <button onClick={() => router.push('/onboarding')}
          className="text-xs px-4 py-2 rounded-lg transition"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
          Volver al onboarding
        </button>
        <button
          onClick={() => {
            if (window.confirm('¿Borrar todos los datos guardados localmente? Esta acción no se puede deshacer.')) {
              clearData()
            }
          }}
          className="text-xs px-4 py-2 rounded-lg transition"
          style={{ border: '1px solid #fecaca', color: '#b91c1c' }}>
          Borrar datos locales
        </button>
      </motion.div>

    </div>
  )
}
