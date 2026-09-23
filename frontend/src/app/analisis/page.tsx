'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CardData {
  id: string
  theme: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  icon: string
  title: string
  value: string
  summary: string
  details: {
    label: string
    value: string
  }[]
  insight: string
}

// ─── Paleta por tema ──────────────────────────────────────────────────────────

const THEME: Record<CardData['theme'], {
  bg: string; border: string; badge: string; badgeText: string
  valueTxt: string; detailBg: string; detailBorder: string; btnBg: string; btnHover: string
  colorLabel: string
}> = {
  green: {
    bg: 'bg-green-950', border: 'border-green-700',
    badge: 'bg-green-900', badgeText: 'text-green-400',
    valueTxt: 'text-green-400', detailBg: 'bg-green-900/40',
    detailBorder: 'border-green-800', btnBg: 'bg-green-700', btnHover: 'hover:bg-green-600',
    colorLabel: 'Oportunidad',
  },
  yellow: {
    bg: 'bg-yellow-950', border: 'border-yellow-700',
    badge: 'bg-yellow-900', badgeText: 'text-yellow-400',
    valueTxt: 'text-yellow-400', detailBg: 'bg-yellow-900/40',
    detailBorder: 'border-yellow-800', btnBg: 'bg-yellow-700', btnHover: 'hover:bg-yellow-600',
    colorLabel: 'Precaución',
  },
  red: {
    bg: 'bg-red-950', border: 'border-red-700',
    badge: 'bg-red-900', badgeText: 'text-red-400',
    valueTxt: 'text-red-400', detailBg: 'bg-red-900/40',
    detailBorder: 'border-red-800', btnBg: 'bg-red-700', btnHover: 'hover:bg-red-600',
    colorLabel: 'Riesgo',
  },
  blue: {
    bg: 'bg-blue-950', border: 'border-blue-700',
    badge: 'bg-blue-900', badgeText: 'text-blue-400',
    valueTxt: 'text-blue-400', detailBg: 'bg-blue-900/40',
    detailBorder: 'border-blue-800', btnBg: 'bg-blue-700', btnHover: 'hover:bg-blue-600',
    colorLabel: 'Sugerencia',
  },
  purple: {
    bg: 'bg-purple-950', border: 'border-purple-700',
    badge: 'bg-purple-900', badgeText: 'text-purple-400',
    valueTxt: 'text-purple-400', detailBg: 'bg-purple-900/40',
    detailBorder: 'border-purple-800', btnBg: 'bg-purple-700', btnHover: 'hover:bg-purple-600',
    colorLabel: 'Innovación',
  },
}

// ─── Datos de análisis (mock — se reemplazarán con respuesta del backend) ─────

