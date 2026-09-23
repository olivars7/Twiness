'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProjectStore } from '@/store/projectStore'

const HeatmapLayer = dynamic(() => import('@/components/maps/HeatmapLayer'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 flex items-center justify-center" style={{ height: '500px' }}>
      <LoadingSpinner size="lg" />
    </div>
  ),
})

interface Zone {
  name: string
  score: number
  color: string
  detail: string
  coords: [number, number]
}

const ZONES: Zone[] = [
  { name: 'Zona Río',         score: 82, color: 'bg-green-500',  coords: [32.5309, -117.0189], detail: 'Alta densidad comercial, NSE medio-alto, flujo vehicular constante y buena visibilidad de locales.' },
  { name: 'Centro Histórico', score: 68, color: 'bg-yellow-500', coords: [32.5320, -117.0382], detail: 'Tráfico peatonal elevado pero alta competencia. NSE mixto. Ideal para precios accesibles.' },
  { name: 'La Mesa',          score: 61, color: 'bg-yellow-500', coords: [32.5000, -116.9600], detail: 'Zona residencial consolidada. Competencia moderada y clientela leal. Menos tráfico de paso.' },
  { name: 'Playas',           score: 54, color: 'bg-yellow-500', coords: [32.5089, -117.1200], detail: 'Demanda estacional alta en verano. Fuera de temporada el flujo cae significativamente.' },
  { name: 'Otay',             score: 45, color: 'bg-red-500',    coords: [32.5424, -116.9750], detail: 'Zona industrial en desarrollo. Baja densidad residencial y poca afluencia de consumidores finales.' },
]

const SORTED_ZONES = [...ZONES].sort((a, b) => b.score - a.score)

export default function CiudadPage() {
  const project = useProjectStore((s) => s.project)
  const city = project?.location?.city ?? 'Tijuana, B.C.'
  const bestZone = SORTED_ZONES[0]

  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const selected = ZONES.find((z) => z.name === selectedZone) ?? null

  const handleZoneClick = (name: string) => {
    setSelectedZone((prev) => (prev === name ? null : name))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🗺️ Análisis de Ciudad / Zonas</h1>
        <p className="text-gray-500 text-sm mt-1">Índice de oportunidad por zona — {city}</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="green"  title="Mejor zona"       value={bestZone.name}      description={`Índice de oportunidad ${bestZone.score}/100 para tu tipo de negocio.`} />
        <AnalysisCard color="yellow" title="Zonas analizadas" value={ZONES.length}        description="Comparando densidad poblacional, NSE y competencia." />
        <AnalysisCard color="blue"   title="Fuente de datos"  value="OSM + INEGI"         description={`Datos de OpenStreetMap e INEGI para ${city}.`} />
      </div>

      {/* Zone ranking */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <p className="text-sm font-semibold text-white mb-2">Ranking de zonas por índice de oportunidad</p>
        {SORTED_ZONES.map((z, i) => {
          const isSelected = selectedZone === z.name
          return (
            <motion.div
              key={z.name}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}
              onClick={() => handleZoneClick(z.name)}
              className={`cursor-pointer rounded-xl p-3 transition-colors ${isSelected ? 'bg-gray-800 ring-1 ring-gray-600' : 'hover:bg-gray-800/50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{z.name}</span>
                <span className="text-sm font-semibold text-gray-200">{z.score}/100</span>
              </div>
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${z.score}%` }} transition={{ duration: 0.6, delay: 0.1 * i }}
                  className={`h-full rounded-full ${z.color}`}
                />
              </div>
            </motion.div>
          )
        })}

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl bg-gray-800 border border-gray-700 p-4">
                <p className="text-sm font-semibold text-white mb-1">{selected.name} — {selected.score}/100</p>
                <p className="text-sm text-gray-400">{selected.detail}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <HeatmapLayer selectedZone={selectedZone} zones={ZONES} />
      </motion.div>
    </div>
  )
}
