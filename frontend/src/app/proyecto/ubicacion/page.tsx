'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProjectStore } from '@/store/projectStore'

const InteractiveMap = dynamic(() => import('@/components/maps/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-2xl border border-gray-800 bg-gray-900 flex items-center justify-center"
      style={{ height: '500px' }}
    >
      <LoadingSpinner size="lg" />
    </div>
  ),
})

const RADIUS_OPTIONS = [
  { label: '250 m', value: 250 },
  { label: '500 m', value: 500 },
  { label: '1 km',  value: 1000 },
]

interface Factor {
  icon: string
  label: string
  score: number
}

const FACTORS: Factor[] = [
  { icon: '🚶', label: 'Tráfico peatonal',     score: 72 },
  { icon: '🚗', label: 'Acceso vehicular',      score: 85 },
  { icon: '🏪', label: 'Competidores cercanos', score: 48 },
  { icon: '🏘️', label: 'Nivel socioeconómico', score: 66 },
]

interface SafetyFactor {
  icon: string
  label: string
  level: 'bajo' | 'medio' | 'alto'
  detail: string
}

const SAFETY_FACTORS: SafetyFactor[] = [
  { icon: '🔒', label: 'Seguridad pública',               level: 'medio', detail: 'Zona con incidentes moderados. Recomendado contar con cámara y cerradura reforzada.' },
  { icon: '💡', label: 'Alumbrado público',                level: 'alto',  detail: 'Calle bien iluminada. Reduce el riesgo nocturno para clientes y empleados.' },
  { icon: '🚧', label: 'Estado de infraestructura',        level: 'alto',  detail: 'Banquetas y calles en buen estado. Acceso sin obstáculos para clientes.' },
  { icon: '🌊', label: 'Riesgo por inundación',            level: 'bajo',  detail: 'Zona de alto riesgo en temporada de lluvias según Protección Civil Tijuana.' },
  { icon: '🚑', label: 'Acceso a servicios de emergencia', level: 'alto',  detail: 'Cruz Roja y hospital a menos de 2 km. Tiempo de respuesta estimado: 8 min.' },
  { icon: '🔌', label: 'Suministro eléctrico',             level: 'alto',  detail: 'Red eléctrica estable. Historial bajo de apagones en esta colonia.' },
]

interface POI {
  icon: string
  label: string
  distance: string
  note: string
  type: 'positivo' | 'neutro' | 'negativo'
}

const POIS: POI[] = [
  { icon: '🚌', label: 'Parada de camión',         distance: '180 m',  note: 'Aumenta el flujo de clientes a pie.',              type: 'positivo'  },
  { icon: '🏫', label: 'Escuela secundaria',        distance: '320 m',  note: 'Genera tráfico en horas de entrada y salida.',     type: 'positivo'  },
  { icon: '🏬', label: 'Plaza comercial',           distance: '850 m',  note: 'Competencia indirecta pero atrae clientes.',       type: 'neutro'    },
  { icon: '🏪', label: 'Negocio similar cercano',   distance: '240 m',  note: 'Competidor directo dentro de tu radio de acción.', type: 'negativo'  },
  { icon: '⛽', label: 'Gasolinera',                distance: '400 m',  note: 'Punto de referencia para clientes en auto.',       type: 'neutro'    },
  { icon: '🏥', label: 'Clínica IMSS',              distance: '1.1 km', note: 'Genera flujo constante de personas en la zona.',   type: 'positivo'  },
]

