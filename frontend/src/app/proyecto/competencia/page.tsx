'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'
import type { CompetitorSnapshot } from '@/types/analysis'

const MOCK_COMPETITORS: CompetitorSnapshot[] = [
  { id: '1', name: 'Café Revolución', distance: 120, rating: 4.2, reviewCount: 310, businessType: 'Cafetería', lat: 32.515, lng: -117.038, openNow: true, source: 'google_places' },
  { id: '2', name: 'El Buen Café',    distance: 280, rating: 3.8, reviewCount: 145, businessType: 'Cafetería', lat: 32.516, lng: -117.039, openNow: true, source: 'google_places' },
  { id: '3', name: 'Starbucks Río',   distance: 450, rating: 4.5, reviewCount: 892, businessType: 'Cafetería', lat: 32.514, lng: -117.040, openNow: true, source: 'google_places' },
  { id: '4', name: 'Café Aroma',      distance: 600, rating: 4.0, reviewCount: 210, businessType: 'Cafetería', lat: 32.517, lng: -117.037, openNow: false, source: 'google_places' },
]

const colorDot = (r?: number) => {
  if (!r) return 'bg-gray-600'
  if (r >= 4.2) return 'bg-green-400'
  if (r >= 3.5) return 'bg-yellow-400'
  return 'bg-red-400'
}

export default function CompetenciaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">⚔️ Análisis de Competencia</h1>
        <p className="text-gray-500 text-sm mt-1">Negocios similares en un radio de 800 m</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="yellow" title="Competidores cercanos" value={MOCK_COMPETITORS.length} description="Negocios del mismo tipo en radio 800 m." />
        <AnalysisCard color="green"  title="Rating promedio zona" value="4.1 ★" description="Oportunidad de diferenciarse por calidad de servicio." />
        <AnalysisCard color="blue"   title="Brecha detectada" value="Horario nocturno" description="Ningún competidor abre después de las 9 pm." />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-5 py-3 text-gray-500 font-medium">Nombre</th>
              <th className="px-5 py-3 text-gray-500 font-medium">Distancia</th>
              <th className="px-5 py-3 text-gray-500 font-medium">Rating</th>
              <th className="px-5 py-3 text-gray-500 font-medium">Reseñas</th>
              <th className="px-5 py-3 text-gray-500 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COMPETITORS.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
                className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                <td className="px-5 py-3 text-gray-400">{c.distance} m</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${colorDot(c.rating)}`} />
                    <span className="text-gray-200">{c.rating} ★</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400">{c.reviewCount?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.openNow ? 'bg-green-950 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {c.openNow ? 'Abierto' : 'Cerrado'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
