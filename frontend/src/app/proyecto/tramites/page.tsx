'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FileText, CheckCircle2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════

type TramiteStatus = 'pendiente' | 'en-proceso' | 'completado'
type AlertLevel = 'red' | 'yellow' | 'green' | 'blue'

interface Tramite {
  id: number
  nombre: string
  dependencia: string
  dias: number
  costo: string
  status: TramiteStatus
  descripcion: string
  requisitos: string[]
  url?: string
  prioridad: 'alta' | 'media' | 'baja'
}

interface RiesgoAlert {
  id: string
  level: AlertLevel
  title: string
  desc: string
  action?: string
  link?: string
  linkLabel?: string
  resolvable: boolean
}

// ═══════════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════════

const TRAMITES: Tramite[] = [
  {
    id: 1,
    nombre: 'Registro en el SAT (RFC)',
    dependencia: 'SAT',
    dias: 1,
    costo: 'Gratuito',
    status: 'pendiente',
    prioridad: 'alta',
    descripcion: 'Alta ante el SAT para obtener tu RFC. Obligatorio para operar formalmente y emitir facturas. Es el primer trámite que debes completar.',
    requisitos: ['CURP', 'Identificación oficial vigente', 'Comprobante de domicilio fiscal', 'Correo electrónico activo'],
    url: 'https://www.sat.gob.mx',
  },
  {
    id: 2,
    nombre: 'Dictamen de protección civil',
    dependencia: 'Dirección de Protección Civil TJ',
    dias: 10,
    costo: '$800–2,000',
    status: 'pendiente',
    prioridad: 'alta',
    descripcion: 'Verificación de que el local cumple normas de seguridad: extintores, salidas de emergencia, señalización. Requerido antes de solicitar la licencia de funcionamiento.',
    requisitos: ['Extintor vigente', 'Señalización de emergencia instalada', 'Botiquín de primeros auxilios', 'Plano del local con salidas marcadas'],
  },
  {
    id: 3,
    nombre: 'Permiso de uso de suelo',
    dependencia: 'Ayuntamiento de Tijuana',
    dias: 20,
    costo: '$600–1,500',
    status: 'pendiente',
    prioridad: 'alta',
    descripcion: 'Verifica que la actividad comercial es compatible con la zonificación del predio. Evita clausuras por uso de suelo incompatible.',
    requisitos: ['Dirección exacta del local', 'Descripción del giro comercial', 'Identificación oficial', 'Pago de derechos'],
    url: 'https://www.tijuana.gob.mx',
  },
  {
    id: 4,
    nombre: 'Licencia de funcionamiento',
    dependencia: 'Ayuntamiento de Tijuana',
    dias: 15,
    costo: '$1,200–3,500',
    status: 'pendiente',
    prioridad: 'alta',
    descripcion: 'Permiso municipal que autoriza la operación del establecimiento. Es el trámite principal para abrir. Requiere haber completado RFC, uso de suelo y protección civil.',
    requisitos: ['RFC activo', 'Contrato de arrendamiento o escritura del local', 'Croquis del establecimiento', 'Pago de derechos municipales', 'Dictamen de protección civil', 'Permiso de uso de suelo'],
    url: 'https://www.tijuana.gob.mx',
  },
  {
    id: 5,
    nombre: 'Aviso de apertura COFEPRIS',
    dependencia: 'COFEPRIS',
    dias: 5,
    costo: 'Gratuito',
    status: 'pendiente',
    prioridad: 'media',
    descripcion: 'Notificación obligatoria para establecimientos que manejan alimentos o bebidas. Aplica para cafeterías, restaurantes y cualquier giro alimenticio.',
    requisitos: ['RFC', 'Domicilio del establecimiento', 'Descripción de productos que se manejan', 'Responsable sanitario designado'],
    url: 'https://www.gob.mx/cofepris',
  },
  {
    id: 6,
    nombre: 'Registro patronal IMSS',
    dependencia: 'IMSS',
    dias: 3,
    costo: 'Gratuito',
    status: 'pendiente',
    prioridad: 'media',
    descripcion: 'Obligatorio si vas a contratar empleados. Debes registrarte como patrón y dar de alta a cada trabajador antes de su primer día laboral.',
    requisitos: ['RFC', 'CURP del representante legal', 'Comprobante de domicilio fiscal', 'Datos de los empleados a contratar'],
    url: 'https://www.imss.gob.mx',
  },
]

