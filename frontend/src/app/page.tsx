'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, TrendingUp, DollarSign, BarChart3, Scale, Bot,
  ArrowRight, Sparkles, ChevronRight, Sprout, Store,
  Coffee, Scissors, Utensils, Dumbbell, CheckCircle2, XCircle,
} from 'lucide-react'
import SquareField from '@/components/ui/SquareField'
import { useOnboardingStore } from '@/store/onboardingStore'

// ─── localStorage ─────────────────────────────────────────────────────────────
const LS_KEY = 'viabl_business_data_v1'
function readLS(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

// ─── Perfiles ─────────────────────────────────────────────────────────────────
const PROFILES = [
  {
    id: 'idea',
    icon: Sprout,
    title: 'Tengo una idea',
    desc: 'Quiero validar si mi negocio puede funcionar antes de invertir.',
    color: '#10b981',
    heroSub: 'Te ayudamos a analizar demanda, competencia y finanzas para saber si tu idea tiene futuro — antes de gastar un peso.',
  },
  {
    id: 'existing',
    icon: Store,
    title: 'Ya tengo un negocio',
    desc: 'Quiero analizar mi operación actual y encontrar áreas de mejora.',
    color: '#3b82f6',
    heroSub: 'Analiza el rendimiento actual de tu negocio, detecta riesgos y descubre oportunidades de crecimiento con datos reales.',
  },
]

// ─── Tipos de negocio ──────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { icon: Coffee,    label: 'Cafetería',   color: '#f59e0b', tagline: 'El aroma que atrae clientes' },
  { icon: Scissors,  label: 'Barbería',    color: '#8b5cf6', tagline: 'Estilo que fideliza' },
  { icon: Utensils,  label: 'Restaurante', color: '#ef4444', tagline: 'Sabor que hace regresar' },
  { icon: Dumbbell,  label: 'Gimnasio',    color: '#3b82f6', tagline: 'Salud que genera comunidad' },
]

// ─── Quiz ──────────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { id: 'local',       text: '¿Ya elegiste o tienes un local?' },
  { id: 'capital',     text: '¿Sabes cuánto dinero necesitas invertir?' },
  { id: 'competition', text: '¿Analizaste a tu competencia cercana?' },
  { id: 'demand',      text: '¿Estimaste cuántos clientes puede tener tu negocio?' },
]

// ─── Para quién ────────────────────────────────────────────────────────────────
const FOR_YOU = [
  'Quieres validar antes de invertir',
  'Tienes un presupuesto de hasta $500,000 MXN',
  'Tu negocio será en Tijuana, B.C.',
  'No tienes formación financiera formal',
  'Quieres datos reales, no suposiciones',
]
const NOT_FOR_YOU = [
  'Ya tienes inversores institucionales',
  'Buscas financiamiento bancario formal',
  'Operas fuera de Tijuana (por ahora)',
  'Necesitas contabilidad oficial o fiscal',
]

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MapPin,    color: '#3b82f6', title: 'Zona Estratégica',    desc: 'Entorno, competencia y zonas de oportunidad geográfica en Tijuana.' },
  { icon: TrendingUp, color: '#10b981', title: 'Demanda & Mercado',  desc: 'Curva oferta-demanda, mercado potencial y perfil de cliente.' },
  { icon: DollarSign, color: '#059669', title: 'Precios',            desc: 'Comparador de precios y estrategia de posicionamiento.' },
  { icon: BarChart3, color: '#6366f1', title: 'Estado de Resultados', desc: 'Ingresos, costos, márgenes y utilidad neta mensual proyectada.' },
  { icon: Scale,     color: '#f59e0b', title: 'Punto de Equilibrio', desc: 'Break-even, margen de seguridad y grado de apalancamiento.' },
  { icon: Bot,       color: '#7c3aed', title: 'Agente IA',           desc: 'Asesor inteligente contextualizado impulsado por watsonx.ai.' },
]

const STEPS = [
  { n: '01', label: 'Define tu negocio',      sub: 'Tipo, nombre y descripción' },
  { n: '02', label: 'Ubicación y entorno',    sub: 'Zona y análisis geográfico' },
  { n: '03', label: 'Finanzas base',          sub: 'Precios, costos y gastos' },
  { n: '04', label: 'Análisis de viabilidad', sub: 'Demanda, competencia, precios' },
  { n: '05', label: 'Proyecciones',           sub: 'Flujo de caja y break-even' },
  { n: '06', label: 'Asesoría con IA',        sub: 'Watsonx.ai contextualizado' },
]

const STATS = [
  { value: '6',         label: 'Herramientas de análisis incluidas' },
  { value: '5 min',     label: 'Para tener tu primer resultado' },
  { value: '100%',      label: 'Sin cuentas ni contraseñas' },
]

