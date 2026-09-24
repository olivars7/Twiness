'use client'

import { motion } from 'framer-motion'
import { TrendingUp, DollarSign } from 'lucide-react'
import AnalysisCard from '@/components/ui/AnalysisCard'
import DemandCurve from '@/components/charts/DemandCurve'
import DataBadge from '@/components/ui/DataBadge'

// ─── Datos de precios ────────────────────────────────────────────
const MARKET_PRICES = [
  { name: 'Café Revolución', product: 'Café americano', price: 45, yours: false },
  { name: 'El Buen Café',    product: 'Café americano', price: 38, yours: false },
  { name: 'Starbucks Río',   product: 'Café americano', price: 72, yours: false },
  { name: 'Café Aroma',      product: 'Café americano', price: 42, yours: false },
  { name: 'Tu precio',       product: 'Café americano', price: 50, yours: true  },
]

const avg      = Math.round(MARKET_PRICES.filter(p => !p.yours).reduce((s, p) => s + p.price, 0) / MARKET_PRICES.filter(p => !p.yours).length)
const maxPrice = Math.max(...MARKET_PRICES.map(p => p.price))

// ─── Separador de sección (igual al de ubicacion/page.tsx) ───────
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────
export default function MercadoPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
              <TrendingUp size={24} strokeWidth={2.2} />
              <span>Demanda</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>&</span>
              <DollarSign size={24} strokeWidth={2.2} />
              <span>Precios</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Estimación del mercado potencial e inteligencia de precios de la zona
            </p>
          </div>
          <DataBadge type="estimacion" label="INEGI · Google Places" />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 1 — DEMANDA
      ══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <SectionTitle label="1 · Mercado y demanda" />
      </motion.div>

      {/* Tarjetas de demanda */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <AnalysisCard
          color="green"
          title="Mercado potencial"
          value="~3,200 personas"
          description="Población activa en radio de 800 m con perfil de cliente objetivo."
        />
        <AnalysisCard
          color="yellow"
          title="Elasticidad precio"
          value="Media"
          description="Consumidores sensibles a precio en rango $40–$80."
        />
        <AnalysisCard
          color="blue"
          title="Cuota estimada"
          value="2–5%"
          description="Captura realista del 2–5% del mercado en los primeros 6 meses."
        />
      </motion.div>

      {/* Curva Oferta-Demanda */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <DemandCurve />
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          DIVISOR
      ══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <SectionTitle label="2 · Inteligencia de precios" />
      </motion.div>

      {/* Tarjetas de precios */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <AnalysisCard
          color="blue"
          title="Precio promedio mercado"
          value={`$${avg}`}
          description="Promedio de competidores en radio 800 m."
        />
        <AnalysisCard
          color="green"
          title="Tu posicionamiento"
          value="Medio-alto"
          description="Tu precio está 11% sobre el promedio del mercado."
        />
        <AnalysisCard
          color="yellow"
          title="Precio máximo zona"
          value={`$${maxPrice}`}
          description="Starbucks lidera el segmento premium local."
        />
      </motion.div>

      {/* Comparador de barras */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="card rounded-2xl p-5 space-y-4"
      >
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Comparador — Café americano
        </p>
        {MARKET_PRICES.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: item.yours ? '#3b82f6' : 'var(--color-text)' }}
              >
                {item.name} {item.yours && '← tú'}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                ${item.price}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.price / maxPrice) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  background: item.yours ? '#3b82f6' : 'var(--color-text)',
                }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
