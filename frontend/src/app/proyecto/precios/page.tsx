'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const MARKET_PRICES = [
  { name: 'Café Revolución', product: 'Café americano',   price: 45, yours: false },
  { name: 'El Buen Café',    product: 'Café americano',   price: 38, yours: false },
  { name: 'Starbucks Río',   product: 'Café americano',   price: 72, yours: false },
  { name: 'Café Aroma',      product: 'Café americano',   price: 42, yours: false },
  { name: 'Tu precio',       product: 'Café americano',   price: 50, yours: true  },
]

const avg = Math.round(MARKET_PRICES.filter(p => !p.yours).reduce((s, p) => s + p.price, 0) / MARKET_PRICES.filter(p => !p.yours).length)
const maxPrice = Math.max(...MARKET_PRICES.map(p => p.price))

export default function PreciosPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">💲 Inteligencia de Precios</h1>
        <p className="text-gray-500 text-sm mt-1">Comparador de precios del mercado y posicionamiento</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="blue"   title="Precio promedio mercado" value={`$${avg}`}    description="Promedio de competidores en radio 800 m." />
        <AnalysisCard color="green"  title="Tu posicionamiento"      value="Medio-alto"   description="Tu precio está 11% sobre el promedio del mercado." />
        <AnalysisCard color="yellow" title="Precio máximo zona"       value={`$${maxPrice}`} description="Starbucks lidera el segmento premium local." />
      </div>

      {/* Price comparison bars */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-white mb-4">Comparador — Café americano</p>
        {MARKET_PRICES.map((item, i) => (
          <motion.div key={item.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${item.yours ? 'text-blue-400' : 'text-gray-300'}`}>
                {item.name} {item.yours && '← tú'}
              </span>
              <span className="text-sm text-gray-400">${item.price}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.price / maxPrice) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className={`h-full rounded-full ${item.yours ? 'bg-blue-500' : 'bg-gray-600'}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