const CARDS: CardData[] = [
  {
    id: 'ubicacion',
    theme: 'blue',
    icon: '📍',
    title: 'Ubicación',
    value: 'Zona Río',
    summary: 'Tu zona tiene alta densidad comercial y buena accesibilidad.',
    details: [
      { label: 'Densidad poblacional', value: 'Alta — 3,200 personas en radio 800 m' },
      { label: 'Tráfico peatonal', value: 'Medio — pico 12–2 pm y 6–8 pm' },
      { label: 'Accesibilidad',    value: '3 modos de transporte disponibles' },
      { label: 'Índice de oportunidad', value: '82 / 100' },
    ],
    insight: 'Zona Río es la mejor zona de Tijuana para tu tipo de negocio según los datos de INEGI y OSM.',
  },
  {
    id: 'competencia',
    theme: 'yellow',
    icon: '⚔️',
    title: 'Competencia',
    value: '4 competidores',
    summary: 'Hay competencia moderada en un radio de 800 m.',
    details: [
      { label: 'Competidores directos', value: '4 negocios en radio 800 m' },
      { label: 'Rating promedio zona',  value: '4.1 ★ — calidad media-alta' },
      { label: 'Brecha detectada',      value: 'Ninguno abre después de las 9 pm' },
      { label: 'Segmento premium',      value: 'Solo Starbucks ($72) — oportunidad media' },
    ],
    insight: 'Puedes diferenciarte con horario extendido o servicio personalizado que los competidores no ofrecen.',
  },
  {
    id: 'precios',
    theme: 'green',
    icon: '💲',
    title: 'Precios',
    value: 'Posición media-alta',
    summary: 'Tu precio está 11% sobre el promedio del mercado.',
    details: [
      { label: 'Precio promedio mercado', value: '$49 MXN' },
      { label: 'Tu precio estimado',      value: '$50 MXN' },
      { label: 'Precio mínimo zona',      value: '$38 MXN (El Buen Café)' },
      { label: 'Precio máximo zona',      value: '$72 MXN (Starbucks Río)' },
    ],
    insight: 'Estás bien posicionado. Puedes subir hasta $58 sin salir del rango competitivo si ofreces diferenciación clara.',
  },
  {
    id: 'demanda',
    theme: 'green',
    icon: '📈',
    title: 'Demanda',
    value: '~3,200 personas',
    summary: 'Mercado potencial en tu zona con perfil de cliente objetivo.',
    details: [
      { label: 'Mercado potencial',    value: '~3,200 personas activas en radio 800 m' },
      { label: 'Cuota estimada',       value: '2–5% en primeros 6 meses (~64–160 clientes/día)' },
      { label: 'Elasticidad precio',   value: 'Media — sensibles en rango $40–$80' },
      { label: 'Perfil de cliente',    value: 'Trabajadores 25–45 años, NSE C/C+' },
    ],
    insight: 'Con una cuota conservadora del 3% tienes ~96 clientes/día — suficiente para alcanzar el break-even en el mes 3.',
  },
  {
    id: 'financiero',
    theme: 'blue',
    icon: '📊',
    title: 'Finanzas',
    value: 'Viabilidad positiva',
    summary: 'Con los datos ingresados tu negocio es financieramente viable.',
    details: [
      { label: 'Ingresos proyectados/mes', value: '$120,000 MXN' },
      { label: 'Costos totales/mes',       value: '$83,000 MXN' },
      { label: 'Utilidad operativa',       value: '$37,000 MXN (31% margen)' },
      { label: 'Break-even',               value: '389 unidades/mes — mes 3' },
    ],
    insight: 'Recuperas la inversión en el mes 5 bajo escenario base. El margen del 31% es saludable para el sector.',
  },
  {
    id: 'tramites',
    theme: 'yellow',
    icon: '🧾',
    title: 'Trámites',
    value: '6 trámites pendientes',
    summary: 'Necesitas completar 6 permisos antes de abrir.',
    details: [
      { label: 'RFC / SAT',              value: '~1 día — Gratuito' },
      { label: 'Licencia de funcionamiento', value: '~15 días — $1,200–3,500' },
      { label: 'Protección civil',       value: '~10 días — $800–2,000' },
      { label: 'Tiempo total estimado',  value: '~20–30 días en paralelo' },
    ],
    insight: 'Inicia los trámites del Ayuntamiento de Tijuana lo antes posible — son los que más tardan.',
  },
  {
    id: 'escudo',
    theme: 'red',
    icon: '🛡️',
    title: 'Riesgos',
    value: '2 alertas críticas',
    summary: 'Hay 2 puntos críticos que debes resolver antes de abrir.',
    details: [
      { label: '🔴 Licencia de funcionamiento', value: 'Sin ella puedes ser clausurado' },
      { label: '🔴 Dictamen protección civil',  value: 'Obligatorio para locales con público' },
      { label: '🟡 Fondo de emergencia',        value: 'Reserva mínima $15,000–20,000 recomendada' },
      { label: '🟢 Precio y zona',              value: 'Factores favorables detectados' },
    ],
    insight: 'Resuelve primero los 2 puntos críticos. Los trámites tardían ~20 días — planifica antes de tu fecha de apertura.',
  },
  {
    id: 'scamper',
    theme: 'purple',
    icon: '💡',
    title: 'Ideas SCAMPER',
    value: '7 variantes detectadas',
    summary: 'La IA encontró 7 formas de reinventar tu negocio.',
    details: [
      { label: 'Sustituir', value: 'Modelo suscripción de café en oficinas' },
      { label: 'Combinar',  value: 'Cafetería + coworking de pago por hora' },
      { label: 'Adaptar',   value: 'Menú estacional para mayor relevancia' },
      { label: 'Eliminar',  value: 'Solo pagos digitales — reduce costos operativos' },
    ],
    insight: 'El modelo de coworking + café tiene el mayor potencial de diferenciación en Zona Río según datos de demanda.',
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AnalisisPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [direction, setDirection] = useState(1)

  const card = CARDS[index]
  const t = THEME[card.theme]
  const isFirst = index === 0
  const isLast = index === CARDS.length - 1

  function goNext() {
    if (isLast) { router.push('/proyecto'); return }
    setExpanded(false)
    setDirection(1)
    setIndex(i => i + 1)
  }

  function goPrev() {
    if (isFirst) return
    setExpanded(false)
    setDirection(-1)
    setIndex(i => i - 1)
  }

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <span className="text-xl font-black tracking-tight">
          viab<span className="text-blue-400">L</span>
        </span>
        <div className="flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {CARDS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300
                ${i === index ? 'w-5 bg-blue-400' : i < index ? 'w-1.5 bg-blue-800' : 'w-1.5 bg-gray-700'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-600">{index + 1} / {CARDS.length}</span>
          <button
            onClick={() => router.push('/proyecto')}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
          >
            Saltar →
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center pt-10 pb-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Resultados del análisis</h1>
        <p className="text-sm text-gray-500 mt-2">Revisa cada módulo antes de ver tu proyecto completo</p>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className={`w-full max-w-xs border-2 rounded-3xl overflow-hidden ${t.bg} ${t.border}`}
          >
            {/* Card header */}
            <div className="px-6 pt-8 pb-6">
              {/* Icon + color label badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl">{card.icon}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${t.badge} ${t.badgeText}`}>
                  {t.colorLabel}
                </span>
              </div>

              {/* Module title — big */}
              <p className="text-3xl font-black text-white leading-tight mb-1.5">
                {card.title}
              </p>

              {/* Value — colored */}
              <p className={`text-lg font-bold mb-4 ${t.valueTxt}`}>
                {card.value}
              </p>

              <p className="text-sm text-gray-300 leading-relaxed">
                {card.summary}
              </p>
            </div>

            {/* Expandable details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className={`mx-5 mb-4 rounded-2xl border p-4 space-y-3 ${t.detailBg} ${t.detailBorder}`}>
                    {card.details.map(d => (
                      <div key={d.label}>
                        <p className="text-xs text-gray-500 font-medium">{d.label}</p>
                        <p className="text-sm text-gray-200 mt-0.5">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`mx-5 mb-4 rounded-2xl border p-4 ${t.detailBg} ${t.detailBorder}`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">💬 Análisis IA</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{card.insight}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card footer */}
            <div className="px-5 pb-7 pt-2 flex flex-col gap-3">
              {/* Show more / less */}
              <button
                onClick={() => setExpanded(e => !e)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${t.btnBg} ${t.btnHover} text-white`}
              >
                {expanded ? 'Mostrar menos ↑' : 'Mostrar más detalles ↓'}
              </button>

              {/* Navigation */}
              <div className="flex gap-2">
                {!isFirst && (
                  <button
                    onClick={goPrev}
                    className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}
                <button
                  onClick={goNext}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
                    ${isLast ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                >
                  {isLast ? 'Ver mi proyecto →' : 'Siguiente →'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
