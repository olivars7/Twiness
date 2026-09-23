'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const InteractiveMap = dynamic(() => import('@/components/maps/InteractiveMap'), { ssr: false })

const CARDS = [
  { color: 'green' as const,  title: 'Densidad poblacional',  value: 'Alta',     description: 'Zona Río cuenta con alta concentración de trabajadores y estudiantes.' },
  { color: 'yellow' as const, title: 'Tráfico peatonal',      value: 'Medio',    description: 'Flujo moderado. Pico entre 12–2 pm y 6–8 pm según datos OSM.' },
  { color: 'blue' as const,   title: 'Zona recomendada',      value: 'Zona Río', description: 'Alta actividad comercial y acceso a múltiples modos de transporte.' },
]

export default function UbicacionPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-white">📍 Inteligencia de Ubicación</h1>
        <p className="text-gray-500 text-sm mt-1">Análisis geográfico del área seleccionada — Tijuana, B.C.</p>
      </motion.div>

      {/* Analysis cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <AnalysisCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <InteractiveMap />
      </motion.div>
    </div>
  )
}
