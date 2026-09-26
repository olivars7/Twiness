'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import SquareField from '@/components/ui/SquareField'
import { MapPin, Swords, DollarSign, TrendingUp, BarChart3, FileText, MessageSquare, type LucideIcon } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CardData {
  id: string
  theme: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  icon: LucideIcon
  title: string
  value: string
  summary: string
  details: {
    label: string
    value: string
  }[]
  insight: string
}

// ─── Paleta por tema (neutral — sin colores, solo etiqueta diferente) ─────────

const THEME: Record<CardData['theme'], {
  colorLabel: string
}> = {
  green:  { colorLabel: 'Oportunidad' },
  yellow: { colorLabel: 'Precaución' },
  red:    { colorLabel: 'Riesgo' },
  blue:   { colorLabel: 'Sugerencia' },
  purple: { colorLabel: 'Análisis' },
}

// ─── Datos de análisis (mock) ─────────────────────────────────────────────────

const CARDS: CardData[] = [
  {
    id: 'ubicacion',
    theme: 'blue',
    icon: MapPin,
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
    icon: Swords,
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
    icon: DollarSign,
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
    icon: TrendingUp,
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
    icon: BarChart3,
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
    icon: FileText,
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

  // ── Navy blue palette ──────────────────────────────────────────────────────
  const navy = {
    bg:          '#0a1628',
    border:      '#1e3a5f',
    cardBg:      'rgba(10,22,40,0.92)',
    iconBg:      '#0f1f38',
    iconColor:   '#93c5fd',
    titleColor:  '#e2eeff',
    valueColor:  '#93c5fd',
    labelColor:  '#4a7abf',
    valueText:   '#bfdbfe',
    divider:     '#1a3050',
    insightBg:   '#0d1e35',
    insightBdr:  '#1e3a5f',
    muted:       '#3d6494',
    badgeBg:     '#0f2040',
    badgeColor:  '#60a5fa',
    prevBtn:     { bg: '#0f1f38', border: '#1e3a5f', color: '#93c5fd' },
    nextBtn:     { bg: '#1e3a5f', color: '#e2eeff' },
    lastBtn:     { bg: '#3b82f6', color: '#fff' },
    gridColor:   '#0f2040',
    squareColor: '#1e3a5f',
    progressActive: '#60a5fa',
    progressDone:   '#1e40af',
    progressIdle:   '#0f2040',
    uiBg:        'rgba(10,22,40,0.85)',
    uiBorder:    '#1e3a5f',
    uiColor:     '#60a5fa',
  }

  return (
    <main
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ background: navy.bg, color: navy.titleColor }}
    >
      {/* Grid lines — navy */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${navy.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${navy.gridColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.7,
        }}
      />
      {/* SquareField with navy color override via canvas */}
      <SquareField />

      {/* ── Fixed top-right: progress + skip ────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: navy.uiBg, border: `1px solid ${navy.uiBorder}`, backdropFilter: 'blur(8px)' }}
        >
          <div className="flex gap-1.5">
            {CARDS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 20 : 6,
                  background: i === index ? navy.progressActive : i < index ? navy.progressDone : navy.progressIdle,
                }}
              />
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: navy.muted }}>
            {index + 1}/{CARDS.length}
          </span>
        </div>

        <button
          onClick={() => router.push('/proyecto')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: navy.uiBg, border: `1px solid ${navy.uiBorder}`, color: navy.labelColor, backdropFilter: 'blur(8px)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = navy.uiColor }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = navy.labelColor }}
        >
          Saltar al dashboard →
        </button>
      </div>

      {/* Title */}
      <div className="text-center pt-8 pb-2 shrink-0 relative z-10">
        <h1
          className="text-3xl tracking-tight leading-tight"
          style={{ fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif', fontWeight: 700, fontStyle: 'italic', color: navy.titleColor }}
        >
          Resultados del análisis
        </h1>
        <p className="text-xs mt-1" style={{ color: navy.muted }}>Revisa cada módulo antes de ver tu proyecto completo</p>
      </div>

      {/* Card area — no scroll, compact */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4 overflow-hidden relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-full max-w-xl rounded-3xl flex flex-col"
            style={{ background: navy.cardBg, border: `1.5px solid ${navy.border}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* ── Encabezado ───────────────────────────────────────────── */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: navy.iconBg }}>
                  {(() => { const Icon = card.icon; return <Icon size={18} strokeWidth={1.75} style={{ color: navy.iconColor }} /> })()}
                </div>
                <div>
                  <p
                    className="text-xl leading-tight tracking-tight"
                    style={{ fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif', fontWeight: 700, fontStyle: 'italic', color: navy.titleColor }}
                  >
                    {card.title}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: navy.valueColor }}>{card.value}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-4" style={{ background: navy.badgeBg, color: navy.badgeColor }}>
                {t.colorLabel}
              </span>
            </div>

            {/* ── Resumen ───────────────────────────────────────────────── */}
            <p className="text-xs leading-relaxed px-6 pb-4" style={{ color: navy.valueText }}>
              {card.summary}
            </p>

            {/* ── Divisor ───────────────────────────────────────────────── */}
            <div className="border-t mx-6" style={{ borderColor: navy.divider }} />

            {/* ── Datos ─────────────────────────────────────────────────── */}
            <div className="px-6 py-3 space-y-2.5">
              {card.details.map(d => (
                <div key={d.label} className="flex items-start justify-between gap-4">
                  <p className="text-xs font-medium shrink-0 w-40 leading-relaxed" style={{ color: navy.muted }}>{d.label}</p>
                  <p className="text-xs text-right leading-relaxed" style={{ color: navy.valueText }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* ── Divisor ───────────────────────────────────────────────── */}
            <div className="border-t mx-6" style={{ borderColor: navy.divider }} />

            {/* ── Insight IA ────────────────────────────────────────────── */}
            <div className="mx-6 my-3 rounded-xl border p-3" style={{ background: navy.insightBg, borderColor: navy.insightBdr }}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={11} strokeWidth={2} style={{ color: navy.muted }} />
                <p className="text-[10px] font-medium" style={{ color: navy.muted }}>Análisis IA</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: navy.valueText }}>{card.insight}</p>
            </div>

            {/* ── Navegación ────────────────────────────────────────────── */}
            <div className="flex gap-2 px-6 pb-5">
              {!isFirst && (
                <button
                  onClick={goPrev}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                  style={{ background: navy.prevBtn.bg, border: `1px solid ${navy.prevBtn.border}`, color: navy.prevBtn.color }}
                >
                  ← Anterior
                </button>
              )}
              <button
                onClick={goNext}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={isLast ? navy.lastBtn : navy.nextBtn}
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
