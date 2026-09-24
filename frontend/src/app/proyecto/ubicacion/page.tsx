'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ImprovementCard from '@/components/ui/ImprovementCard'
import DataBadge from '@/components/ui/DataBadge'
import { useProjectStore } from '@/store/projectStore'
import type { CompetitorSnapshot } from '@/types/analysis'

const InteractiveMap = dynamic(() => import('@/components/maps/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 flex items-center justify-center" style={{ height: 340 }}>
      <LoadingSpinner size="lg" />
    </div>
  ),
})

const HeatmapLayer = dynamic(() => import('@/components/maps/HeatmapLayer'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 flex items-center justify-center" style={{ height: 300 }}>
      <LoadingSpinner size="lg" />
    </div>
  ),
})

const CompetitorMap = dynamic(() => import('@/components/maps/CompetitorMap'), {
  ssr: false,
})

// ═══════════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════════

const RADIUS_OPTIONS = [
  { label: '250 m', value: 250 },
  { label: '500 m', value: 500 },
  { label: '1 km',  value: 1000 },
]

const COMP_RADIOS = [250, 500, 800, 1000] as const
type CompRadio = (typeof COMP_RADIOS)[number]

interface Factor { label: string; score: number; tooltip: string }
const FACTORS: Factor[] = [
  {
    label: 'Tráfico peatonal',
    score: 72,
    tooltip: 'Número estimado de personas que pasan frente al local por hora según datos de movilidad OSM. ≥70 = favorable para negocios de alta frecuencia.',
  },
  {
    label: 'Acceso vehicular',
    score: 85,
    tooltip: 'Evalúa disponibilidad de estacionamiento, facilidad de acceso desde avenidas principales y señalización. ≥70 = buenas condiciones de acceso.',
  },
  {
    label: 'Competidores cercanos',
    score: 48,
    tooltip: 'Inverso de saturación: a más competidores en el radio, menor puntuación. <50 = alta competencia, recomendado diferenciarse claramente.',
  },
  {
    label: 'Nivel socioeconómico',
    score: 66,
    tooltip: 'NSE promedio de los hogares en radio 800 m según INEGI. ≥70 = NSE C+/AB con mayor capacidad de gasto discrecional.',
  },
]

interface SafetyFactor { label: string; level: 'bajo' | 'medio' | 'alto'; detail: string; tooltip: string }
const SAFETY_FACTORS: SafetyFactor[] = [
  {
    label: 'Seguridad pública',
    level: 'medio',
    detail: 'Zona con incidentes moderados. Recomendado: cámara y cerradura reforzada.',
    tooltip: 'Índice basado en reportes del C4 Tijuana y datos de SESNSP. "Precaución" = entre 3 y 8 incidentes mensuales promedio en un radio de 500 m.',
  },
  {
    label: 'Alumbrado público',
    level: 'alto',
    detail: 'Calle bien iluminada, reduce riesgo nocturno.',
    tooltip: 'Porcentaje de luminarias funcionales en el tramo frente al local según OOMAPAS. "Favorable" = >85 % de luminarias operativas.',
  },
  {
    label: 'Infraestructura vial',
    level: 'alto',
    detail: 'Banquetas y calles en buen estado.',
    tooltip: 'Condición de banquetas, pavimento y accesos medida por el índice de calidad vial del Municipio de Tijuana. "Favorable" = sin baches ni obstáculos en la acera.',
  },
  {
    label: 'Riesgo de inundación',
    level: 'bajo',
    detail: 'Alto riesgo en temporada de lluvias (Protección Civil TJ).',
    tooltip: 'Clasificación de riesgo hídrico de CENAPRED y Protección Civil Tijuana. "Riesgo" = zona en cañada o depresión topográfica sujeta a escurrimientos en lluvia.',
  },
  {
    label: 'Servicios de emergencia',
    level: 'alto',
    detail: 'Cruz Roja y hospital a <2 km. Tiempo de respuesta ~8 min.',
    tooltip: 'Distancia al centro de salud, estación de bomberos y Cruz Roja más cercanos. Tiempo de respuesta estimado basado en trayecto vehicular en hora valle.',
  },
  {
    label: 'Suministro eléctrico',
    level: 'alto',
    detail: 'Red estable. Historial bajo de apagones.',
    tooltip: 'Frecuencia de interrupciones de servicio de CFE en la colonia durante los últimos 12 meses. "Favorable" = menos de 2 interrupciones >30 min por mes.',
  },
]

