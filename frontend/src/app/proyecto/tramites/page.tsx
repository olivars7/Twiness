'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

type Status = 'pendiente' | 'en-proceso' | 'completado'

interface Tramite {
  id: number
  nombre: string
  dependencia: string
  dias: number
  costo: string
  status: Status
  descripcion: string
  requisitos: string[]
  url?: string
}

const TRAMITES: Tramite[] = [
  {
    id: 1,
    nombre: 'Registro en el SAT (RFC)',
    dependencia: 'SAT',
    dias: 1,
    costo: 'Gratuito',
    status: 'pendiente',
    descripcion: 'Alta ante el Servicio de Administración Tributaria para obtener tu Registro Federal de Contribuyentes. Obligatorio para operar formalmente y emitir facturas.',
    requisitos: ['CURP', 'Identificación oficial vigente', 'Comprobante de domicilio fiscal', 'Correo electrónico activo'],
    url: 'https://www.sat.gob.mx',
  },
  {
    id: 2,
    nombre: 'Licencia de funcionamiento',
    dependencia: 'Ayuntamiento de Tijuana',
    dias: 15,
    costo: '$1,200–3,500',
    status: 'pendiente',
    descripcion: 'Permiso municipal que autoriza la operación del establecimiento comercial en el domicilio indicado. Es el trámite más importante antes de abrir.',
    requisitos: ['RFC activo', 'Contrato de arrendamiento o escritura del local', 'Croquis del establecimiento', 'Pago de derechos municipales', 'Dictamen de protección civil'],
    url: 'https://www.tijuana.gob.mx',
  },
  {
    id: 3,
    nombre: 'Dictamen de protección civil',
    dependencia: 'Dirección de Protección Civil TJ',
    dias: 10,
    costo: '$800–2,000',
    status: 'pendiente',
    descripcion: 'Verificación de que el local cumple con normas de seguridad: extintores, salidas de emergencia, señalización. Requerido para locales con acceso al público.',
    requisitos: ['Extintor vigente', 'Señalización de emergencia instalada', 'Botiquín de primeros auxilios', 'Plano del local con salidas marcadas'],
  },
  {
    id: 4,
    nombre: 'Permiso de uso de suelo',
    dependencia: 'Ayuntamiento de Tijuana',
    dias: 20,
    costo: '$600–1,500',
    status: 'pendiente',
    descripcion: 'Verifica que la actividad comercial que deseas realizar es compatible con la zonificación del predio. Evita problemas legales a futuro.',
    requisitos: ['Dirección exacta del local', 'Descripción del giro comercial', 'Identificación oficial', 'Pago de derechos'],
    url: 'https://www.tijuana.gob.mx',
  },
  {
    id: 5,
    nombre: 'Aviso de apertura COFEPRIS',
    dependencia: 'COFEPRIS',
    dias: 5,
    costo: 'Gratuito',
    status: 'pendiente',
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
    descripcion: 'Obligatorio si vas a contratar empleados. Debes registrarte como patrón y dar de alta a cada trabajador antes de su primer día laboral.',
    requisitos: ['RFC', 'CURP del representante legal', 'Comprobante de domicilio fiscal', 'Datos de los empleados a contratar'],
    url: 'https://www.imss.gob.mx',
  },
]

const STATUS_CONFIG: Record<Status, { label: string; cls: string; dot: string }> = {
  pendiente:    { label: 'Pendiente',   cls: 'bg-gray-800 text-gray-400 border border-gray-700',       dot: 'bg-gray-600'   },
  'en-proceso': { label: 'En proceso',  cls: 'bg-yellow-950 text-yellow-400 border border-yellow-800', dot: 'bg-yellow-400' },
  completado:   { label: 'Completado',  cls: 'bg-green-950 text-green-400 border border-green-800',    dot: 'bg-green-400'  },
}

export default function TramitesPage() {
  const [statuses, setStatuses] = useState<Record<number, Status>>(
    Object.fromEntries(TRAMITES.map(t => [t.id, t.status]))
  )
  const [expanded, setExpanded] = useState<number | null>(null)

  const cycle = (id: number) => {
    const order: Status[] = ['pendiente', 'en-proceso', 'completado']
    setStatuses(prev => {
      const next = order[(order.indexOf(prev[id]) + 1) % order.length]
      return { ...prev, [id]: next }
    })
  }

  const completed  = Object.values(statuses).filter(s => s === 'completado').length
  const inProgress = Object.values(statuses).filter(s => s === 'en-proceso').length
  const totalDias  = TRAMITES.reduce((sum, tr) => sum + tr.dias, 0)
  const pct        = Math.round((completed / TRAMITES.length) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🧾 Trámites y Permisos</h1>
        <p className="text-gray-500 text-sm mt-1">Ruta de apertura para tu negocio en Tijuana, B.C. — RETyS</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color={completed === TRAMITES.length ? 'green' : inProgress > 0 ? 'yellow' : 'blue'}
          title="Progreso" value={`${completed} / ${TRAMITES.length}`} description="Haz clic en el estado para actualizarlo." />
        <AnalysisCard color="blue"   title="Tiempo estimado" value={`~${totalDias} días`} description="En paralelo puede completarse en 20–25 días." />
        <AnalysisCard color="yellow" title="Costo aproximado" value="$3,200–8,500" description="Rangos estimados en MXN para Tijuana." />
      </div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Avance general</span>
          <span className={pct === 100 ? 'text-green-400 font-semibold' : 'text-gray-400'}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-yellow-500' : 'bg-gray-600'}`} />
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-800" />

        <div className="space-y-3">
          {TRAMITES.map((t, i) => {
            const s = statuses[t.id]
            const cfg = STATUS_CONFIG[s]
            const isOpen = expanded === t.id

            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
              >
                {/* Row */}
                <div
                  className={`relative ml-10 rounded-2xl border transition-colors cursor-pointer
                    ${isOpen ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[26px] top-4 w-4 h-4 rounded-full border-2 border-gray-950 ${cfg.dot}`} />

                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-600 text-xs font-bold w-4 shrink-0">{t.id}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{t.nombre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.dependencia} · ~{t.dias} días · {t.costo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={e => { e.stopPropagation(); cycle(t.id) }}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${cfg.cls}`}
                      >
                        {cfg.label}
                      </button>
                      <span className={`text-gray-500 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </div>

                  {/* Expandable detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-700">
                          <p className="text-sm text-gray-300 leading-relaxed">{t.descripcion}</p>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requisitos</p>
                            <ul className="space-y-1.5">
                              {t.requisitos.map(r => (
                                <li key={r} className="flex items-start gap-2 text-sm text-gray-400">
                                  <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {t.url && (
                            <a href={t.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              🔗 Ir al portal oficial
                            </a>
                          )}
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
