'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import SquareField from '@/components/ui/SquareField'
import { MapPin, Swords, DollarSign, TrendingUp, BarChart3, FileText, MessageSquare, type LucideIcon } from 'lucide-react'
import { useOnboardingStore, type OnboardingData } from '@/store/onboardingStore'
import { calcBreakEven, calcIncomeStatement } from '@/lib/financial'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CardData {
  id: string
  theme: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  icon: LucideIcon
  title: string
  value: string
  summary: string
  details: { label: string; value: string }[]
  insight: string
}

// ─── Paleta por tema ──────────────────────────────────────────────────────────

const THEME: Record<CardData['theme'], { colorLabel: string }> = {
  green:  { colorLabel: 'Oportunidad' },
  yellow: { colorLabel: 'Precaución' },
  red:    { colorLabel: 'Riesgo' },
  blue:   { colorLabel: 'Sugerencia' },
  purple: { colorLabel: 'Análisis' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLS(): Partial<OnboardingData> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem('viabl_business_data_v1') || '{}') } catch { return {} }
}

const p = (v?: string) => parseFloat((v ?? '').replace(/,/g, '')) || 0
const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`

// ─── Motor de análisis — reglas pre-hechas ────────────────────────────────────

function buildCards(d: Partial<OnboardingData>): CardData[] {
  // ── Datos crudos del onboarding ──
  const businessType  = d.businessType || 'negocio'
  const city          = d.locationCity || 'tu ciudad'
  const neighborhood  = d.locationNeighborhood || 'tu zona'
  const hasCoords     = d.locationLat != null && d.locationLng != null
  const salesChannel  = d.salesChannel || ''
  const operatingHours = d.operatingHours || ''
  const employeeCount = d.employeeCount || ''
  const targetCustomer = d.targetCustomer || ''
  const monthlyUnits  = p(d.monthlyUnits)
  const capital       = p(d.capitalAvailable)

  // Productos
  const price1  = p(d.product1Price)
  const cost1   = p(d.product1Cost)
  const name1   = d.product1Name || 'Producto principal'
  const price2  = p(d.product2Price)
  const name2   = d.product2Name || ''

  // Precio y costo variable representativos (ponderado si hay 2+ productos)
  const precioBase = price1 > 0 ? price1 : p(d.er_precioPromedio)
  const costoVarBase = cost1 > 0 ? cost1 : p(d.er_costoVariableUnitario)
  const gastosOperativos = p(d.monthlyFixedCosts) || p(d.er_gastosOperativosFijos)
  const unidades = monthlyUnits > 0 ? monthlyUnits : p(d.er_ventasEstimadasMes)
  const inversionInicial = capital > 0 ? capital : p(d.er_inversionInicial)

  // ── Cálculos financieros reales ──
  const margenContribucion = precioBase - costoVarBase
  const markup = costoVarBase > 0 ? precioBase / costoVarBase : 0

  let incomeStmt = { ingresos: 0, costosVariables: 0, utilidadBruta: 0, utilidadOperativa: 0, margenOperativo: 0, ventasEfectivas: unidades }
  let breakEvenResult = { unidades: 0, ventasBreakEven: 0, margenSeguridad: 0 }

  if (precioBase > 0 && costoVarBase > 0 && gastosOperativos > 0 && unidades > 0) {
    incomeStmt = calcIncomeStatement({
      precioPromedio: precioBase,
      ventasEstimadasMes: unidades,
      costoVariableUnitario: costoVarBase,
      gastosOperativosFijos: gastosOperativos,
    })
    breakEvenResult = calcBreakEven({
      costosFijos: gastosOperativos,
      precioUnitario: precioBase,
      costoVariableUnitario: costoVarBase,
      unidadesActuales: unidades,
    })
  }

  const mesRecuperacion = inversionInicial > 0 && incomeStmt.utilidadOperativa > 0
    ? Math.ceil(inversionInicial / incomeStmt.utilidadOperativa)
    : null

  const hasFinancialData = precioBase > 0

  // ── CARD 1: Ubicación ──────────────────────────────────────────────────────
  const locationTheme: CardData['theme'] = hasCoords ? 'green' : 'yellow'
  const locationValue = hasCoords ? `${neighborhood}, ${city}` : city || 'Sin ubicación definida'

  const locationSummary = hasCoords
    ? `Tienes una ubicación definida en ${neighborhood}, ${city}. El análisis de zona se basa en los datos que proporcionaste.`
    : `No ingresaste coordenadas exactas. El análisis geográfico es estimado con base en ${city}.`

  const locationDetails: CardData['details'] = [
    { label: 'Ciudad',            value: city },
    { label: 'Zona / Colonia',    value: neighborhood || 'No especificada' },
    { label: 'Coordenadas',       value: hasCoords ? `${d.locationLat?.toFixed(4)}, ${d.locationLng?.toFixed(4)}` : 'No registradas' },
    { label: 'Canal de venta',    value: salesChannel || 'No especificado' },
  ]

  const locationInsight = hasCoords
    ? `Tener coordenadas exactas permite un análisis de competidores y POIs más preciso. Visita el módulo de Ubicación para ver el mapa y los competidores cercanos.`
    : `Ingresa una dirección exacta en "Mis Datos" para activar el análisis de competidores con mapa interactivo y radio de influencia.`

  // ── CARD 2: Competencia ────────────────────────────────────────────────────
  // Sin API externa activa, derivamos señales del tipo de negocio y markup
  const channelIsLocal = salesChannel === 'local' || !salesChannel
  const competenciaTheme: CardData['theme'] = channelIsLocal ? 'yellow' : 'blue'

  const competenciaDetails: CardData['details'] = [
    { label: 'Tipo de negocio',   value: businessType },
    { label: 'Canal de venta',    value: salesChannel || 'Local físico' },
    { label: 'Horario declarado', value: operatingHours || 'No especificado' },
    { label: 'Empleados',         value: employeeCount ? `${employeeCount} persona(s)` : 'No especificado' },
  ]

  const competenciaInsightMap: Record<string, string> = {
    cafeteria: 'Las cafeterías tienen alta densidad competitiva. Diferenciarte con horario extendido, calidad o experiencia es clave.',
    barberia: 'Las barberías suelen competir por recomendación. Fidelizar clientes desde el inicio reduce el impacto de la competencia.',
    tienda_conveniencia: 'Las tiendas de conveniencia compiten por cercanía y horario. Ubicación y surtido específico son tus ventajas.',
  }
  const competenciaInsight = competenciaInsightMap[businessType] ??
    `Los negocios de tipo "${businessType}" enfrentan competencia variable según zona. Visita el módulo de Ubicación para ver competidores detectados en tu radio.`

  // ── CARD 3: Precio & Márgen ────────────────────────────────────────────────
  let preciosTheme: CardData['theme'] = 'yellow'
  let preciosValue = 'Sin datos de precio'
  let preciosSummary = 'No ingresaste precios en el onboarding.'

  if (precioBase > 0 && costoVarBase > 0) {
    if (markup >= 2.5)       { preciosTheme = 'green';  preciosValue = 'Márgen saludable' }
    else if (markup >= 1.5)  { preciosTheme = 'yellow'; preciosValue = 'Márgen ajustado' }
    else                     { preciosTheme = 'red';    preciosValue = 'Márgen bajo' }

    preciosSummary = markup >= 2.5
      ? `Tu precio de ${fmt(precioBase)} cubre bien el costo de ${fmt(costoVarBase)} con un markup de ×${markup.toFixed(1)}.`
      : markup >= 1.5
        ? `Tu márgen de contribución es ajustado. Considera si puedes reducir costos o incrementar precio.`
        : `El precio de ${fmt(precioBase)} versus un costo de ${fmt(costoVarBase)} deja poco márgen. Revisa tu estructura de costos.`
  } else if (precioBase > 0) {
    preciosTheme = 'blue'
    preciosValue = fmt(precioBase)
    preciosSummary = `Tu precio es ${fmt(precioBase)} pero no ingresaste costo variable. Agrega tus costos para un análisis completo.`
  }

  const preciosDetails: CardData['details'] = [
    { label: 'Producto principal',    value: name1 || 'No especificado' },
    { label: 'Precio unitario',       value: precioBase > 0 ? fmt(precioBase) : 'No registrado' },
    { label: 'Costo variable unit.',  value: costoVarBase > 0 ? fmt(costoVarBase) : 'No registrado' },
    { label: 'Márgen de contribución', value: margenContribucion > 0 ? `${fmt(margenContribucion)} por unidad` : 'No calculado' },
    ...(name2 ? [{ label: 'Producto 2', value: `${name2} — ${price2 > 0 ? fmt(price2) : 'sin precio'}` }] : []),
  ]

  const preciosInsight = markup >= 3
    ? `Con un markup de ×${markup.toFixed(1)} tienes espacio para absorber descuentos, costos imprevistos o publicidad sin comprometer la rentabilidad.`
    : markup >= 1.5
      ? `Intenta llevar el markup a ×2.5 o más. Revisa si hay costos que puedas negociar con proveedores o si el precio puede subir con mayor diferenciación.`
      : markup > 0
        ? `Un markup de ×${markup.toFixed(1)} es muy bajo. Tu negocio será difícil de sostener. Revisa urgentemente costos o precio.`
        : `Registra tu precio y costo variable en "Mis Datos" para obtener el análisis de márgen.`

  // ── CARD 4: Demanda & Escala ───────────────────────────────────────────────
  let demandaTheme: CardData['theme'] = 'yellow'
  let demandaValue = 'Sin estimación'
  let demandaSummary = 'No ingresaste estimación de unidades o ventas mensuales.'

  if (unidades > 0 && precioBase > 0) {
    const ingresosMes = incomeStmt.ingresos
    demandaValue = `~${Math.round(incomeStmt.ventasEfectivas)} uds/mes`
    demandaSummary = `Con ${Math.round(unidades)} unidades estimadas/mes a ${fmt(precioBase)} generas ~${fmt(ingresosMes)} en ingresos.`
    demandaTheme = incomeStmt.ingresos > (gastosOperativos * 1.5) ? 'green' : 'yellow'
  } else if (unidades > 0) {
    demandaValue = `${Math.round(unidades)} uds/mes`
    demandaSummary = `Estimaste ${Math.round(unidades)} unidades mensuales. Agrega el precio para calcular ingresos.`
    demandaTheme = 'blue'
  }

  const demandaDetails: CardData['details'] = [
    { label: 'Unidades estimadas/mes', value: unidades > 0 ? `${Math.round(unidades)} unidades` : 'No registradas' },
    { label: 'Ingresos proyectados',   value: incomeStmt.ingresos > 0 ? fmt(incomeStmt.ingresos) : 'Sin datos' },
    { label: 'Cliente objetivo',       value: targetCustomer || 'No especificado' },
    { label: 'Capital disponible',     value: inversionInicial > 0 ? fmt(inversionInicial) : 'No registrado' },
  ]

  const demandaInsight = unidades > 0 && precioBase > 0
    ? `Verifica que tu estimación de ${Math.round(unidades)} unidades/mes sea conservadora. En los primeros 3 meses es normal estar al 40–60% de la capacidad planeada.`
    : `Ingresa las unidades estimadas de venta mensual en "Mis Datos" o en el módulo Financiero para activar el análisis de demanda.`

  // ── CARD 5: Finanzas ───────────────────────────────────────────────────────
  let finanzasTheme: CardData['theme'] = 'yellow'
  let finanzasValue = 'Sin datos financieros'
  let finanzasSummary = 'Ingresa tus datos financieros para obtener el análisis completo.'

  if (hasFinancialData && gastosOperativos > 0 && unidades > 0) {
    if (incomeStmt.utilidadOperativa > 0 && incomeStmt.margenOperativo >= 0.2) {
      finanzasTheme = 'green'
      finanzasValue = 'Viabilidad positiva'
      finanzasSummary = `Con un margen operativo del ${fmtPct(incomeStmt.margenOperativo)} tu negocio es financieramente viable.`
    } else if (incomeStmt.utilidadOperativa > 0) {
      finanzasTheme = 'yellow'
      finanzasValue = 'Viabilidad marginal'
      finanzasSummary = `Tu negocio cubre costos pero con un márgen ajustado de ${fmtPct(incomeStmt.margenOperativo)}.`
    } else {
      finanzasTheme = 'red'
      finanzasValue = 'No rentable aún'
      finanzasSummary = `Con los datos actuales los costos superan los ingresos. Revisa precio, volumen o gastos.`
    }
  } else if (hasFinancialData) {
    finanzasTheme = 'blue'
    finanzasValue = 'Datos parciales'
    finanzasSummary = `Tienes precio registrado pero faltan gastos fijos o unidades para el análisis completo.`
  }

  const finanzasDetails: CardData['details'] = [
    { label: 'Ingresos/mes',       value: incomeStmt.ingresos > 0 ? fmt(incomeStmt.ingresos) : 'Sin datos' },
    { label: 'Costos variables',   value: incomeStmt.costosVariables > 0 ? fmt(incomeStmt.costosVariables) : 'Sin datos' },
    { label: 'Gastos fijos/mes',   value: gastosOperativos > 0 ? fmt(gastosOperativos) : 'No registrados' },
    { label: 'Utilidad operativa', value: incomeStmt.ingresos > 0 ? fmt(incomeStmt.utilidadOperativa) : 'Sin datos' },
    { label: 'Break-even',         value: breakEvenResult.unidades > 0 && isFinite(breakEvenResult.unidades) ? `${Math.ceil(breakEvenResult.unidades)} uds/mes` : 'Sin datos' },
    ...(mesRecuperacion ? [{ label: 'Recuperación inversión', value: `~mes ${mesRecuperacion}` }] : []),
  ]

  const finanzasInsight = incomeStmt.utilidadOperativa > 0
    ? mesRecuperacion
      ? `Bajo el escenario base recuperas la inversión aproximadamente en el mes ${mesRecuperacion}. Explora el módulo Financiero para ajustar escenarios.`
      : `Tu negocio es operativamente rentable. Ingresa tu inversión inicial en "Mis Datos" para calcular el tiempo de recuperación.`
    : hasFinancialData
      ? `Completa los gastos fijos y unidades mensuales en el módulo Financiero para obtener el análisis de break-even y recuperación.`
      : `Dirígete al módulo Financiero o a "Mis Datos" para registrar precios, costos y ventas estimadas.`

  // ── CARD 6: Trámites ───────────────────────────────────────────────────────
  const tramitesDetails: CardData['details'] = [
    { label: 'RFC / SAT',                  value: '~1 día — Gratuito' },
    { label: 'Licencia de funcionamiento', value: `~15 días — varía por municipio` },
    { label: 'Aviso de apertura',          value: `~5 días — en línea (SARE)` },
    { label: 'Protección civil',           value: '~10 días — requiere visita de inspector' },
    { label: 'Tiempo total estimado',      value: '~20–30 días en paralelo' },
  ]

  const tramitesInsightMap: Record<string, string> = {
    cafeteria: 'Para cafeterías se requiere adicionalmente el permiso de uso de suelo para "Preparación y venta de alimentos". Verifica con el ayuntamiento de ' + city + '.',
    barberia: 'Las barberías requieren aviso sanitario ante COFEPRIS además de la licencia municipal. Verifica en ' + city + '.',
    tienda_conveniencia: 'Las tiendas de conveniencia requieren registro IMPI si usas marca propia. Consulta el módulo de Trámites para la ruta completa en ' + city + '.',
  }
  const tramitesInsight = tramitesInsightMap[businessType] ??
    `Inicia los trámites del Ayuntamiento de ${city} lo antes posible — la licencia de funcionamiento es el trámite que más demora.`

  // ── Ensamble ───────────────────────────────────────────────────────────────
  return [
    {
      id: 'ubicacion',
      theme: locationTheme,
      icon: MapPin,
      title: 'Ubicación',
      value: locationValue,
      summary: locationSummary,
      details: locationDetails,
      insight: locationInsight,
    },
    {
      id: 'competencia',
      theme: competenciaTheme,
      icon: Swords,
      title: 'Competencia',
      value: channelIsLocal ? 'Mercado local' : 'Canal digital',
      summary: `Tu negocio opera como "${businessType}" en ${city}. Revisa el módulo de Ubicación para ver competidores reales detectados en tu zona.`,
      details: competenciaDetails,
      insight: competenciaInsight,
    },
    {
      id: 'precios',
      theme: preciosTheme,
      icon: DollarSign,
      title: 'Precios & Márgen',
      value: preciosValue,
      summary: preciosSummary,
      details: preciosDetails,
      insight: preciosInsight,
    },
    {
      id: 'demanda',
      theme: demandaTheme,
      icon: TrendingUp,
      title: 'Demanda & Escala',
      value: demandaValue,
      summary: demandaSummary,
      details: demandaDetails,
      insight: demandaInsight,
    },
    {
      id: 'financiero',
      theme: finanzasTheme,
      icon: BarChart3,
      title: 'Finanzas',
      value: finanzasValue,
      summary: finanzasSummary,
      details: finanzasDetails,
      insight: finanzasInsight,
    },
    {
      id: 'tramites',
      theme: 'yellow' as const,
      icon: FileText,
      title: 'Trámites',
      value: `${city}`,
      summary: `Necesitas completar varios permisos antes de abrir tu ${businessType} en ${city}.`,
      details: tramitesDetails,
      insight: tramitesInsight,
    },
  ]
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AnalisisPage() {
  const router = useRouter()
  const storeData = useOnboardingStore((s) => s.data)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  // Merge onboarding store with localStorage (store takes priority)
  // readLS() is safe here because this is a 'use client' component
  const merged = useMemo<Partial<OnboardingData>>(
    () => ({ ...readLS(), ...storeData }),
    [storeData],
  )
  const CARDS = useMemo(() => buildCards(merged), [merged])

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
    progressActive: '#60a5fa',
    progressDone:   '#1e40af',
    progressIdle:   '#0f2040',
    uiBg:        'rgba(10,22,40,0.85)',
    uiBorder:    '#1e3a5f',
    uiColor:     '#60a5fa',
  }

  // Tint the badge based on theme
  const themeBadge: Record<CardData['theme'], { bg: string; color: string }> = {
    green:  { bg: '#052e16', color: '#4ade80' },
    yellow: { bg: '#1c1917', color: '#fbbf24' },
    red:    { bg: '#1f0000', color: '#f87171' },
    blue:   { bg: '#0f2040', color: '#60a5fa' },
    purple: { bg: '#180b30', color: '#a78bfa' },
  }

  const badge = themeBadge[card.theme]

  // Business name from merged data for header
  const businessName = merged.businessName || merged.businessType || 'Tu negocio'

  return (
    <main
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ background: navy.bg, color: navy.titleColor }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${navy.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${navy.gridColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.7,
        }}
      />
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
        <p className="text-xs mt-1" style={{ color: navy.muted }}>
          {businessName} · Revisa cada módulo antes de ver tu proyecto completo
        </p>
      </div>

      {/* Card area */}
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
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-4"
                style={{ background: badge.bg, color: badge.color }}
              >
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
                  <p className="text-xs font-medium shrink-0 w-44 leading-relaxed" style={{ color: navy.muted }}>{d.label}</p>
                  <p className="text-xs text-right leading-relaxed" style={{ color: navy.valueText }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* ── Divisor ───────────────────────────────────────────────── */}
            <div className="border-t mx-6" style={{ borderColor: navy.divider }} />

            {/* ── Insight ───────────────────────────────────────────────── */}
            <div className="mx-6 my-3 rounded-xl border p-3" style={{ background: navy.insightBg, borderColor: navy.insightBdr }}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={11} strokeWidth={2} style={{ color: navy.muted }} />
                <p className="text-[10px] font-medium" style={{ color: navy.muted }}>Análisis</p>
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