function scoreColor(score: number) {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function safetyColor(level: SafetyFactor['level']) {
  if (level === 'alto')  return { bar: 'bg-green-500',  badge: 'bg-green-900 text-green-300',  label: 'Favorable' }
  if (level === 'medio') return { bar: 'bg-yellow-500', badge: 'bg-yellow-900 text-yellow-300', label: 'Precaución' }
  return                        { bar: 'bg-red-500',    badge: 'bg-red-900 text-red-300',       label: 'Riesgo' }
}

function safetyScore(level: SafetyFactor['level']) {
  if (level === 'alto')  return 85
  if (level === 'medio') return 55
  return 25
}

function poiTypeStyle(type: POI['type']) {
  if (type === 'positivo') return 'border-green-800 bg-green-950/30 text-green-400'
  if (type === 'negativo') return 'border-red-800 bg-red-950/30 text-red-400'
  return 'border-gray-700 bg-gray-800/50 text-gray-400'
}

function buildAlerts(factors: Factor[], safety: SafetyFactor[]) {
  const alerts: { icon: string; text: string; fix: string; color: string }[] = []
  const wins:   { icon: string; text: string }[] = []

  for (const f of factors) {
    if (f.label === 'Competidores cercanos' && f.score < 50)
      alerts.push({ icon: '🏪', text: 'Alta competencia en tu radio de acción.', fix: 'Diferencia con un producto exclusivo, mejor servicio o precio más accesible.', color: 'border-red-700 bg-red-950' })
    else if (f.label === 'Tráfico peatonal' && f.score < 50)
      alerts.push({ icon: '🚶', text: 'Bajo tránsito de personas en la zona.', fix: 'Refuerza tu presencia con redes sociales, Google Maps y servicio a domicilio.', color: 'border-red-700 bg-red-950' })
    else if (f.label === 'Nivel socioeconómico' && f.score < 50)
      alerts.push({ icon: '🏘️', text: 'Poder adquisitivo limitado en la zona.', fix: 'Ajusta tu ticket promedio y ofrece opciones de precio accesibles.', color: 'border-yellow-700 bg-yellow-950' })
    else if (f.label === 'Acceso vehicular' && f.score < 50)
      alerts.push({ icon: '🚗', text: 'Difícil acceso para clientes en automóvil.', fix: 'Verifica disponibilidad de estacionamiento cercano o señalización adicional.', color: 'border-yellow-700 bg-yellow-950' })

    if (f.score >= 70)
      wins.push({ icon: f.icon, text: `${f.label} favorable (${f.score}/100)` })
  }

  for (const s of safety) {
    if (s.level === 'bajo')
      alerts.push({ icon: s.icon, text: `Riesgo en: ${s.label.toLowerCase()}.`, fix: s.detail, color: 'border-red-700 bg-red-950' })
  }

  return { alerts, wins }
}

function calcOverallScore(factors: Factor[], safety: SafetyFactor[]) {
  const factorAvg = factors.reduce((s, f) => s + f.score, 0) / factors.length
  const safetyAvg = safety.reduce((s, f) => s + safetyScore(f.level), 0) / safety.length
  return Math.round(factorAvg * 0.6 + safetyAvg * 0.4)
}

function overallLabel(score: number) {
  if (score >= 70) return { text: 'Ubicación apta',            color: 'text-green-400',  bg: 'bg-green-900/40 border-green-700' }
  if (score >= 45) return { text: 'Ubicación con reservas',    color: 'text-yellow-400', bg: 'bg-yellow-900/40 border-yellow-700' }
  return                   { text: 'Ubicación de alto riesgo', color: 'text-red-400',    bg: 'bg-red-900/40 border-red-700' }
}

export default function UbicacionPage() {
  const { project, updateProject, setProject } = useProjectStore()
  const city = project?.location?.city ?? 'Tijuana, B.C.'

  const [pendingLocation, setPendingLocation] = useState<[number, number] | null>(null)
  const [radius, setRadius]   = useState(500)
  const [confirmed, setConfirmed] = useState(false)

  const handleLocationSelect = (lat: number, lng: number) => {
    setPendingLocation([lat, lng])
    setConfirmed(false)
  }

  const handleConfirm = () => {
    if (!pendingLocation) return
    const [lat, lng] = pendingLocation
    const newLocation = { lat, lng, city }
    if (project) {
      updateProject({ location: newLocation })
    } else {
      setProject({
        businessType: '',
        profile: { description: '', location: newLocation },
        location: newLocation,
      })
    }
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2500)
  }

  // Memoized para no recalcular en cada render
  const { alerts, wins } = useMemo(() => buildAlerts(FACTORS, SAFETY_FACTORS), [])
  const overall            = useMemo(() => calcOverallScore(FACTORS, SAFETY_FACTORS), [])
  const overallInfo        = overallLabel(overall)

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-white">📍 Inteligencia de Ubicación</h1>
        <p className="text-gray-500 text-sm mt-1">
          Analiza el potencial comercial, seguridad e infraestructura de la zona — {city}
        </p>
      </motion.div>

      {/* Instrucción de uso */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="rounded-xl border border-blue-800 bg-blue-950/30 p-4 flex items-start gap-3"
      >
        <span className="text-xl mt-0.5">🖱️</span>
        <div>
          <p className="text-sm font-semibold text-blue-300">¿Cómo usar esta pantalla?</p>
          <p className="text-xs text-blue-400 mt-0.5">
            1. Haz clic en el mapa para colocar el pin en la ubicación de tu negocio. &nbsp;
            2. Ajusta el radio de análisis según el alcance que esperas. &nbsp;
            3. Confirma la ubicación para guardarla en tu proyecto.
          </p>
        </div>
      </motion.div>

      {/* Puntaje global */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`rounded-2xl border p-5 flex items-center justify-between ${overallInfo.bg}`}
      >
        <div>
          <p className="text-xs text-gray-400 mb-1">Aptitud general de la ubicación</p>
          <p className={`text-2xl font-black ${overallInfo.color}`}>{overallInfo.text}</p>
          <p className="text-xs text-gray-500 mt-1">Basado en factores comerciales, seguridad e infraestructura</p>
        </div>
        <div className="text-right">
          <p className={`text-4xl font-black ${overallInfo.color}`}>{overall}</p>
          <p className="text-xs text-gray-500">/100</p>
        </div>
      </motion.div>

      {/* Factores comerciales */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <p className="text-sm font-semibold text-white">📊 Factores comerciales</p>
        {FACTORS.map((f, i) => (
          <motion.div key={f.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">{f.icon} {f.label}</span>
              <span className="text-sm font-semibold text-gray-200">{f.score}/100</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${f.score}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className={`h-full rounded-full ${scoreColor(f.score)}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Seguridad e infraestructura */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5"
      >
        <p className="text-sm font-semibold text-white">🛡️ Seguridad e infraestructura</p>
        {SAFETY_FACTORS.map((f, i) => {
          const c  = safetyColor(f.level)
          const sc = safetyScore(f.level)
          return (
            <motion.div key={f.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{f.icon} {f.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${sc}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className={`h-full rounded-full ${c.bar}`}
                />
              </div>
              <p className="text-xs text-gray-500">{f.detail}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* POIs cercanos */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >
        <p className="text-sm font-semibold text-white mb-4">📌 Puntos de interés cercanos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POIS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
              className={`rounded-xl border p-3 ${poiTypeStyle(p.type)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-200">{p.icon} {p.label}</span>
                <span className="text-xs font-bold text-gray-400">{p.distance}</span>
              </div>
              <p className="text-xs text-gray-500">{p.note}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">🔵 Estimación basada en datos OSM para la zona por defecto.</p>
      </motion.div>

      {/* Alertas y soluciones */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <p className="text-sm font-semibold text-white">⚡ Alertas y cómo resolverlas</p>

        {alerts.length === 0 && (
          <p className="text-sm text-green-400">✅ No se detectaron riesgos críticos en esta ubicación.</p>
        )}

        {alerts.map((a, i) => (
          <motion.div
            key={`${a.icon}-${i}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
            className={`rounded-xl border p-4 ${a.color}`}
          >
            <p className="text-sm font-semibold text-white mb-1">{a.icon} {a.text}</p>
            <p className="text-xs text-gray-400">💡 <span className="text-gray-300">{a.fix}</span></p>
          </motion.div>
        ))}

        {wins.length > 0 && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-4 space-y-1">
            <p className="text-sm font-semibold text-green-400 mb-2">✅ Puntos a tu favor</p>
            {wins.map((w) => (
              <p key={w.text} className="text-sm text-gray-300">{w.icon} {w.text}</p>
            ))}
          </div>
        )}
      </motion.div>

      {/* Radio de análisis */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Radio de análisis</p>
          <span className="text-sm font-bold text-blue-400">
            {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
          </span>
        </div>
        <div className="flex gap-3">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRadius(opt.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                radius === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          El círculo azul en el mapa muestra el área de influencia de tu negocio.
        </p>
      </motion.div>

      {/* Mapa */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <InteractiveMap
          center={pendingLocation ?? undefined}
          radius={radius}
          onLocationSelect={handleLocationSelect}
        />
      </motion.div>

      {/* Coordenadas en tiempo real */}
      <AnimatePresence>
        {pendingLocation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-xl border border-gray-700 bg-gray-900 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Coordenadas seleccionadas</p>
              <p className="text-sm font-mono text-gray-200">
                {pendingLocation[0].toFixed(5)}, {pendingLocation[1].toFixed(5)}
              </p>
            </div>
            <button
              onClick={() => { setPendingLocation(null); setConfirmed(false) }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              ✕ Limpiar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón confirmar */}
      <AnimatePresence>
        {pendingLocation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <button
              onClick={handleConfirm}
              disabled={confirmed}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-colors ${
                confirmed
                  ? 'bg-green-700 text-green-100 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {confirmed
                ? '✅ Ubicación guardada en tu proyecto'
                : '📍 Confirmar y guardar esta ubicación'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
