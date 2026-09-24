'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import AnalysisCard from '@/components/ui/AnalysisCard'
import ImprovementCard from '@/components/ui/ImprovementCard'
import DataBadge from '@/components/ui/DataBadge'
import type { CompetitorSnapshot } from '@/types/analysis'

const CompetitorMap = dynamic(() => import('@/components/maps/CompetitorMap'), { ssr: false })

// ─── Paleta dark-blue ─────────────────────────────────────────────────────────
// bg principal:   #0f172a  (slate-900)
// superficie:     #1e293b  (slate-800)
// borde:          #334155  (slate-700)
// texto primario: #f1f5f9  (slate-100)
// texto muted:    #94a3b8  (slate-400)
// acento azul:    #38bdf8  (sky-400)
// verde señal:    #4ade80  (green-400)
// amarillo señal: #fbbf24  (amber-400)
// rojo señal:     #f87171  (red-400)

// ─── Tooltip de información ───────────────────────────────────────────────────
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-default"
        aria-label="Más información"
      >
        i
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 z-[9999]
              bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5
              text-xs text-slate-300 leading-relaxed shadow-xl pointer-events-none"
          >
            {text}
            {/* flecha */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

// ─── Datos ───────────────────────────────────────────────────────────────────
const USER_LOCATION = { lat: 20.6597, lng: -100.4270, name: 'Mi Cafetería (El Refugio)' }
const RADIOS = [250, 500, 800, 1000] as const
type Radio = typeof RADIOS[number]

const ALL_COMPETITORS: CompetitorSnapshot[] = [
  { id: '1', name: 'Café Punta del Cielo', distance: 180,  rating: 4.1, reviewCount: 430,  businessType: 'Cafetería', lat: 20.6610, lng: -100.4255, openNow: true,  source: 'google_places' },
  { id: '2', name: 'Starbucks Refugio',    distance: 320,  rating: 4.4, reviewCount: 1820, businessType: 'Cafetería', lat: 20.6582, lng: -100.4290, openNow: true,  source: 'google_places' },
  { id: '3', name: 'Café Mundano',         distance: 490,  rating: 3.7, reviewCount:  88,  businessType: 'Cafetería', lat: 20.6618, lng: -100.4300, openNow: false, source: 'google_places' },
  { id: '4', name: 'Oh! Café',             distance: 650,  rating: 4.0, reviewCount: 215,  businessType: 'Cafetería', lat: 20.6575, lng: -100.4245, openNow: true,  source: 'google_places' },
  { id: '5', name: 'Café Vienés',          distance: 820,  rating: 3.5, reviewCount:  52,  businessType: 'Cafetería', lat: 20.6630, lng: -100.4260, openNow: false, source: 'google_places' },
  { id: '6', name: 'Negro Café',           distance: 950,  rating: 4.3, reviewCount: 340,  businessType: 'Cafetería', lat: 20.6560, lng: -100.4310, openNow: true,  source: 'google_places' },
]

// ─── Saturación ───────────────────────────────────────────────────────────────
function calcSaturation(competitors: CompetitorSnapshot[], radioM: number) {
  const radioKm = radioM / 1000
  const area = Math.PI * radioKm * radioKm
  const density = competitors.length / area
  let color: 'green' | 'yellow' | 'red'
  let label: string
  let pct: number
  if (density < 2)      { color = 'green';  label = 'Baja';  pct = Math.min((density / 2) * 30, 30) }
  else if (density < 5) { color = 'yellow'; label = 'Media'; pct = 30 + ((density - 2) / 3) * 35 }
  else                  { color = 'red';    label = 'Alta';  pct = Math.min(65 + ((density - 5) / 5) * 35, 98) }
  return { density: +density.toFixed(2), color, label, pct }
}

// ─── Ventajas ────────────────────────────────────────────────────────────────
function detectAdvantages(competitors: CompetitorSnapshot[]) {
  const list: { icon: string; title: string; detail: string }[] = []
  const weakest = [...competitors].sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))[0]
  if (weakest?.rating && weakest.rating < 4.0)
    list.push({ icon: '⭐', title: 'Diferenciación por calidad',
      detail: `${weakest.name} tiene solo ${weakest.rating}★ con ${weakest.reviewCount} reseñas — es el competidor más vulnerable. Un servicio consistente te da ventaja directa.` })
  const closed = competitors.filter((c) => !c.openNow)
  if (closed.length > 0)
    list.push({ icon: '🕐', title: 'Gap de horario detectado',
      detail: `${closed.length} de ${competitors.length} competidores están cerrados ahora. Un horario extendido captura esa demanda insatisfecha.` })
  const lowReviews = competitors.filter((c) => (c.reviewCount ?? 999) < 100)
  if (lowReviews.length > 0)
    list.push({ icon: '📱', title: 'Baja presencia digital en la zona',
      detail: `${lowReviews.length} competidor(es) tienen menos de 100 reseñas. Con Google Maps activo desde el día 1 puedes superarlos rápidamente.` })
  return list
}

