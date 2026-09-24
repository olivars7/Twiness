'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AlertLevel = 'red' | 'yellow' | 'green' | 'blue'

interface Alert {
  id: string
  level: AlertLevel
  title: string
  desc: string
  action?: string       // qué hacer para resolverlo
  link?: string         // ruta interna o externa relacionada
  linkLabel?: string
  resolvable: boolean   // si se puede marcar como resuelta
}

// ─── Config de nivel ──────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<AlertLevel, {
  label: string; dot: string; bg: string; border: string
  badgeBg: string; badgeText: string; titleText: string
}> = {
  red:    { label: 'Crítico',   dot: 'bg-red-400',    bg: 'bg-red-950/60',    border: 'border-red-800',    badgeBg: 'bg-red-900',    badgeText: 'text-red-400',    titleText: 'text-red-200'    },
  yellow: { label: 'Precaución',dot: 'bg-yellow-400', bg: 'bg-yellow-950/60', border: 'border-yellow-800', badgeBg: 'bg-yellow-900', badgeText: 'text-yellow-400', titleText: 'text-yellow-200' },
  green:  { label: 'Positivo',  dot: 'bg-green-400',  bg: 'bg-green-950/60',  border: 'border-green-800',  badgeBg: 'bg-green-900',  badgeText: 'text-green-400',  titleText: 'text-green-200'  },
  blue:   { label: 'Sugerencia',dot: 'bg-blue-400',   bg: 'bg-blue-950/60',   border: 'border-blue-800',   badgeBg: 'bg-blue-900',   badgeText: 'text-blue-400',   titleText: 'text-blue-200'   },
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

const ALERTS: Alert[] = [
  {
    id: 'licencia',
    level: 'red',
    title: 'Sin licencia de funcionamiento',
    desc: 'Operar sin licencia puede resultar en clausura inmediata por parte del Ayuntamiento. Es el trámite prioritario antes de abrir.',
    action: 'Tramitar en el Ayuntamiento de Tijuana. Requiere RFC, contrato del local y dictamen de protección civil.',
    link: '/proyecto/tramites',
    linkLabel: 'Ver trámites →',
    resolvable: true,
  },
  {
    id: 'proteccion',
    level: 'red',
    title: 'Sin dictamen de protección civil',
    desc: 'Obligatorio para todo establecimiento con afluencia de público. Sin él no puedes obtener la licencia de funcionamiento.',
    action: 'Solicitar inspección a la Dirección de Protección Civil de Tijuana. Necesitas extintor, señalización y plano del local.',
    link: '/proyecto/tramites',
    linkLabel: 'Ver trámites →',
    resolvable: true,
  },
  {
    id: 'rfc',
    level: 'yellow',
    title: 'RFC pendiente de activar',
    desc: 'Necesitas RFC activo para emitir facturas, registrar empleados en el IMSS y operar formalmente ante el SAT.',
    action: 'Registrarte en sat.gob.mx con tu CURP e identificación oficial. El trámite es gratuito y tarda 1 día.',
    resolvable: true,
  },
  {
    id: 'flujo',
    level: 'yellow',
    title: 'Flujo de caja negativo los primeros 2 meses',
    desc: 'Es normal en la etapa de apertura, pero debes contar con una reserva mínima de 3 meses de gastos fijos antes de abrir.',
    action: 'Asegura una reserva de $105,000 MXN (3 × $35,000 gastos fijos). Revisa el simulador de escenarios para planificar.',
    link: '/proyecto/escenarios',
    linkLabel: 'Ver simulador →',
    resolvable: false,
  },
  {
    id: 'fondo',
    level: 'blue',
    title: 'Considera un fondo de emergencia',
    desc: 'Más allá del capital inicial, tener $15,000–$20,000 MXN separados para imprevistos (equipo dañado, retrasos en permisos) reduce el riesgo operativo.',
    action: 'Abre una cuenta de ahorro separada exclusiva para emergencias del negocio antes de tu fecha de apertura.',
    resolvable: false,
  },
  {
    id: 'demanda',
    level: 'green',
    title: 'Zona con alta demanda detectada',
    desc: 'Tu área tiene un índice de oportunidad de 82/100. Alta densidad de clientes potenciales y baja saturación en horario nocturno.',
    link: '/proyecto/ciudad',
    linkLabel: 'Ver análisis de ciudad →',
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

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EscudoPage() {
  const [resolved, setResolved] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) =>
    setResolved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const criticos  = ALERTS.filter(a => a.level === 'red'    && !resolved.has(a.id)).length
  const precaucion = ALERTS.filter(a => a.level === 'yellow' && !resolved.has(a.id)).length
  const positivos  = ALERTS.filter(a => a.level === 'green').length
  const resueltos  = resolved.size

  const SUMMARY = [
    { label: 'Críticos pendientes',   value: criticos,   colorVal: criticos   > 0 ? 'text-red-400'    : 'text-green-400', dot: 'bg-red-400'    },
    { label: 'Precauciones',          value: precaucion, colorVal: precaucion > 0 ? 'text-yellow-400' : 'text-green-400', dot: 'bg-yellow-400' },
    { label: 'Factores positivos',    value: positivos,  colorVal: 'text-green-400',                                      dot: 'bg-green-400'  },
    { label: 'Resueltos',             value: resueltos,  colorVal: resueltos  > 0 ? 'text-blue-400'   : 'text-gray-500',  dot: 'bg-blue-400'   },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🛡️ Escudo del Emprendedor</h1>
        <p className="text-gray-500 text-sm mt-1">Alertas de riesgo, verificación y recomendaciones</p>
      </motion.div>

      {/* Summary row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUMMARY.map(({ label, value, colorVal, dot }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <span className={`text-2xl font-black ${colorVal}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Status bar */}
      {criticos === 0 && precaucion === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-green-950 border border-green-800 rounded-2xl px-5 py-3 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="text-sm text-green-300 font-medium">Sin alertas críticas ni precauciones pendientes — listo para abrir.</p>
        </motion.div>
      )}

      {/* Alerts list */}
      <div className="space-y-3">
        {ALERTS.map((alert, i) => {
          const cfg = LEVEL_CONFIG[alert.level]
          const isResolved = resolved.has(alert.id)
          const isOpen = expanded === alert.id

          return (
            <motion.div key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className={`rounded-2xl border transition-all ${isResolved ? 'opacity-50 bg-gray-900 border-gray-800' : `${cfg.bg} ${cfg.border}`}`}>

                {/* Row header */}
                <div
                  className="flex items-center justify-between px-4 py-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${isResolved ? 'bg-gray-600' : cfg.dot}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isResolved ? 'line-through text-gray-500' : cfg.titleText}`}>
                        {alert.title}
                      </p>
                      {!isOpen && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {alert.desc.length > 60 ? `${alert.desc.slice(0, 60)}…` : alert.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${isResolved ? 'bg-gray-800 text-gray-600' : `${cfg.badgeBg} ${cfg.badgeText}`}`}>
                      {isResolved ? 'Resuelto' : cfg.label}
                    </span>
                    <span className={`text-gray-500 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/10">
                        <p className="text-sm text-gray-300 leading-relaxed">{alert.desc}</p>

                        {alert.action && (
                          <div className="bg-black/20 rounded-xl p-3">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Qué hacer</p>
                            <p className="text-sm text-gray-300">{alert.action}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {alert.link && (
                            <a href={alert.link}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              {alert.linkLabel}
                            </a>
                          )}
                          {alert.resolvable && (
                            <button
                              onClick={e => { e.stopPropagation(); toggle(alert.id) }}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                                ${isResolved
                                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                  : 'bg-green-900 text-green-400 hover:bg-green-800 border border-green-700'
                                }`}
                            >
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

    </div>
  )
}