const ALERTAS: RiesgoAlert[] = [
  {
    id: 'licencia',
    level: 'red',
    title: 'Sin licencia de funcionamiento',
    desc: 'Operar sin licencia puede resultar en clausura inmediata por parte del Ayuntamiento. Es el trámite prioritario antes de abrir.',
    action: 'Tramita en el Ayuntamiento de Tijuana. Requiere RFC activo, contrato del local, dictamen de protección civil y permiso de uso de suelo.',
    link: '#tramites',
    linkLabel: 'Ver checklist de trámites ↓',
    resolvable: true,
  },
  {
    id: 'proteccion',
    level: 'red',
    title: 'Sin dictamen de protección civil',
    desc: 'Obligatorio para todo establecimiento con afluencia de público. Sin él no puedes obtener la licencia de funcionamiento.',
    action: 'Solicita la inspección a la Dirección de Protección Civil de Tijuana. Necesitas extintor vigente, señalización y plano del local con salidas marcadas.',
    link: '#tramites',
    linkLabel: 'Ver checklist de trámites ↓',
    resolvable: true,
  },
  {
    id: 'rfc',
    level: 'yellow',
    title: 'RFC pendiente de activar',
    desc: 'Necesitas RFC activo para emitir facturas, registrar empleados en el IMSS y operar formalmente ante el SAT.',
    action: 'Regístrate en sat.gob.mx con tu CURP e identificación oficial. El trámite es gratuito y tarda 1 día hábil.',
    resolvable: true,
  },
  {
    id: 'flujo',
    level: 'yellow',
    title: 'Flujo de caja negativo los primeros 2 meses',
    desc: 'Es normal en la etapa de apertura, pero debes contar con una reserva mínima de 3 meses de gastos fijos antes de abrir.',
    action: 'Asegura una reserva de $105,000 MXN (3 × $35,000 gastos fijos). Revisa el simulador de escenarios para proyectar el flujo.',
    link: '/proyecto/escenarios',
    linkLabel: 'Ir al simulador →',
    resolvable: false,
  },
  {
    id: 'fondo',
    level: 'blue',
    title: 'Considera crear un fondo de emergencia',
    desc: 'Tener $15,000–$20,000 MXN separados para imprevistos (equipo dañado, retrasos en permisos) reduce significativamente el riesgo operativo.',
    action: 'Abre una cuenta de ahorro separada exclusiva para emergencias del negocio antes de tu fecha de apertura.',
    resolvable: false,
  },
  {
    id: 'demanda',
    level: 'green',
    title: 'Zona con alta demanda detectada',
    desc: 'Tu área tiene un índice de oportunidad de 82/100. Alta densidad de clientes potenciales y baja saturación en horario nocturno.',
    link: '/proyecto/ubicacion',
    linkLabel: 'Ver zona estratégica →',
    resolvable: false,
  },
  {
    id: 'precio',
    level: 'green',
    title: 'Precio dentro del rango competitivo',
    desc: 'Tu precio estimado de $50 MXN está posicionado correctamente — 11% sobre el promedio pero muy por debajo del techo premium ($72).',
    link: '/proyecto/precios',
    linkLabel: 'Ver análisis de precios →',
    resolvable: false,
  },
]

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES DE ESTILO
// ═══════════════════════════════════════════════════════════════════