interface Zone { name: string; score: number; color: string; detail: string; coords: [number, number]; tooltip: string }
const ZONES: Zone[] = [
  {
    name: 'Zona Río',
    score: 82, color: 'bg-green-500',
    coords: [32.5309, -117.0189],
    detail: 'Alta densidad comercial, NSE medio-alto, flujo vehicular constante.',
    tooltip: 'Índice calculado ponderando densidad poblacional (30 %), NSE (25 %), tráfico vehicular (25 %) y disponibilidad de locales (20 %) según OSM e INEGI.',
  },
  {
    name: 'Centro Histórico',
    score: 68, color: 'bg-yellow-500',
    coords: [32.5320, -117.0382],
    detail: 'Tráfico peatonal elevado pero alta competencia. NSE mixto.',
    tooltip: 'Zona con fuerte componente turístico y comercio tradicional. Alta competencia baja el índice pese al tránsito peatonal elevado.',
  },
  {
    name: 'La Mesa',
    score: 61, color: 'bg-yellow-500',
    coords: [32.5000, -116.9600],
    detail: 'Zona residencial consolidada. Clientela leal, menos tráfico de paso.',
    tooltip: 'Zona madura con base de clientes estable pero crecimiento limitado. Menor tráfico de paso reduce la visibilidad para negocios nuevos.',
  },
  {
    name: 'Playas',
    score: 54, color: 'bg-yellow-500',
    coords: [32.5089, -117.1200],
    detail: 'Demanda estacional alta en verano, cae fuera de temporada.',
    tooltip: 'Fuerte estacionalidad turística: índice en temporada alta puede superar 75, pero cae a ~35 en invierno. Riesgoso para flujos de caja constantes.',
  },
  {
    name: 'Otay',
    score: 45, color: 'bg-red-500',
    coords: [32.5424, -116.9750],
    detail: 'Zona industrial. Baja densidad residencial y poca afluencia.',
    tooltip: 'Predominio de uso industrial y logístico. La demanda de consumo final es baja. Recomendado solo para negocios B2B o servicios a empresas.',
  },
]
const SORTED_ZONES = [...ZONES].sort((a, b) => b.score - a.score)

const USER_LOCATION = { lat: 32.4701, lng: -116.9742, name: 'Mi negocio (Laurel 1, Tijuana)' }

const ALL_COMPETITORS: CompetitorSnapshot[] = [
  { id: '1', name: 'Café Baja Blend',   distance: 180,  rating: 4.1, reviewCount: 210, businessType: 'Cafetería', lat: 32.4714, lng: -116.9725, openNow: true,  source: 'google_places' },
  { id: '2', name: 'Café de Olla TJ',   distance: 320,  rating: 3.7, reviewCount: 74,  businessType: 'Cafetería', lat: 32.4688, lng: -116.9760, openNow: false, source: 'google_places' },
  { id: '3', name: 'Latte & Co.',        distance: 490,  rating: 4.0, reviewCount: 165, businessType: 'Cafetería', lat: 32.4720, lng: -116.9775, openNow: true,  source: 'google_places' },
  { id: '4', name: 'Café Frontera',      distance: 650,  rating: 3.5, reviewCount: 41,  businessType: 'Cafetería', lat: 32.4683, lng: -116.9718, openNow: false, source: 'google_places' },
  { id: '5', name: 'Espresso Tijuana',   distance: 820,  rating: 4.3, reviewCount: 290, businessType: 'Cafetería', lat: 32.4730, lng: -116.9705, openNow: true,  source: 'google_places' },
  { id: '6', name: 'Starbucks Laureles', distance: 950,  rating: 4.5, reviewCount: 860, businessType: 'Cafetería', lat: 32.4675, lng: -116.9790, openNow: true,  source: 'google_places' },
]

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function scoreColor(s: number)     { return s >= 70 ? 'bg-emerald-500' : s >= 40 ? 'bg-amber-400' : 'bg-red-500' }
function scoreTextColor(s: number) { return s >= 70 ? 'text-emerald-600' : s >= 40 ? 'text-amber-600' : 'text-red-600' }

