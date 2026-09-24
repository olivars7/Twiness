'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import StarField from '@/components/ui/StarField'

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
  valueTxt: string; detailBg: string; detailBorder: string
  colorLabel: string; divider: string
}> = {
  green: {
    bg: 'bg-green-950', border: 'border-green-700',
    badge: 'bg-green-900', badgeText: 'text-green-400',
    valueTxt: 'text-green-400', detailBg: 'bg-green-900/40',
    detailBorder: 'border-green-800', colorLabel: 'Oportunidad',
    divider: 'border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-950', border: 'border-yellow-700',
    badge: 'bg-yellow-900', badgeText: 'text-yellow-400',
    valueTxt: 'text-yellow-400', detailBg: 'bg-yellow-900/40',
    detailBorder: 'border-yellow-800', colorLabel: 'Precaución',
    divider: 'border-yellow-800',
  },
  red: {
    bg: 'bg-red-950', border: 'border-red-700',
    badge: 'bg-red-900', badgeText: 'text-red-400',
    valueTxt: 'text-red-400', detailBg: 'bg-red-900/40',
    detailBorder: 'border-red-800', colorLabel: 'Riesgo',
    divider: 'border-red-800',
  },
  blue: {
    bg: 'bg-blue-950', border: 'border-blue-700',
    badge: 'bg-blue-900', badgeText: 'text-blue-400',
    valueTxt: 'text-blue-400', detailBg: 'bg-blue-900/40',
    detailBorder: 'border-blue-800', colorLabel: 'Sugerencia',
    divider: 'border-blue-800',
  },
  purple: {
    bg: 'bg-purple-950', border: 'border-purple-700',
    badge: 'bg-purple-900', badgeText: 'text-purple-400',
    valueTxt: 'text-purple-400', detailBg: 'bg-purple-900/40',
    detailBorder: 'border-purple-800', colorLabel: 'Innovación',
    divider: 'border-purple-800',
  },
}

// ─── Datos de análisis (mock) ─────────────────────────────────────────────────

const CARDS: CardData[] = [
  {
    id: 'ubicacion',
    theme: 'blue',
    icon: '📍',
    title: 'Ubicación',
    value: 'Zona Río',
    summary: 'Tu zona tiene alta densidad comercial y buena accesibilidad.',
    details: [
      { label: 'Densidad poblacional',   value: 'Alta — 3,200 personas en radio 800 m' },
      { label: 'Tráfico peatonal',       value: 'Medio — pico 12–2 pm y 6–8 pm' },
      { label: 'Accesibilidad',          value: '3 modos de transporte disponibles' },
      { label: 'Índice de oportunidad',  value: '82 / 100' },
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
      { label: 'Mercado potencial',  value: '~3,200 personas activas en radio 800 m' },
      { label: 'Cuota estimada',     value: '2–5% en primeros 6 meses (~64–160 clientes/día)' },
      { label: 'Elasticidad precio', value: 'Media — sensibles en rango $40–$80' },
      { label: 'Perfil de cliente',  value: 'Trabajadores 25–45 años, NSE C/C+' },
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
      { label: 'RFC / SAT',                 value: '~1 día — Gratuito' },
      { label: 'Licencia de funcionamiento', value: '~15 días — $1,200–3,500' },
      { label: 'Protección civil',          value: '~10 días — $800–2,000' },
      { label: 'Tiempo total estimado',     value: '~20–30 días en paralelo' },
    ],
    insight: 'Inicia los trámites del Ayuntamiento de Tijuana lo antes posible — son los que más tardan.',
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AnalisisPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const card = CARDS[index]
  const t = THEME[card.theme]
  const isFirst = index === 0
  const isLast = index === CARDS.length - 1

  function goNext() {
    if (isLast) { router.push('/proyecto'); return }
    setDirection(1)
    setIndex(i => i + 1)
  }

  function goPrev() {
    if (isFirst) return
    setDirection(-1)
    setIndex(i => i - 1)
  }

  // Enter key → advance card
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if ((document.activeElement as HTMLElement)?.tagName === 'BUTTON') return
      e.preventDefault()
      goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <main
      className="relative h-screen text-white flex flex-col overflow-hidden"
      style={{ background: '#030712' }}
    >
      <StarField />

      {/* ── Fixed top-right: progress + skip ────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        {/* Progress dots */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex gap-1.5">
            {CARDS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 20 : 6,
                  background: i === index ? '#60a5fa' : i < index ? '#1e40af' : '#374151',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
            {index + 1}/{CARDS.length}
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={() => router.push('/proyecto')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', backdropFilter: 'blur(8px)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; (e.currentTarget as HTMLElement).style.color = '#e5e7eb' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#9ca3af' }}
        >
          Saltar al dashboard →
        </button>
      </div>

      {/* Title */}
      <div className="text-center pt-10 pb-4 shrink-0">
        <h1 className="text-3xl font-black text-white tracking-tight">Resultados del análisis</h1>
        <p className="text-xs text-gray-500 mt-1.5">Revisa cada módulo antes de ver tu proyecto completo</p>
      </div>

      {/* Card area — no scroll */}
      <div className="flex-1 flex items-center justify-center px-4 pb-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className={`w-full max-w-xl border-2 rounded-3xl flex flex-col ${t.bg} ${t.border}`}
          >
            {/* ── Encabezado ───────────────────────────────────────────── */}
            <div className="flex items-start justify-between px-8 pt-8 pb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{card.icon}</span>
                <div>
                  <p className="text-2xl font-black text-white leading-tight">{card.title}</p>
                  <p className={`text-base font-bold mt-0.5 ${t.valueTxt}`}>{card.value}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ml-4 ${t.badge} ${t.badgeText}`}>
                {t.colorLabel}
              </span>
            </div>

            {/* ── Resumen ───────────────────────────────────────────────── */}
            <p className="text-sm text-gray-300 leading-relaxed px-8 pb-6">
              {card.summary}
            </p>

            {/* ── Divisor ───────────────────────────────────────────────── */}
            <div className={`border-t mx-8 ${t.divider}`} />

            {/* ── Datos ─────────────────────────────────────────────────── */}
            <div className="px-8 py-6 space-y-4">
              {card.details.map(d => (
                <div key={d.label} className="flex items-start justify-between gap-6">
                  <p className="text-xs text-gray-500 font-medium shrink-0 w-44 leading-relaxed">{d.label}</p>
                  <p className="text-sm text-gray-200 text-right leading-relaxed">{d.value}</p>
                </div>
              ))}
            </div>

            {/* ── Divisor ───────────────────────────────────────────────── */}
            <div className={`border-t mx-8 ${t.divider}`} />

            {/* ── Insight IA ────────────────────────────────────────────── */}
            <div className={`mx-8 my-6 rounded-2xl border p-4 ${t.detailBg} ${t.detailBorder}`}>
              <p className="text-xs text-gray-500 font-medium mb-1.5">💬 Análisis IA</p>
              <p className="text-sm text-gray-200 leading-relaxed">{card.insight}</p>
            </div>

            {/* ── Navegación ────────────────────────────────────────────── */}
            <div className="flex gap-2 px-8 pb-8">
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
                {isLast ? 'Ver proyecto →' : 'Siguiente →'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </main>
  )
}