const TRAMITE_STATUS: Record<TramiteStatus, { label: string; cls: string; dot: string }> = {
  pendiente:    { label: 'Pendiente',   cls: 'bg-gray-100 text-gray-500 border border-gray-300',        dot: 'bg-gray-400'   },
  'en-proceso': { label: 'En proceso',  cls: 'bg-amber-50 text-amber-700 border border-amber-300',       dot: 'bg-amber-400'  },
  completado:   { label: 'Completado',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-300', dot: 'bg-emerald-500' },
}

const PRIORIDAD_BADGE: Record<Tramite['prioridad'], string> = {
  alta:  'bg-red-50 text-red-600 border border-red-200',
  media: 'bg-amber-50 text-amber-600 border border-amber-200',
  baja:  'bg-gray-100 text-gray-500 border border-gray-200',
}

const ALERT_CONFIG: Record<AlertLevel, {
  label: string; dot: string; bg: string; border: string
  badgeBg: string; badgeText: string; titleText: string
}> = {
  red:    { label: 'Crítico',    dot: 'bg-red-500',     bg: 'bg-red-50',     border: 'border-red-200',    badgeBg: 'bg-red-100',     badgeText: 'text-red-700',     titleText: 'text-red-800'    },
  yellow: { label: 'Precaución', dot: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-200',  badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700',   titleText: 'text-amber-800'  },
  green:  { label: 'Positivo',   dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200',badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', titleText: 'text-emerald-800'},
  blue:   { label: 'Sugerencia', dot: 'bg-blue-400',    bg: 'bg-blue-50',    border: 'border-blue-200',   badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',    titleText: 'text-blue-800'   },
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: separador de sección
// ═══════════════════════════════════════════════════════════════════

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

export default function CumplimientoPage() {
  // ── estado trámites ──────────────────────────────────────────────
  const [statuses, setStatuses] = useState<Record<number, TramiteStatus>>(
    Object.fromEntries(TRAMITES.map(t => [t.id, t.status]))
  )
  const [expandedTramite, setExpandedTramite] = useState<number | null>(null)

  const cycleStatus = (id: number) => {
    const order: TramiteStatus[] = ['pendiente', 'en-proceso', 'completado']
    setStatuses(prev => ({ ...prev, [id]: order[(order.indexOf(prev[id]) + 1) % order.length] }))
  }

  const completados   = Object.values(statuses).filter(s => s === 'completado').length
  const enProceso     = Object.values(statuses).filter(s => s === 'en-proceso').length
  const pct           = Math.round((completados / TRAMITES.length) * 100)
  const totalDias     = TRAMITES.reduce((sum, t) => sum + t.dias, 0)
  const altasPendientes = TRAMITES.filter(t => t.prioridad === 'alta' && statuses[t.id] !== 'completado').length

  // ── estado alertas ───────────────────────────────────────────────
  const [resolved, setResolved]         = useState<Set<string>>(new Set())
  const [expandedAlerta, setExpandedAlerta] = useState<string | null>(null)

  const toggleResolved = (id: string) =>
    setResolved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const criticos    = ALERTAS.filter(a => a.level === 'red'    && !resolved.has(a.id)).length
  const precauciones = ALERTAS.filter(a => a.level === 'yellow' && !resolved.has(a.id)).length
  const positivos   = ALERTAS.filter(a => a.level === 'green').length
  const resueltos   = resolved.size

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl flex items-center gap-2.5" style={{ fontFamily: '"Playfair Display","Georgia","Times New Roman",serif', fontWeight: 700, fontStyle: 'italic', color: 'var(--color-text)' }}>
          <FileText size={24} strokeWidth={2.2} />
          Cumplimiento legal
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Alertas de riesgo activas y checklist de trámites para apertura en Tijuana, B.C.
        </p>
      </motion.div>

      {/* Dark status box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <div className="dark-box rounded-2xl p-5 flex flex-wrap gap-x-10 gap-y-3 items-center">
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Trámites completados</p>
            <p className="text-2xl font-black dark-box-accent">{completados} <span className="text-sm font-normal dark-box-muted">/ {TRAMITES.length}</span></p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Avance</p>
            <p className="text-2xl font-black">{pct}%</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Alertas críticas</p>
            <p className="text-2xl font-black" style={{ color: criticos > 0 ? '#f87171' : '#4ade80' }}>{criticos}</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Tiempo estimado total</p>
            <p className="text-2xl font-black">{totalDias} <span className="text-sm font-normal dark-box-muted">días</span></p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 1 — ALERTAS DE RIESGO
      ══════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <SectionTitle label="1 · Alertas de riesgo" />
      </motion.div>

      {/* KPIs de alertas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Críticos pendientes', value: criticos,    colorVal: criticos    > 0 ? 'text-red-600'    : 'text-emerald-600', dot: 'bg-red-500'     },
          { label: 'Precauciones',         value: precauciones, colorVal: precauciones > 0 ? 'text-amber-600' : 'text-emerald-600', dot: 'bg-amber-400'   },
          { label: 'Factores positivos',   value: positivos,   colorVal: 'text-emerald-600',                                        dot: 'bg-emerald-500' },
          { label: 'Resueltos',            value: resueltos,   colorVal: resueltos   > 0 ? 'text-blue-600'   : 'text-gray-400',    dot: 'bg-blue-400'    },
        ].map(({ label, value, colorVal, dot }) => (
          <div key={label} className="card rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            </div>
            <span className={`text-2xl font-black ${colorVal}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Banner listo para abrir */}
      {criticos === 0 && precauciones === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center gap-3">
          <CheckCircle2 size={20} strokeWidth={2} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Sin alertas críticas ni precauciones pendientes — listo para abrir.</p>
        </motion.div>
      )}

      {/* Lista de alertas */}
      <div className="space-y-2.5">
        {ALERTAS.map((alert, i) => {
          const cfg        = ALERT_CONFIG[alert.level]
          const isResolved = resolved.has(alert.id)
          const isOpen     = expandedAlerta === alert.id

          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <div className={`rounded-2xl border transition-all ${isResolved ? 'opacity-40 bg-gray-100 border-gray-200' : `${cfg.bg} ${cfg.border}`}`}>

                {/* Fila de cabecera */}
                <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                  onClick={() => setExpandedAlerta(isOpen ? null : alert.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${isResolved ? 'bg-gray-300' : cfg.dot}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isResolved ? 'line-through text-gray-500' : cfg.titleText}`}>
                        {alert.title}
                      </p>
                      {!isOpen && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {alert.desc.length > 65 ? `${alert.desc.slice(0, 65)}…` : alert.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${isResolved ? 'bg-gray-100 text-gray-400' : `${cfg.badgeBg} ${cfg.badgeText}`}`}>
                      {isResolved ? 'Resuelto' : cfg.label}
                    </span>
                    <span className="text-sm transition-transform duration-200" style={{ color: 'var(--color-text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
                  </div>
                </div>

                {/* Detalle expandible */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{alert.desc}</p>
                        {alert.action && (
                          <div className="rounded-xl p-3" style={{ background: 'var(--color-input)', border: '1px solid var(--color-border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Qué hacer</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{alert.action}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {alert.link && (
                            <Link href={alert.link}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={e => e.stopPropagation()}>
                              {alert.linkLabel}
                            </Link>
                          )}
                          {alert.resolvable && (
                            <button
                              onClick={e => { e.stopPropagation(); toggleResolved(alert.id) }}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                isResolved
                                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                  : 'bg-green-900 text-green-400 hover:bg-green-800 border border-green-700'
                              }`}>
                              {isResolved ? '↩ Marcar como pendiente' : '✓ Marcar como resuelto'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 2 — CHECKLIST DE TRÁMITES
      ══════════════════════════════════════════════════════════════ */}
      <motion.div id="tramites" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <SectionTitle label="2 · Checklist de trámites" />
      </motion.div>

      {/* KPIs de trámites */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Completados',       value: `${completados}/${TRAMITES.length}`, colorVal: completados === TRAMITES.length ? 'text-emerald-600' : 'text-gray-700' },
          { label: 'En proceso',        value: enProceso,   colorVal: enProceso   > 0 ? 'text-amber-600' : 'text-gray-400' },
          { label: 'Prioridad alta',    value: altasPendientes, colorVal: altasPendientes > 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Tiempo estimado',   value: `~${totalDias}d`, colorVal: 'text-blue-600' },
        ].map(({ label, value, colorVal }) => (
          <div key={label} className="card rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            <span className={`text-2xl font-black ${colorVal}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Barra de progreso */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
        className="card rounded-2xl p-4">
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Avance general</span>
          <span className={pct === 100 ? 'text-emerald-600 font-semibold' : ''} style={pct !== 100 ? { color: 'var(--color-text-muted)' } : {}}>{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300'}`} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          En paralelo puede completarse en 20–25 días · Costo estimado: $3,200–8,500 MXN
        </p>
      </motion.div>

      {/* Timeline de trámites */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-[22px] top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />

        <div className="space-y-2.5">
          {TRAMITES.map((t, i) => {
            const s      = statuses[t.id]
            const cfg    = TRAMITE_STATUS[s]
            const isOpen = expandedTramite === t.id

            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}>
                <div
                  className="relative ml-10 rounded-2xl border transition-colors cursor-pointer card"
                  style={isOpen ? { background: 'var(--color-card-hover)', borderColor: 'var(--color-border-strong)' } : {}}
                  onClick={() => setExpandedTramite(isOpen ? null : t.id)}
                >
                  {/* Punto de timeline */}
                  <div className={`absolute -left-[26px] top-4 w-4 h-4 rounded-full ${cfg.dot}`} style={{ border: '2px solid var(--color-page)' }} />

                  {/* Fila de cabecera */}
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{t.id}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{t.nombre}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${PRIORIDAD_BADGE[t.prioridad]}`}>
                            {t.prioridad}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.dependencia} · ~{t.dias} día{t.dias !== 1 ? 's' : ''} · {t.costo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={e => { e.stopPropagation(); cycleStatus(t.id) }}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${cfg.cls}`}
                      >
                        {cfg.label}
                      </button>
                      <span className={`text-gray-500 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{t.descripcion}</p>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Requisitos</p>
                            <ul className="space-y-1.5">
                              {t.requisitos.map(r => (
                                <li key={r} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            {t.url && (
                              <a href={t.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                onClick={e => e.stopPropagation()}>
                                🔗 Portal oficial
                              </a>
                            )}
                            {/* Atajo a cambiar estado desde el detalle */}
                            <button
                              onClick={e => { e.stopPropagation(); cycleStatus(t.id) }}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                s === 'completado'
                                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}>
                              {s === 'completado' ? '↩ Revertir estado' : s === 'en-proceso' ? '✓ Marcar como completado' : '▶ Iniciar trámite'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