function safetyMeta(level: SafetyFactor['level']) {
  if (level === 'alto')  return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Favorable',  score: 85 }
  if (level === 'medio') return { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border border-amber-200',       label: 'Precaución', score: 55 }
  return                        { bar: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border border-red-200',             label: 'Riesgo',     score: 25 }
}

function overallScore() {
  const factorAvg = FACTORS.reduce((s, f) => s + f.score, 0) / FACTORS.length
  const safetyAvg = SAFETY_FACTORS.reduce((s, f) => s + safetyMeta(f.level).score, 0) / SAFETY_FACTORS.length
  return Math.round(factorAvg * 0.6 + safetyAvg * 0.4)
}
function overallLabel(score: number) {
  if (score >= 70) return { text: 'Zona apta para operar',    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 45) return { text: 'Zona con áreas de mejora', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' }
  return                   { text: 'Zona de alto riesgo',     color: 'text-red-600',     bg: 'bg-red-50 border-red-200' }
}

function calcSaturation(competitors: CompetitorSnapshot[], radioM: number) {
  const radioKm = radioM / 1000
  const area = Math.PI * radioKm * radioKm
  const density = competitors.length / area
  if (density < 2) return { density: +density.toFixed(2), color: 'green' as const, label: 'Baja',  pct: Math.min((density / 2) * 30, 30) }
  if (density < 5) return { density: +density.toFixed(2), color: 'yellow' as const, label: 'Media', pct: 30 + ((density - 2) / 3) * 35 }
  return                   { density: +density.toFixed(2), color: 'red' as const,   label: 'Alta',  pct: Math.min(65 + ((density - 5) / 5) * 35, 98) }
}

function detectAdvantages(competitors: CompetitorSnapshot[]) {
  const list: { icon: string; title: string; detail: string }[] = []
  const weakest = [...competitors].sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))[0]
  if (weakest?.rating && weakest.rating < 4.0)
    list.push({ icon: '⭐', title: 'Diferenciación por calidad', detail: `${weakest.name} tiene solo ${weakest.rating}★ — el competidor más vulnerable. Un servicio consistente te da ventaja directa.` })
  const closed = competitors.filter((c) => !c.openNow)
  if (closed.length > 0)
    list.push({ icon: '🕐', title: 'Gap de horario detectado', detail: `${closed.length} de ${competitors.length} competidores están cerrados ahora. Horario extendido captura esa demanda.` })
  const lowReviews = competitors.filter((c) => (c.reviewCount ?? 999) < 100)
  if (lowReviews.length > 0)
    list.push({ icon: '📱', title: 'Baja presencia digital en la zona', detail: `${lowReviews.length} competidor(es) con <100 reseñas. Con Google Maps activo desde el día 1 puedes superarlos en 60–90 días.` })
  return list
}

const ratingDotColor = (r?: number) => {
  if (!r) return 'bg-slate-600'
  if (r >= 4.2) return 'bg-green-400'
  if (r >= 3.5) return 'bg-amber-400'
  return 'bg-red-400'
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════════

/** Burbuja "i" con popover al hacer hover */
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center shrink-0">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors cursor-default"
        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}
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
            transition={{ duration: 0.14 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-[9999] rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-xl pointer-events-none"
            style={{ background: 'var(--color-card-dark)', border: '1px solid var(--color-card-dark-border)', color: '#e4e4e7' }}
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: 'var(--color-card-dark-border)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

/** Barra de progreso animada */
function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  return (
    <div className="h-2 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--color-border)' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 0.55, delay }}
        className={`h-full rounded-full ${scoreColor(score)}`}
      />
    </div>
  )
}

/** Separador de sección con título */
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

export default function ZonaEstrategicaPage() {
  const { project, updateProject, setProject } = useProjectStore()
  const city = project?.location?.city ?? 'Tijuana, B.C.'

  // estado ubicacion
  const [pendingLocation, setPendingLocation] = useState<[number, number] | null>(null)
  const [locRadius, setLocRadius] = useState(500)
  const [confirmed, setConfirmed] = useState(false)

  // estado zonas
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  // estado competencia
  const [compRadio, setCompRadio] = useState<CompRadio>(800)

  const handleLocationSelect = (lat: number, lng: number) => { setPendingLocation([lat, lng]); setConfirmed(false) }
  const handleConfirm = () => {
    if (!pendingLocation) return
    const [lat, lng] = pendingLocation
    const loc = { lat, lng, city, zone: undefined }
    if (project) updateProject({ location: loc })
    else setProject({ businessType: '', profile: { description: '', location: loc }, location: loc })
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2500)
  }

  const competitors = ALL_COMPETITORS.filter((c) => c.distance <= compRadio)
  const avgRating    = competitors.length ? +(competitors.reduce((s, c) => s + (c.rating ?? 0), 0) / competitors.length).toFixed(1) : 0
  const saturation   = calcSaturation(competitors, compRadio)
  const advantages   = detectAdvantages(competitors)
  const satColorHex  = { green: '#4ade80', yellow: '#fbbf24', red: '#f87171' }[saturation.color]
  const ratingChartData = [
    ...competitors.map((c) => ({ name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name, rating: c.rating ?? 0, isUser: false })),
    { name: 'Tu meta', rating: 4.5, isUser: true },
  ]

  const overall     = overallScore()
  const overallInfo = overallLabel(overall)
  const selected    = ZONES.find((z) => z.name === selectedZone) ?? null

  const { alerts, wins } = (() => {
    const alerts: { icon: string; text: string; fix: string; color: string }[] = []
    const wins: { icon: string; text: string }[] = []
    for (const f of FACTORS) {
      if (f.label === 'Competidores cercanos' && f.score < 50)
        alerts.push({ icon: '🏪', text: 'Alta competencia en tu radio.', fix: 'Diferencia con producto exclusivo, mejor servicio o precio.', color: 'border-red-700 bg-red-950' })
      else if (f.label === 'Tráfico peatonal' && f.score < 50)
        alerts.push({ icon: '🚶', text: 'Bajo tránsito en la zona.', fix: 'Refuerza con redes sociales, Google Maps y delivery.', color: 'border-red-700 bg-red-950' })
      else if (f.label === 'Nivel socioeconómico' && f.score < 50)
        alerts.push({ icon: '🏘️', text: 'Poder adquisitivo limitado.', fix: 'Ajusta ticket promedio con opciones accesibles.', color: 'border-yellow-700 bg-yellow-950' })
      if (f.score >= 70) wins.push({ icon: '✅', text: `${f.label} favorable (${f.score}/100)` })
    }
    for (const s of SAFETY_FACTORS) {
      if (s.level === 'bajo') alerts.push({ icon: '⚠️', text: `Riesgo: ${s.label}.`, fix: s.detail, color: 'border-red-700 bg-red-950' })
    }
    return { alerts, wins }
  })()

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
              <MapPin size={24} strokeWidth={2.2} />
              Zona estratégica
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {city} · Análisis integral de ubicación, infraestructura, zonas y competencia
            </p>
          </div>
          <DataBadge type="estimacion" label="OSM · INEGI · Google Places" />
        </div>
      </motion.div>

      {/* ── PUNTUACIÓN GLOBAL — dark box ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
      >
        <div className="dark-box rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs dark-box-muted">Aptitud general de la zona</p>
              <InfoTooltip text="Promedio ponderado de factores comerciales (60 %) y factores de seguridad e infraestructura (40 %). Escala 0–100; ≥70 = zona apta." />
            </div>
            <p className="text-lg font-bold">{overallInfo.text}</p>
            <p className="text-xs mt-1 dark-box-muted">Basado en {FACTORS.length} factores comerciales y {SAFETY_FACTORS.length} de infraestructura</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-5xl font-black dark-box-accent">{overall}</p>
            <p className="text-xs dark-box-muted">/100</p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 1 — FACTORES COMERCIALES Y DE INFRAESTRUCTURA
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <SectionTitle label="1 · Factores del entorno" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Factores comerciales — card blanca */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
          className="card rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Factores comerciales</p>
            <InfoTooltip text="Indicadores que afectan directamente el flujo de clientes y la viabilidad comercial del local. Fuente: OpenStreetMap, INEGI, datos de movilidad." />
          </div>
          {FACTORS.map((f, i) => (
            <div key={f.label}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{f.label}</span>
                  <InfoTooltip text={f.tooltip} />
                </div>
                <span className={`text-xs font-bold shrink-0 ${scoreTextColor(f.score)}`}>{f.score}/100</span>
              </div>
              <ScoreBar score={f.score} delay={0.09 + 0.05 * i} />
            </div>
          ))}
        </motion.div>

        {/* Seguridad e infraestructura — dark box */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
        >
          <div className="dark-box rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid #1f1f1f' }}>
              <p className="text-sm font-semibold">Seguridad e infraestructura</p>
              <InfoTooltip text="Condiciones externas que afectan la operación diaria y la percepción de seguridad de clientes y empleados. Fuente: C4 Tijuana, CFE, Protección Civil, Municipio." />
            </div>
            {SAFETY_FACTORS.map((f, i) => {
              const m = safetyMeta(f.level)
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm truncate">{f.label}</span>
                      <InfoTooltip text={f.tooltip} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${m.badge}`}>{m.label}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mt-1.5" style={{ background: '#1f1f1f' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${m.score}%` }}
                      transition={{ duration: 0.55, delay: 0.11 + 0.05 * i }}
                      className={`h-full rounded-full ${m.bar}`}
                    />
                  </div>
                  <p className="text-xs mt-1 dark-box-muted">{f.detail}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

      </div>

      {/* Modos de transporte */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Modos de acceso al local</p>
          <InfoTooltip text="Distribución estimada de cómo llegan los clientes a negocios en esta zona según datos de movilidad de OSM y INEGI. Afecta directamente la estrategia de parking, señalización y delivery." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {([
            { mode: 'Automóvil',          pct: 55, color: 'bg-blue-500',   tooltip: 'La mayoría de clientes en Colonia Laurel llega en auto. Asegura visibilidad desde la calle y referencia de estacionamiento cercano.' },
            { mode: 'Transporte público', pct: 28, color: 'bg-yellow-500', tooltip: 'Rutas de camión urbano (SITRANSPE) con parada a <300 m. Señalización hacia el local desde la parada más cercana es clave.' },
            { mode: 'Peatonal',           pct: 12, color: 'bg-green-500',  tooltip: 'Bajo flujo peatonal espontáneo. Negocio orientado principalmente a clientela habitual y de destino, no de paso.' },
            { mode: 'Bicicleta',          pct: 5,  color: 'bg-purple-500', tooltip: 'Uso ciclista menor al promedio de la ciudad. No es necesario invertir en ciclopuerto como prioridad inmediata.' },
          ] as const).map(({ mode, pct, color, tooltip }, i) => (
            <div key={mode}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{mode}</span>
                  <InfoTooltip text={tooltip} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.65, delay: 0.12 + 0.07 * i }}
                  className={`h-full rounded-full ${color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alertas + puntos a favor */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="card rounded-2xl p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Alertas y cómo resolverlas</p>
          <InfoTooltip text="Factores del entorno cuya puntuación indica riesgo o área de mejora. Cada alerta incluye una acción concreta para mitigar el impacto." />
        </div>
        {alerts.length === 0 && <p className="text-sm text-emerald-600">Sin riesgos críticos detectados en esta zona.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alerts.map((a, i) => (
            <div key={i} className="rounded-xl border p-4"
              style={a.color.includes('red') ? { borderColor: '#fca5a5', background: '#fef2f2' } : { borderColor: '#fde68a', background: '#fffbeb' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{a.text}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{a.fix}</p>
            </div>
          ))}
          {wins.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-emerald-700 mb-2">Puntos a tu favor</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {wins.map((w) => <p key={w.text} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{w.text}</p>)}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 2 — MAPA Y ZONAS DE OPORTUNIDAD
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionTitle label="2 · Mapa y zonas de oportunidad" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Mapa interactivo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
          className="card rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-text)' }}>Ubicar mi negocio</p>
              <InfoTooltip text="Haz clic en el mapa para fijar la ubicación exacta del local. El círculo muestra el radio de influencia estimado. La ubicación se guarda en tu proyecto." />
            </div>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setLocRadius(opt.value)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={locRadius === opt.value
                    ? { background: 'var(--color-accent)', color: 'var(--color-accent-fg)' }
                    : { background: 'var(--color-input)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
                  }>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <InteractiveMap center={pendingLocation ?? undefined} radius={locRadius} onLocationSelect={handleLocationSelect} />
          </div>
          <AnimatePresence>
            {pendingLocation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="px-4 pb-4"
              >
                <button onClick={handleConfirm} disabled={confirmed}
                  className="w-full mt-2 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  style={confirmed
                    ? { background: '#d1fae5', color: '#065f46', cursor: 'default' }
                    : { background: 'var(--color-accent)', color: 'var(--color-accent-fg)' }
                  }>
                  {confirmed ? 'Ubicación guardada' : `Confirmar (${pendingLocation[0].toFixed(4)}, ${pendingLocation[1].toFixed(4)})`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ranking de zonas */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}
          className="card rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Índice de oportunidad por zona</p>
              <InfoTooltip text="Ranking de zonas de Tijuana según su potencial para tu tipo de negocio. El índice pondera densidad poblacional, NSE, tráfico y competencia. Fuente: OSM + INEGI." />
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>OSM + INEGI</span>
          </div>

          {SORTED_ZONES.map((z, i) => (
            <div key={z.name}
              onClick={() => setSelectedZone(prev => prev === z.name ? null : z.name)}
                className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors"
                style={selectedZone === z.name
                  ? { background: 'var(--color-input)', outline: '1px solid var(--color-border-strong)' }
                  : {}
                }
                onMouseEnter={e => { if (selectedZone !== z.name) (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)' }}
                onMouseLeave={e => { if (selectedZone !== z.name) (e.currentTarget as HTMLElement).style.background = '' }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{z.name}</span>
                  <InfoTooltip text={z.tooltip} />
                </div>
                <span className={`text-xs font-bold shrink-0 ${scoreTextColor(z.score)}`}>{z.score}/100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${z.score}%` }}
                  transition={{ duration: 0.55, delay: 0.05 * i }}
                  className={`h-full rounded-full ${z.color}`} />
              </div>
            </div>
          ))}

          <AnimatePresence>
            {selected && (
              <motion.div key={selected.name}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="overflow-hidden">
                <div className="mt-1 rounded-xl p-4" style={{ background: 'var(--color-input)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{selected.name} — {selected.score}/100</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{selected.detail}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mapa de calor */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Mapa de calor por zona</p>
          <InfoTooltip text="Visualización geoespacial del índice de oportunidad de cada zona de Tijuana. Tonos más cálidos = mayor oportunidad comercial. Haz clic en una zona del ranking para resaltarla." />
        </div>
        <HeatmapLayer selectedZone={selectedZone} zones={ZONES} />
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3 — ANÁLISIS DE COMPETENCIA
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
        <SectionTitle label="3 · Análisis de competencia" />
      </motion.div>

      {/* Radio selector + KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="space-y-4"
      >
        {/* Radio */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Radio de análisis</p>
            <InfoTooltip text="El radio define el área circular alrededor de tu negocio donde se cuentan los competidores. A mayor radio, más negocios incluidos pero menor relevancia de los más lejanos." />
          </div>
          <div className="flex gap-2 flex-wrap">
            {COMP_RADIOS.map((r) => (
              <button key={r} onClick={() => setCompRadio(r)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition"
                style={compRadio === r
                  ? { background: 'var(--color-accent)', color: 'var(--color-accent-fg)', borderColor: 'var(--color-accent)' }
                  : { background: 'var(--color-card)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                }>
                {r >= 1000 ? `${r / 1000} km` : `${r} m`}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards — 3 en una fila */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Competidores */}
          <div className="card rounded-2xl p-4"
            style={saturation.color === 'green' ? { borderColor: '#6ee7b7', background: '#ecfdf5' } :
                   saturation.color === 'yellow' ? { borderColor: '#fcd34d', background: '#fffbeb' } :
                   { borderColor: '#fca5a5', background: '#fef2f2' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Competidores en radio</p>
              <InfoTooltip text="Negocios del mismo giro comercial dentro del radio seleccionado, según datos de Google Places. Solo se cuentan establecimientos activos." />
            </div>
            <p className={`text-2xl font-black ${scoreTextColor(saturation.color === 'green' ? 80 : saturation.color === 'yellow' ? 55 : 30)}`}>
              {competitors.length} negocios
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Densidad: {saturation.density} neg/km² · {saturation.label}</p>
          </div>

          {/* Rating promedio */}
          <div className="card rounded-2xl p-4"
            style={avgRating >= 4.2 ? { borderColor: '#fca5a5', background: '#fef2f2' } :
                   avgRating >= 3.8 ? { borderColor: '#fcd34d', background: '#fffbeb' } :
                   { borderColor: '#6ee7b7', background: '#ecfdf5' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Rating promedio de la zona</p>
              <InfoTooltip text="Promedio de estrellas de los competidores en el radio. Rating alto = mercado exigente donde la calidad es el diferenciador. Rating bajo = oportunidad de sobresalir fácilmente." />
            </div>
            <p className={`text-2xl font-black ${avgRating >= 4.2 ? 'text-red-400' : avgRating >= 3.8 ? 'text-yellow-400' : 'text-green-400'}`}>
              {avgRating} ★
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {avgRating < 4.0 ? 'Oportunidad de diferenciarse por calidad.' : 'Zona competitiva — diferénciate en otro factor.'}
            </p>
          </div>

          {/* Más cercano */}
          <div className="card rounded-2xl p-4" style={{ borderColor: '#93c5fd', background: '#eff6ff' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Competidor más cercano</p>
              <InfoTooltip text="El negocio del mismo giro que está a menor distancia lineal de tu ubicación. La distancia real puede ser mayor por la trama urbana." />
            </div>
            <p className="text-2xl font-black" style={{ color: '#3b82f6' }}>
              {competitors[0] ? `${competitors[0].distance} m` : '—'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {competitors[0] ? `${competitors[0].name} · ${competitors[0].rating}★` : 'Sin competidores en este radio'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Saturación + gráfica de ratings en fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Índice de saturación */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
          className="card rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Índice de saturación</p>
              <InfoTooltip text="Mide cuántos negocios del mismo tipo hay por km² dentro del radio. Fórmula: N ÷ (π × r²). <2 neg/km² = baja competencia; >5 = mercado saturado." />
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black" style={{ color: satColorHex }}>{saturation.density}</span>
              <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>neg/km²</span>
              <p className="text-xs font-semibold mt-0.5" style={{ color: satColorHex }}>{saturation.label}</p>
            </div>
          </div>
          <div className="relative w-full h-3 rounded-full">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)' }} />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-lg z-10"
              style={{ background: 'var(--color-card)' }}
              style={{ borderColor: satColorHex }}
              initial={{ left: '0%' }} animate={{ left: `calc(${saturation.pct}% - 8px)` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-emerald-600">Baja &lt; 2</span>
            <span className="text-amber-600">Media 2–5</span>
            <span className="text-red-600">Alta &gt; 5</span>
          </div>
        </motion.div>

        {/* Gráfica de ratings */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}
          className="card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Comparación de ratings</p>
            <InfoTooltip text="Ratings de Google Places de cada competidor. La barra negra es tu meta (4.5★). La línea punteada marca 4.0★ — umbral mínimo para no perder clientes por calificación." />
            <span className="text-xs ml-auto" style={{ color: 'var(--color-text)' }}>■ Tu meta</span>
            <span className="text-xs text-amber-600">■ Competencia</span>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(150, ratingChartData.length * 36)}>
            <BarChart data={ratingChartData} layout="vertical" margin={{ left: 4, right: 36, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} width={110} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'var(--color-card-hover)' }}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'var(--color-text)' }}
                formatter={(v, _n, props) => {
                  const color = props.payload?.isUser ? 'var(--color-text)' : '#f59e0b'
                  return [<span key="v" style={{ color, fontWeight: 700 }}>{`${v} ★`}</span>, '']
                }} />
              <ReferenceLine x={4} stroke="var(--color-border-strong)" strokeDasharray="4 4"
                label={{ value: '4.0★', fontSize: 10, fill: 'var(--color-text-muted)', position: 'right' }} />
              <Bar dataKey="rating" radius={[0, 6, 6, 0]}>
                {ratingChartData.map((entry, i) => <Cell key={i} fill={entry.isUser ? 'var(--color-text)' : '#f59e0b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Mapa de competidores */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Mapa de competidores</p>
            <InfoTooltip text="El círculo muestra el radio de análisis. Pin azul = tu negocio. Pins rojos = competidores. Haz clic en un pin para ver el detalle del competidor." />
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span>🔵 Tu negocio</span>
            <span>🔴 Competencia</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-b-2xl">
          <CompetitorMap userLocation={USER_LOCATION} competitors={competitors} radioMeters={compRadio} />
        </div>
      </motion.div>

      {/* Tabla de competidores */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Detalle de competidores</p>
            <InfoTooltip text="Datos de Google Places API: nombre, distancia lineal desde tu ubicación, rating, número de reseñas y estado de apertura al momento del análisis." />
          </div>
          <DataBadge type="dato" label="Google Places" />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: 'var(--color-input)', borderBottom: '1px solid var(--color-border)' }}>
              {['Nombre', 'Distancia', 'Rating', 'Reseñas', 'Estado'].map((h) => (
                <th key={h} className="px-5 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin competidores en {compRadio} m</td></tr>
            ) : (
              competitors.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 * i }}
                  className="transition-colors last:border-0"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--color-text-secondary)' }}>{c.distance} m</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ratingDotColor(c.rating)}`} />
                      <span style={{ color: 'var(--color-text)' }}>{c.rating} ★</span>
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--color-text-secondary)' }}>{c.reviewCount?.toLocaleString('en-US')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.openNow ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {c.openNow ? 'Abierto' : 'Cerrado'}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 4 — VENTAJA POTENCIAL Y ACCIÓN
      ══════════════════════════════════════════════════════════════════════ */}
      {advantages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SectionTitle label="4 · Tu ventaja potencial" />
        </motion.div>
      )}

      {advantages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Detectado automáticamente al comparar rating, horario y presencia digital de los competidores.</p>
            <InfoTooltip text="El algoritmo detecta brechas explotables comparando los datos de todos los competidores en el radio: rating más bajo que 4.0, negocios cerrados en este momento y baja cantidad de reseñas." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {advantages.map((a, i) => (
              <div key={i} className="card flex gap-4 p-4 rounded-2xl transition-colors">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{a.title}</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Acción recomendada */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }}>
        <ImprovementCard
          title="Acción recomendada"
          action={`${
            competitors.filter((c) => !c.openNow).length > 0
              ? `${competitors.filter((c) => !c.openNow).length} competidor(es) no cubren el horario completo. `
              : ''
          }${
            competitors.filter((c) => (c.reviewCount ?? 999) < 150).length > 0
              ? `${competitors.filter((c) => (c.reviewCount ?? 999) < 150).length} competidor(es) tienen baja presencia digital. `
              : ''
          }Abre con horario extendido y solicita reseñas activamente desde el día 1 — puedes aparecer en el top 3 de Google Maps local en 60–90 días.`}
        />
      </motion.div>

    </div>
  )
}
