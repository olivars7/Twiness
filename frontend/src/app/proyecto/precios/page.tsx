'use client'

import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
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
        <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
          <DollarSign size={24} strokeWidth={2.2} />
          Inteligencia de Precios
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Comparador de precios del mercado y posicionamiento</p>
      </motion.div>

      {/* Dark positioning box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="dark-box rounded-2xl p-5 flex flex-wrap gap-x-10 gap-y-3 items-center">
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Promedio del mercado</p>
            <p className="text-2xl font-black">${avg} <span className="text-sm font-normal dark-box-muted">MXN</span></p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Tu precio</p>
            <p className="text-2xl font-black dark-box-accent">$50 <span className="text-sm font-normal dark-box-muted">MXN</span></p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Posicionamiento</p>
            <p className="text-sm font-semibold">Medio-alto — +11% sobre la media</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-0.5">Rango competitivo</p>
            <p className="text-sm font-semibold">$38 – $72 MXN</p>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="blue"   title="Precio promedio mercado" value={`$${avg}`}    description="Promedio de competidores en radio 800 m." />
        <AnalysisCard color="green"  title="Tu posicionamiento"      value="Medio-alto"   description="Tu precio está 11% sobre el promedio del mercado." />
        <AnalysisCard color="yellow" title="Precio máximo zona"       value={`$${maxPrice}`} description="Starbucks lidera el segmento premium local." />
      </div>

      {/* Price comparison bars */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Comparador — Café americano</p>
        {MARKET_PRICES.map((item, i) => (
          <motion.div key={item.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: item.yours ? '#3b82f6' : 'var(--color-text)' }}>
                {item.name} {item.yours && '← tú'}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>${item.price}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.price / maxPrice) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                style={{ height: '100%', borderRadius: '9999px', background: item.yours ? '#3b82f6' : 'var(--color-text)' }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