// ─── Dot rating ──────────────────────────────────────────────────────────────
const ratingDotColor = (r?: number) => {
  if (!r) return 'bg-slate-600'
  if (r >= 4.2) return 'bg-green-400'
  if (r >= 3.5) return 'bg-amber-400'
  return 'bg-red-400'
}

// ─── Card contenedor (dark) ───────────────────────────────────────────────────
function Card({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-slate-800 border border-slate-700 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function CompetenciaPage() {
  const [radio, setRadio] = useState<Radio>(800)

  const competitors = ALL_COMPETITORS.filter((c) => c.distance <= radio)
  const avgRating = competitors.length
    ? +(competitors.reduce((s, c) => s + (c.rating ?? 0), 0) / competitors.length).toFixed(1)
    : 0
  const saturation = calcSaturation(competitors, radio)
  const advantages = detectAdvantages(competitors)

  const ratingChartData = [
    ...competitors.map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
      rating: c.rating ?? 0,
      isUser: false,
    })),
    { name: 'Tu meta', rating: 4.5, isUser: true },
  ]

  const satColor = { green: '#4ade80', yellow: '#fbbf24', red: '#f87171' }[saturation.color]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6 p-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-100">⚔️ Análisis de Competencia</h1>
            <p className="text-slate-400 text-sm mt-1">Cafetería · El Refugio, Querétaro</p>
          </div>
          <DataBadge type="dato" label="Google Places" />
        </motion.div>

        {/* ── Selector de radio ────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {RADIOS.map((r) => (
            <button key={r} onClick={() => setRadio(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                ${radio === r
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-sky-500 hover:text-sky-400'}`}>
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </button>
          ))}
        </div>

        {/* ── Tarjetas resumen ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnalysisCard
            color={saturation.color}
            title="Competidores en radio"
            value={`${competitors.length} negocios`}
            description={`Densidad: ${saturation.density} neg/km² · ${saturation.label}`}
          />
          <AnalysisCard
            color={avgRating >= 4.2 ? 'red' : avgRating >= 3.8 ? 'yellow' : 'green'}
            title="Rating promedio zona"
            value={`${avgRating} ★`}
            description={avgRating < 4.0
              ? 'Oportunidad de diferenciarse por calidad.'
              : 'Zona competitiva — diferénciate en otro factor.'}
          />
          <AnalysisCard
            color="blue"
            title="Competidor más cercano"
            value={competitors[0] ? `${competitors[0].distance} m` : '—'}
            description={competitors[0] ? `${competitors[0].name} · ${competitors[0].rating}★` : 'Sin competidores'}
          />
        </div>

        {/* ── Índice de saturación ─────────────────────────────────────────── */}
        <Card delay={0.1} className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-200">Índice de Saturación de Mercado</p>
              <InfoTooltip text="Mide cuántos negocios del mismo tipo hay por km² dentro del radio. Fórmula: N competidores ÷ (π × radio_km²). Menos de 2 neg/km² es baja competencia, más de 5 es mercado saturado." />
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black" style={{ color: satColor }}>{saturation.density}</span>
              <span className="text-xs text-slate-500 ml-1">neg/km²</span>
              <p className="text-xs font-semibold mt-0.5" style={{ color: satColor }}>{saturation.label}</p>
            </div>
          </div>

          {/* Barra gradiente + indicador animado */}
          <div className="relative w-full h-3 rounded-full">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(to right, #4ade80 0%, #fbbf24 50%, #f87171 100%)' }} />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 shadow-lg z-10"
              style={{ borderColor: satColor }}
              initial={{ left: '0%' }}
              animate={{ left: `calc(${saturation.pct}% - 8px)` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span className="text-green-400">Baja &lt; 2</span>
            <span className="text-amber-400">Media 2–5</span>
            <span className="text-red-400">Alta &gt; 5</span>
          </div>
        </Card>

        {/* ── Gráfica de ratings ────────────────────────────────────────────── */}
        <Card delay={0.15} className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-semibold text-slate-200">Comparación de Ratings</p>
            <InfoTooltip text="Ratings obtenidos de Google Places. La barra azul muestra tu meta. La línea punteada marca el umbral de 4.0★ — por debajo de ese valor un negocio es considerado mejorable por los usuarios." />
            <span className="text-xs text-sky-400 ml-auto">■ Tu meta</span>
            <span className="text-xs text-amber-400">■ Competencia</span>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(160, ratingChartData.length * 38)}>
            <BarChart data={ratingChartData} layout="vertical" margin={{ left: 4, right: 36, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
              <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={120} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#1e293b' }}
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 11,
                  color: '#f1f5f9',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
                itemStyle={{ color: '#f1f5f9', fontSize: 11, padding: 0 }}
                labelStyle={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}
                formatter={(v, _name, props) => {
                  const color = props.payload?.isUser ? '#38bdf8' : '#fbbf24'
                  return [
                    <span key="v" style={{ color, fontWeight: 700 }}>{`${v} ★`}</span>,
                    ''
                  ]
                }}
              />
              <ReferenceLine x={4} stroke="#475569" strokeDasharray="4 4"
                label={{ value: '4.0★', fontSize: 10, fill: '#64748b', position: 'right' }} />
              <Bar dataKey="rating" radius={[0, 6, 6, 0]}>
                {ratingChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isUser ? '#38bdf8' : '#fbbf24'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Mapa ─────────────────────────────────────────────────────────── */}
        <Card delay={0.2}>
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-200">Mapa de competidores</p>
              <InfoTooltip text="El círculo muestra el radio de análisis seleccionado. Pin azul = tu negocio. Pins rojos = competidores. Haz clic en un pin para ver su detalle." />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>🔵 Tu negocio</span>
              <span>🔴 Competencia</span>
            </div>
          </div>
          {/* overflow-hidden solo en el contenedor del mapa, no en el header */}
          <div className="overflow-hidden rounded-b-2xl">
            <CompetitorMap userLocation={USER_LOCATION} competitors={competitors} radioMeters={radio} />
          </div>
        </Card>

        {/* ── Tabla ────────────────────────────────────────────────────────── */}
        <Card delay={0.25}>
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-200">Detalle de competidores</p>
              <InfoTooltip text="Datos obtenidos de Google Places API. El rating y número de reseñas son los valores publicados en Google Maps al momento del análisis." />
            </div>
            <DataBadge type="dato" label="Google Places" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-left">
                {['Nombre', 'Distancia', 'Rating', 'Reseñas', 'Estado'].map((h) => (
                  <th key={h} className="px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">
                    Sin competidores en {radio} m
                  </td>
                </tr>
              ) : competitors.map((c, i) => (
                <motion.tr key={c.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 * i }}
                  className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">{c.name}</td>
                  <td className="px-5 py-3 text-slate-400">{c.distance} m</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ratingDotColor(c.rating)}`} />
                      <span className="text-slate-300">{c.rating} ★</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{c.reviewCount?.toLocaleString('en-US')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${c.openNow
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-slate-700 text-slate-500 border border-slate-600'}`}>
                      {c.openNow ? 'Abierto' : 'Cerrado'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ── Ventaja potencial ─────────────────────────────────────────────── */}
        {advantages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-300">🎯 Tu ventaja potencial</p>
              <InfoTooltip text="Detectado automáticamente comparando rating, horario y presencia digital de los competidores en el radio seleccionado." />
            </div>
            {advantages.map((a, i) => (
              <div key={i}
                className="flex gap-4 p-4 bg-slate-800 border border-slate-700 rounded-2xl hover:border-sky-500/40 transition-colors">
                <span className="text-2xl shrink-0">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{a.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{a.detail}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Tarjeta azul de mejora ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <ImprovementCard
            title="Acción recomendada"
            action={`${competitors.filter(c => !c.openNow).length > 0
              ? `${competitors.filter(c => !c.openNow).length} competidor(es) no cubre el horario completo. `
              : ''}${competitors.filter(c => (c.reviewCount ?? 999) < 150).length > 0
              ? `${competitors.filter(c => (c.reviewCount ?? 999) < 150).length} competidor(es) tienen baja presencia digital. `
              : ''}Abre con horario extendido y solicita reseñas activamente desde el día 1 — puedes aparecer en el top 3 de Google Maps local en 60–90 días.`}
          />
        </motion.div>

      </div>
    </div>
  )
}