// ─── Monitor mockup ───────────────────────────────────────────────────────────
function MonitorMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Monitor shell */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#0d0d0f',
          border: '2px solid #1f1f23',
          boxShadow: '0 32px 80px 0 rgb(0 0 0 / 0.28), 0 0 0 1px rgb(255 255 255 / 0.04) inset',
        }}
      >
        {/* Topbar chrome */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: '#181820', borderBottom: '1px solid #2a2a30' }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
          <div
            className="flex-1 mx-4 h-5 rounded-md flex items-center justify-center"
            style={{ background: '#0f0f14', border: '1px solid #2e2e38' }}
          >
            <span className="text-[10px] font-medium tracking-wide" style={{ color: '#4b5563' }}>
              twiness.app/proyecto
            </span>
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '1536/784' }}>
          <img
            src="/footage.png"
            alt="viabL dashboard"
            className="w-full h-full object-cover object-top"
            style={{ display: 'block' }}
          />
          {/* Subtle vignette so image blends into the dark shell */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(13,13,15,0.55) 100%)' }}
          />
        </div>
      </div>

      {/* Monitor stand */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-3" style={{ background: '#181820', borderRadius: '0 0 4px 4px' }} />
        <div
          className="w-32 h-2 rounded-full"
          style={{ background: '#1a1a22', marginTop: 1, boxShadow: '0 2px 8px 0 rgb(0 0 0 / 0.35)' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()
  const { setField, setStep } = useOnboardingStore()
  const [hasProject, setHasProject]   = useState(false)
  const [projectName, setProjectName] = useState('')
  const [activeProfile, setActiveProfile] = useState<'idea' | 'existing' | null>(null)
  const [quizAnswers, setQuizAnswers]     = useState<Record<string, boolean | null>>({})
  const [quizDone, setQuizDone]           = useState(false)
  const [scrolled, setScrolled]           = useState(false)

  function goToOnboardingAsExisting() {
    setField('businessStatus', 'existente')
    setStep(1, 1) // skip Step0 (etapa del negocio)
    router.push('/onboarding')
  }

  const currentProfile = PROFILES.find(p => p.id === activeProfile)
  const answeredCount  = Object.values(quizAnswers).filter(v => v !== null).length
  const yesCount       = Object.values(quizAnswers).filter(v => v === true).length
  const quizReady      = answeredCount === QUIZ_QUESTIONS.length

  function quizMessage() {
    if (yesCount === 4) return { text: '¡Excelente! Tienes bases sólidas. Twiness te ayudará a afinar los detalles.', color: '#10b981' }
    if (yesCount >= 2) return { text: `Tienes ${4 - yesCount} área(s) clave por definir. Twiness las analiza por ti.`, color: '#f59e0b' }
    return { text: `Te faltan ${4 - yesCount} puntos críticos antes de abrir. Twiness te guía paso a paso.`, color: '#ef4444' }
  }

  useEffect(() => {
    const ls = readLS()
    if (ls.businessName) { setHasProject(true); setProjectName(ls.businessName) }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="flex flex-col overflow-x-hidden" style={{ background: '#fafafa', color: 'var(--color-text)' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          padding: scrolled ? '12px 16px 0' : '0',
          transition: 'padding 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
      <nav
        className="w-full flex items-center justify-between pointer-events-auto"
        style={{
          maxWidth: scrolled ? '64rem' : '100%',
          background: scrolled ? 'rgba(250,250,250,0.45)' : 'rgba(250,250,250,0.96)',
          backdropFilter: scrolled ? 'blur(28px)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(0px)',
          border: scrolled ? '1px solid rgba(0,0,0,0.07)' : 'none',
          borderBottom: scrolled ? undefined : '1px solid rgba(0,0,0,0.06)',
          borderRadius: scrolled ? '1rem' : '0',
          boxShadow: scrolled ? '0 4px 28px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.03)' : 'none',
          padding: scrolled ? '10px 20px' : '12px 24px',
          transition: 'max-width 0.35s cubic-bezier(0.16,1,0.3,1), border-radius 0.35s cubic-bezier(0.16,1,0.3,1), background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease, border 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo-black.png" alt="Twiness" className="h-8 w-auto" />
          <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sora)' }}>
            Twiness
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <AnimatePresence>
            {hasProject && (
              <>
                <motion.button
                  key="nav-project"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  onClick={() => router.push('/proyecto')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl"
                  style={{ background: '#3b82f610', color: '#3b82f6', border: '1px solid #3b82f624' }}
                >
                  <Sparkles size={11} strokeWidth={2} />
                  {projectName}
                </motion.button>
                <motion.button
                  key="nav-analisis"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.05 }}
                  onClick={() => router.push('/analisis')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl"
                  style={{ background: '#0f0f1008', color: 'var(--color-text-secondary)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <BarChart3 size={11} strokeWidth={2} />
                  Análisis
                </motion.button>
              </>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: '#0f0f10', color: '#fff' }}
          >
            Empezar
            <ArrowRight size={13} strokeWidth={2.5} />
          </motion.button>
        </div>
      </nav>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative px-6 sm:px-12 pt-24 pb-10 overflow-hidden"
        style={{ background: '#fafafa' }}
      >
        {/* Animated navy squares */}
        <SquareField />

        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.5,
          }}
        />
        {/* Radial fade to mask the grid at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #fafafa 0%, transparent 80%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #fafafa)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left: text + CTAs ── */}
          <div className="flex-1 min-w-0 flex flex-col">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7 self-start"
              style={{ border: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-text-secondary)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
              Gemelo Digital Comercial · Tijuana, B.C.
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-tight mb-6"
              style={{ color: '#0f0f10' }}
            >
              Asegúrate que tu negocio{' '}
              <span
                style={{
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  textDecorationColor: '#3b82f630',
                  textUnderlineOffset: '6px',
                }}
              >
                sea viable
              </span>
              {' '}antes de invertir...
            </motion.h1>

            {/* Sub — cambia según perfil */}
            <motion.p
              key={activeProfile ?? 'default'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-base leading-relaxed mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {currentProfile
                ? currentProfile.heroSub
                : 'Analiza demanda, precios, competencia y finanzas en 6 pasos guiados — con datos reales de Tijuana y asesoría impulsada por watsonx.ai.'}
            </motion.p>

            {/* Selector de perfil */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              {PROFILES.map((p) => {
                const Icon = p.icon
                const active = activeProfile === p.id
                return (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.04, boxShadow: `0 8px 28px 0 ${active ? p.color : '#0f0f10'}40` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => p.id === 'existing' ? goToOnboardingAsExisting() : router.push('/onboarding')}
                    className="flex-1 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm"
                    style={{
                      background: active ? p.color : '#0f0f10',
                      color: '#fff',
                      boxShadow: `0 4px 14px 0 ${active ? p.color : '#0f0f10'}30`,
                    }}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {p.title}
                    <ArrowRight size={14} strokeWidth={2.5} className="ml-auto" />
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Nota sin registro */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Sin registro · Sin tarjeta · 100% gratis
            </motion.p>
          </div>

          {/* ── Right: monitor ── */}
          <div className="w-full lg:w-[55%] shrink-0">
            <MonitorMockup />
          </div>

        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <span className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: '#0f0f10' }}>{value}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section
        className="px-6 sm:px-12 py-20"
        style={{ background: '#fff', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6b6b78' }}>Proceso</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: '#0f0f10' }}>
              De la idea al análisis<br />en 6 pasos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STEPS.map(({ n, label, sub }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-5 px-5 py-5 rounded-2xl"
                style={{ background: '#fafafa', border: '1px solid var(--color-border)' }}
              >
                <span
                  className="shrink-0 leading-none select-none"
                  style={{
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#0f0f10',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    marginTop: '-4px',
                  }}
                >
                  {n}
                </span>
                <div className="pt-1">
                  <p className="text-sm font-semibold" style={{ color: '#0f0f10' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ───────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-20" style={{ background: '#fff', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>Transparencia</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: '#0f0f10' }}>
              ¿Twiness es para ti?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="rounded-2xl p-6 space-y-3"
              style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}
            >
              <p className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#15803d' }}>
                <CheckCircle2 size={16} /> Sí es para ti si...
              </p>
              {FOR_YOU.map((item) => (
                <p key={item} className="text-sm flex items-center gap-2" style={{ color: '#166534' }}>
                  <CheckCircle2 size={14} strokeWidth={2.5} style={{ color: '#16a34a', flexShrink: 0 }} />
                  {item}
                </p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-2xl p-6 space-y-3"
              style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}
            >
              <p className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#dc2626' }}>
                <XCircle size={16} /> No es para ti si...
              </p>
              {NOT_FOR_YOU.map((item) => (
                <p key={item} className="text-sm flex items-center gap-2" style={{ color: '#991b1b' }}>
                  <XCircle size={14} strokeWidth={2.5} style={{ color: '#dc2626', flexShrink: 0 }} />
                  {item}
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────────────────── */}
      <section
        className="relative px-6 sm:px-12 py-24 overflow-hidden"
        style={{ background: '#0f0f10' }}
      >
        {/* Subtle grid on dark bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-7">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight"
          >
            ¿Listo para validar tu idea?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm leading-relaxed"
            style={{ color: '#64748b' }}
          >
            Empieza gratis en menos de 5 minutos. Sin registro, sin tarjeta de crédito.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.12 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/onboarding')}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-bold"
              style={{ background: '#ffffff', color: '#0f0f10', boxShadow: '0 4px 20px 0 rgb(255 255 255 / 0.12)' }}
            >
              Empezar ahora
              <ArrowRight size={15} strokeWidth={2.5} />
            </motion.button>

            <AnimatePresence>
              {hasProject && (
                <motion.button
                  key="bottom-cta"
                  initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/proyecto')}
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-semibold"
                  style={{ background: '#3b82f614', color: '#60a5fa', border: '1px solid #3b82f630' }}
                >
                  <ChevronRight size={14} strokeWidth={2.2} />
                  Ir a &ldquo;{projectName}&rdquo;
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className="py-5 text-center text-xs"
        style={{ background: '#0f0f10', borderTop: '1px solid #1f1f23', color: '#374151' }}
      >
        Twiness · Hackathon MVP · Tijuana, B.C., México
      </footer>

    </main>
  )
}
