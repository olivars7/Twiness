'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MapPin, Flame, Users, Store, PersonStanding, Star, Smartphone, Clock, TriangleAlert, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ImprovementCard from '@/components/ui/ImprovementCard'
import DataBadge from '@/components/ui/DataBadge'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { useProjectStore } from '@/store/projectStore'
import type { CompetitorSnapshot } from '@/types/analysis'

// Mapa único unificado — cargado en cliente con SSR desactivado
const UnifiedMap = dynamic(() => import('@/components/maps/UnifiedMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ height: 500, background: '#000' }}>
      <LoadingSpinner size="lg" />
    </div>
  ),
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

const USER_LOCATION = { lat: 32.4701, lng: -116.9742, name: 'Mi negocio (Laurel 1, Tijuana)' }

const ALL_COMPETITORS: CompetitorSnapshot[] = [
  { id: '1', name: 'Café Baja Blend',   distance: 180,  rating: 4.1, reviewCount: 210, businessType: 'Cafetería', lat: 32.4714, lng: -116.9727, openNow: true,  source: 'google_places' },
  { id: '2', name: 'Café de Olla TJ',   distance: 320,  rating: 3.7, reviewCount: 74,  businessType: 'Cafetería', lat: 32.4680, lng: -116.9761, openNow: false, source: 'google_places' },
  { id: '3', name: 'Latte & Co.',        distance: 490,  rating: 4.0, reviewCount: 165, businessType: 'Cafetería', lat: 32.4720, lng: -116.9786, openNow: true,  source: 'google_places' },
  { id: '4', name: 'Café Frontera',      distance: 650,  rating: 3.5, reviewCount: 41,  businessType: 'Cafetería', lat: 32.4643, lng: -116.9742, openNow: false, source: 'google_places' },
  { id: '5', name: 'Espresso Tijuana',   distance: 820,  rating: 4.3, reviewCount: 290, businessType: 'Cafetería', lat: 32.4775, lng: -116.9742, openNow: true,  source: 'google_places' },
  { id: '6', name: 'Starbucks Laureles', distance: 950,  rating: 4.5, reviewCount: 860, businessType: 'Cafetería', lat: 32.4701, lng: -116.9640, openNow: true,  source: 'google_places' },
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

type AdvantageIcon = 'star' | 'clock' | 'smartphone'
function detectAdvantages(competitors: CompetitorSnapshot[]) {
  const list: { icon: AdvantageIcon; title: string; detail: string }[] = []
  const weakest = [...competitors].sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))[0]
  if (weakest?.rating && weakest.rating < 4.0)
    list.push({ icon: 'star', title: 'Diferenciación por calidad', detail: `${weakest.name} tiene solo ${weakest.rating}★ — el competidor más vulnerable. Un servicio consistente te da ventaja directa.` })
  const closed = competitors.filter((c) => !c.openNow)
  if (closed.length > 0)
    list.push({ icon: 'clock', title: 'Gap de horario detectado', detail: `${closed.length} de ${competitors.length} competidores están cerrados ahora. Horario extendido captura esa demanda.` })
  const lowReviews = competitors.filter((c) => (c.reviewCount ?? 999) < 100)
  if (lowReviews.length > 0)
    list.push({ icon: 'smartphone', title: 'Baja presencia digital en la zona', detail: `${lowReviews.length} competidor(es) con <100 reseñas. Con Google Maps activo desde el día 1 puedes superarlos en 60–90 días.` })
  return list
}

