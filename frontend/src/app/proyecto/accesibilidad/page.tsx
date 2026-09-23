'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const TRANSPORT_DATA = [
  { mode: '🚗 Automóvil',       pct: 55, color: 'bg-blue-500' },
  { mode: '🚌 Transporte público', pct: 28, color: 'bg-yellow-500' },
  { mode: '🚶 Peatonal',         pct: 12, color: 'bg-green-500' },
  { mode: '🚲 Bicicleta',        pct: 5,  color: 'bg-purple-500' },
]

export default function AccesibilidadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🚶 Tráfico y Accesibilidad</h1>
        <p className="text-gray-500 text-sm mt-1">Modos de transporte y flujo peatonal en tu zona</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="green"  title="Accesibilidad general" value="Media-alta" description="Tu ubicación es accesible por 3 modos de transporte." />
        <AnalysisCard color="yellow" title="Tráfico peatonal"      value="12%"        description="Bajo flujo peatonal — negocio más orientado a autos." />
        <AnalysisCard color="blue"   title="Estacionamiento"       value="Disponible" description="Zona Río cuenta con estacionamientos en calle y en edificios." />
      </div>

      {/* Transport bars */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <p className="text-sm font-semibold text-white mb-2">Distribución por modo de transporte</p>
        {TRANSPORT_DATA.map((t, i) => (
          <motion.div key={t.mode} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-300">{t.mode}</span>
              <span className="text-sm font-semibold text-gray-200">{t.pct}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${t.pct}%` }}
                transition={{ duration: 0.7, delay: 0.1 * i }}
                className={`h-full rounded-full ${t.color}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
