'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

type Status = 'pendiente' | 'en-proceso' | 'completado'

interface Tramite {
  id: number
  nombre: string
  dependencia: string
  dias: number
  costo: string
  status: Status
}

const TRAMITES: Tramite[] = [
  { id: 1, nombre: 'Registro en el SAT (RFC)',              dependencia: 'SAT',             dias: 1,  costo: 'Gratuito',    status: 'pendiente' },
  { id: 2, nombre: 'Licencia de funcionamiento',            dependencia: 'Ayuntamiento TJ', dias: 15, costo: '$1,200–3,500', status: 'pendiente' },
  { id: 3, nombre: 'Dictamen de protección civil',          dependencia: 'Protección Civil', dias: 10, costo: '$800–2,000',  status: 'pendiente' },
  { id: 4, nombre: 'Permiso de uso de suelo',               dependencia: 'Ayuntamiento TJ', dias: 20, costo: '$600–1,500',  status: 'pendiente' },
  { id: 5, nombre: 'Aviso de apertura COFEPRIS (alimentos)', dependencia: 'COFEPRIS',        dias: 5,  costo: 'Gratuito',    status: 'pendiente' },
  { id: 6, nombre: 'Registro IMSS (si tienes empleados)',   dependencia: 'IMSS',            dias: 3,  costo: 'Gratuito',    status: 'pendiente' },
]

const statusLabel: Record<Status, { label: string; cls: string }> = {
  pendiente:    { label: 'Pendiente',    cls: 'bg-gray-800 text-gray-400' },
  'en-proceso': { label: 'En proceso',   cls: 'bg-yellow-950 text-yellow-400' },
  completado:   { label: 'Completado',   cls: 'bg-green-950 text-green-400' },
}

export default function TramitesPage() {
  const [statuses, setStatuses] = useState<Record<number, Status>>(
    Object.fromEntries(TRAMITES.map(t => [t.id, t.status]))
  )

  const cycle = (id: number) => {
    const order: Status[] = ['pendiente', 'en-proceso', 'completado']
    setStatuses(prev => {
      const cur = prev[id]
      const next = order[(order.indexOf(cur) + 1) % order.length]
      return { ...prev, [id]: next }
    })
  }

  const completed = Object.values(statuses).filter(s => s === 'completado').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🧾 Trámites y Permisos</h1>
        <p className="text-gray-500 text-sm mt-1">Ruta de apertura para tu negocio en Tijuana, B.C. — RETyS</p>
      </motion.div>

      {/* Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color={completed === TRAMITES.length ? 'green' : 'yellow'} title="Trámites completados" value={`${completed} / ${TRAMITES.length}`} description="Haz clic en el estado para actualizarlo." />
        <AnalysisCard color="blue"   title="Tiempo estimado total" value={`${TRAMITES.reduce((s, t) => s + t.dias, 0)} días`} description="Suma de tiempos en paralelo puede ser menor." />
        <AnalysisCard color="yellow" title="Costo aproximado" value="$3,200–8,500" description="Rango estimado para todos los trámites de apertura." />
      </div>

      {/* Tramites list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {TRAMITES.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
            className="flex items-center justify-between px-5 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600 font-bold w-5 text-center">{t.id}</span>
              <div>
                <p className="text-sm font-medium text-white">{t.nombre}</p>
                <p className="text-xs text-gray-500">{t.dependencia} · ~{t.dias} días · {t.costo}</p>
              </div>
            </div>
            <button onClick={() => cycle(t.id)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${statusLabel[statuses[t.id]].cls}`}>
              {statusLabel[statuses[t.id]].label}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