const ADVANTAGE_ICONS: Record<AdvantageIcon, React.ElementType> = {
  star: Star, clock: Clock, smartphone: Smartphone,
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

  const [pendingLocation, setPendingLocation] = useState<[number, number] | null>(null)
  const [locRadius, setLocRadius] = useState(500)
  const [confirmed, setConfirmed] = useState(false)
  const [compRadio, setCompRadio] = useState<CompRadio>(800)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showCompetitors, setShowCompetitors] = useState(false)

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

  const competitors    = ALL_COMPETITORS.filter((c) => c.distance <= compRadio)
  const avgRating      = competitors.length ? +(competitors.reduce((s, c) => s + (c.rating ?? 0), 0) / competitors.length).toFixed(1) : 0
  const saturation     = calcSaturation(competitors, compRadio)
  const advantages     = detectAdvantages(competitors)
  const satColorHex    = { green: '#4ade80', yellow: '#fbbf24', red: '#f87171' }[saturation.color]

  const overall     = overallScore()
  const overallInfo = overallLabel(overall)

  type AlertEntry = { icon: React.ElementType; text: string; fix: string; color: string }
  type WinEntry   = { icon: React.ElementType; text: string }
  const { alerts, wins } = (() => {
    const alerts: AlertEntry[] = []
    const wins: WinEntry[] = []
    for (const f of FACTORS) {
      if (f.label === 'Competidores cercanos' && f.score < 50)
        alerts.push({ icon: Store,          text: 'Alta competencia en tu radio.',   fix: 'Diferencia con producto exclusivo, mejor servicio o precio.',   color: 'border-red-700 bg-red-950' })
      else if (f.label === 'Tráfico peatonal' && f.score < 50)
        alerts.push({ icon: PersonStanding, text: 'Bajo tránsito en la zona.',       fix: 'Refuerza con redes sociales, Google Maps y delivery.',          color: 'border-red-700 bg-red-950' })
      else if (f.label === 'Nivel socioeconómico' && f.score < 50)
        alerts.push({ icon: Users,          text: 'Poder adquisitivo limitado.',     fix: 'Ajusta ticket promedio con opciones accesibles.',               color: 'border-yellow-700 bg-yellow-950' })
      if (f.score >= 70) wins.push({ icon: CheckCircle, text: `${f.label} favorable (${f.score}/100)` })
    }
    for (const s of SAFETY_FACTORS) {
      if (s.level === 'bajo') alerts.push({ icon: TriangleAlert, text: `Riesgo: ${s.label}.`, fix: s.detail, color: 'border-red-700 bg-red-950' })
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

      {/* ── PUNTUACIÓN GLOBAL — dark box ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
      >
        <div className="dark-box rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs dark-box-muted mb-1">Aptitud general de la zona</p>
            <p className="text-lg font-bold">{overallInfo.text}</p>
            <p className="text-xs mt-1 dark-box-muted">Basado en {FACTORS.length} factores comerciales y {SAFETY_FACTORS.length} de infraestructura</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-5xl font-black dark-box-accent">{overall}</p>
            <p className="text-xs dark-box-muted">/100</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 1 — FACTORES COMERCIALES Y DE INFRAESTRUCTURA
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <SectionTitle label="1 · Factores del entorno" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Factores comerciales — card blanca */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
          className="card rounded-2xl p-5 space-y-4"
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Factores comerciales</p>
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
            <p className="text-sm font-semibold pb-1" style={{ borderBottom: '1px solid #1f1f1f' }}>Seguridad e infraestructura</p>
            {SAFETY_FACTORS.map((f, i) => {
              const m = safetyMeta(f.level)
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm truncate">{f.label}</span>
                      <InfoTooltip text={f.tooltip} variant="dark" />
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
                </div>
              )
            })}
          </div>
        </motion.div>

      </div>

      {/* Alertas + puntos a favor */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="card rounded-2xl p-5 space-y-3"
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Alertas y cómo resolverlas</p>
        {alerts.length === 0 && <p className="text-sm text-emerald-600">Sin riesgos críticos detectados en esta zona.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alerts.map((a, i) => {
            const AIcon = a.icon
            return (
              <div key={i} className="flex gap-3 rounded-xl border p-4"
                style={a.color.includes('red') ? { borderColor: '#fca5a5', background: '#fef2f2' } : { borderColor: '#fde68a', background: '#fffbeb' }}>
                <AIcon size={15} strokeWidth={2} className="shrink-0 mt-0.5" style={{ color: a.color.includes('red') ? '#dc2626' : '#d97706' }} />
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>{a.text}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{a.fix}</p>
                </div>
              </div>
            )
          })}
          {wins.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-emerald-700 mb-2">Puntos a tu favor</p>
              <div className="flex flex-col gap-1">
                {wins.map((w) => {
                  const WIcon = w.icon
                  return (
                    <p key={w.text} className="flex items-center gap-1.5 text-sm text-emerald-700">
                      <WIcon size={13} strokeWidth={2.2} />
                      {w.text}
                    </p>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 2 — MAPA INTERACTIVO UNIFICADO
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionTitle label="2 · Mapa y zonas de oportunidad" />
      </motion.div>

      {/* Mapa único unificado con toggles — dark mode */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}
      >
        {/* Header oscuro con título, toggles y radio */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold shrink-0" style={{ color: '#f4f4f5' }}>Ubicar mi negocio</p>
            <InfoTooltip text="Haz clic en el mapa para fijar la ubicación exacta. Activa las capas con los botones para ver calor y competidores superpuestos." variant="dark" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Mapa de calor */}
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={showHeatmap
                ? { background: '#f59e0b', color: '#000' }
                : { background: '#1f1f1f', color: '#a1a1aa', border: '1px solid #2f2f2f' }
              }
            >
              <Flame size={12} strokeWidth={2} className="inline mr-1" />
              {showHeatmap ? 'Calor ON' : 'Calor'}
            </button>
            {/* Toggle Competidores */}
            <button
              onClick={() => setShowCompetitors((v) => !v)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={showCompetitors
                ? { background: '#ef4444', color: '#fff' }
                : { background: '#1f1f1f', color: '#a1a1aa', border: '1px solid #2f2f2f' }
              }
            >
              <MapPin size={12} strokeWidth={2} className="inline mr-1" />
              {showCompetitors ? 'Competidores ON' : 'Competidores'}
            </button>
            {/* Separador */}
            <div className="w-px h-4 shrink-0" style={{ background: '#2f2f2f' }} />
            {/* Radio de influencia */}
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setLocRadius(opt.value)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={locRadius === opt.value
                    ? { background: '#3b82f6', color: '#fff' }
                    : { background: '#1f1f1f', color: '#a1a1aa', border: '1px solid #2f2f2f' }
                  }>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* UN SOLO mapa — capas controladas por props */}
        <UnifiedMap
          center={pendingLocation ?? undefined}
          radius={locRadius}
          onLocationSelect={handleLocationSelect}
          showHeatmap={showHeatmap}
          showCompetitors={showCompetitors}
          userLocation={USER_LOCATION}
          competitors={competitors}
          radioMeters={compRadio}
        />

        {/* Leyenda competidores (solo si capa activa) */}
        {showCompetitors && (
          <div className="px-5 py-2 flex items-center gap-4 text-xs" style={{ color: '#71717a', borderTop: '1px solid #1f1f1f' }}>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={2.5} style={{ color: '#3b82f6' }} />
              Tu negocio
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={2.5} style={{ color: '#ef4444' }} />
              Competencia
            </span>
          </div>
        )}

        {/* Botón de confirmar ubicación */}
        <AnimatePresence>
          {pendingLocation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="px-4 pb-4"
              style={{ background: '#0a0a0a' }}
            >
              <button onClick={handleConfirm} disabled={confirmed}
                className="w-full mt-2 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                style={confirmed
                  ? { background: '#052e16', color: '#4ade80', cursor: 'default' }
                  : { background: '#3b82f6', color: '#fff' }
                }>
                {confirmed
                  ? <><CheckCircle size={14} strokeWidth={2} className="inline mr-1.5" />Ubicación guardada</>
                  : `Confirmar (${pendingLocation[0].toFixed(4)}, ${pendingLocation[1].toFixed(4)})`
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 3 — ANÁLISIS DE COMPETENCIA
      ═══════════════════════════════════════════════════════════════════ */}
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

      {/* Índice de saturación — ocupa ancho completo sin la gráfica de ratings */}
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

      {/* Tabla de competidores */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Detalle de competidores</p>
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

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 4 — VENTAJA POTENCIAL Y ACCIÓN
      ═══════════════════════════════════════════════════════════════════ */}
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
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Detectado automáticamente al comparar rating, horario y presencia digital de los competidores.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {advantages.map((a, i) => {
              const AIcon = ADVANTAGE_ICONS[a.icon]
              return (
                <div key={i} className="card flex gap-3 p-4 rounded-2xl transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5" style={{ background: 'var(--color-input)' }}>
                    <AIcon size={14} strokeWidth={1.75} style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{a.title}</p>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{a.detail}</p>
                  </div>
                </div>
              )
            })}
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
