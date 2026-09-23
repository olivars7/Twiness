'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const HeatmapLayer = dynamic(() => import('@/components/maps/HeatmapLayer'), { ssr: false })

const ZONES = [
  { name: 'Zona Río',         score: 82, color: 'bg-green-500' },
  { name: 'Centro Histórico', score: 68, color: 'bg-yellow-500' },
  { name: 'Playas',           score: 54, color: 'bg-yellow-500' },
  { name: 'La Mesa',          score: 61, color: 'bg-yellow-500' },
  { name: 'Otay',             score: 45, color: 'bg-red-500' },
]

export default function CiudadPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🗺️ Análisis de Ciudad / Zonas</h1>
        <p className="text-gray-500 text-sm mt-1">Índice de oportunidad por zona — Tijuana, B.C.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="green"  title="Mejor zona"        value="Zona Río"    description="Índice de oportunidad 82/100 para tu tipo de negocio." />
        <AnalysisCard color="yellow" title="Zonas analizadas"  value="5"           description="Comparando densidad poblacional, NSE y competencia." />
        <AnalysisCard color="blue"   title="Fuente de datos"   value="OSM + INEGI" description="Datos de OpenStreetMap e INEGI para Tijuana." />
      </div>

      {/* Zone ranking */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-white mb-2">Ranking de zonas por índice de oportunidad</p>
        {ZONES.sort((a, b) => b.score - a.score).map((z, i) => (
          <motion.div key={z.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">{z.name}</span>
              <span className="text-sm font-semibold text-gray-200">{z.score}/100</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${z.score}%` }} transition={{ duration: 0.6, delay: 0.1 * i }}
                className={`h-full rounded-full ${z.color}`} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <HeatmapLayer />
      </motion.div>
    </div>
  )
}
