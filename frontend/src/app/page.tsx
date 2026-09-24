'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, TrendingUp, DollarSign, BarChart3, Scale, Bot,
  ArrowRight, Sparkles, ChevronRight, Sprout, Store,
  Coffee, Scissors, ShoppingCart, CheckCircle2, XCircle,
} from 'lucide-react'
import SquareField from '@/components/ui/SquareField'

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
  { icon: Coffee,      label: 'Cafetería',              color: '#f59e0b', desc: 'Café, bebidas y alimentos ligeros' },
  { icon: Scissors,    label: 'Barbería',                color: '#8b5cf6', desc: 'Corte, estética y cuidado personal' },
  { icon: ShoppingCart,label: 'Tienda de conveniencia', color: '#10b981', desc: 'Abarrotes, miscelánea y productos básicos' },
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
  '✅ Quieres validar antes de invertir',
  '✅ Tienes un presupuesto de hasta $500k MXN',
  '✅ Tu negocio será en Tijuana, B.C.',
  '✅ No tienes formación financiera formal',
  '✅ Quieres datos reales, no suposiciones',
]
const NOT_FOR_YOU = [
  '❌ Ya tienes inversores institucionales',
  '❌ Buscas financiamiento bancario formal',
  '❌ Operas fuera de Tijuana (por ahora)',
  '❌ Necesitas contabilidad oficial o fiscal',
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
  { value: '6',    label: 'Módulos de análisis' },
  { value: '< 5m', label: 'Para tu primer análisis' },
  { value: '100%', label: 'Gratis y sin registro' },
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
              viabl.app/proyecto
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
  const [hasProject, setHasProject]   = useState(false)
  const [projectName, setProjectName] = useState('')
  const [activeProfile, setActiveProfile] = useState<'idea' | 'existing' | null>(null)
  const [quizAnswers, setQuizAnswers]     = useState<Record<string, boolean | null>>({})
  const [quizDone, setQuizDone]           = useState(false)

  const currentProfile = PROFILES.find(p => p.id === activeProfile)
  const answeredCount  = Object.values(quizAnswers).filter(v => v !== null).length
  const yesCount       = Object.values(quizAnswers).filter(v => v === true).length
  const quizReady      = answeredCount === QUIZ_QUESTIONS.length

  function quizMessage() {
    if (yesCount === 4) return { text: '¡Excelente! Tienes bases sólidas. viabL te ayudará a afinar los detalles.', color: '#10b981' }
    if (yesCount >= 2) return { text: `Tienes ${4 - yesCount} área(s) clave por definir. viabL las analiza por ti.`, color: '#f59e0b' }
    return { text: `Te faltan ${4 - yesCount} puntos críticos antes de abrir. viabL te guía paso a paso.`, color: '#ef4444' }
  }

  useEffect(() => {
    const ls = readLS()
    if (ls.businessName) { setHasProject(true); setProjectName(ls.businessName) }
  }, [])

  return (
    <main className="flex flex-col overflow-x-hidden" style={{ background: '#fafafa', color: 'var(--color-text)' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
      <nav
        className="w-full max-w-5xl flex items-center justify-between px-5 py-3 pointer-events-auto"
        style={{
          background: 'rgba(250,250,250,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.07), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/logoBasico.png" alt="viabL" className="h-10 w-auto" />
          <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sora)' }}>
            viab<span style={{ color: '#3b82f6' }}>L</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <AnimatePresence>
            {hasProject && (
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
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/onboarding')}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: '#0f0f10', color: '#fff' }}
          >
            Empezar →
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
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveProfile(active ? null : p.id as 'idea' | 'existing')}
                    className="flex-1 flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: active ? `${p.color}12` : '#fff',
                      border: `1.5px solid ${active ? p.color : 'var(--color-border)'}`,
                      boxShadow: active ? `0 0 0 3px ${p.color}20` : '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    }}
                  >
                    <span className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${p.color}15` }}>
                      <Icon size={16} style={{ color: p.color }} />
                    </span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#0f0f10' }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{p.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 28px 0 rgb(15 15 16 / 0.22)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold"
                style={{ background: '#0f0f10', color: '#fff', boxShadow: '0 4px 14px 0 rgb(15 15 16 / 0.16)' }}
              >
                Empezar gratis
                <ArrowRight size={15} strokeWidth={2.5} />
              </motion.button>

              <AnimatePresence>
                {hasProject && (
                  <motion.button
                    key="hero-project"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 26, delay: 0.12 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/proyecto')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold"
                    style={{ background: '#fff', color: '#3b82f6', border: '1px solid #3b82f628', boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.06)' }}
                  >
                    <Sparkles size={13} strokeWidth={2} />
                    Continuar con &ldquo;{projectName}&rdquo;
                  </motion.button>
                )}
              </AnimatePresence>

              <p className="w-full text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Sin registro · Sin tarjeta · 100% gratis
              </p>
            </motion.div>
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

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-20" style={{ background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#3b82f6' }}>Módulos</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: '#0f0f10' }}>
              Todo lo que necesitas<br />para decidir con datos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.32, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group"
                style={{
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderTop: `2.5px solid ${color}`,
                  boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.05)',
                  cursor: 'default',
                }}
              >
                {/* Ghost icon */}
                <div className="absolute bottom-[-8px] right-[-8px] pointer-events-none" aria-hidden>
                  <Icon size={72} strokeWidth={1} style={{ color, opacity: 0.06 }} />
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12` }}>
                  <Icon size={17} strokeWidth={2} style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: '#0f0f10' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
                className="flex items-start gap-4 px-5 py-4 rounded-2xl"
                style={{ background: '#fafafa', border: '1px solid var(--color-border)' }}
              >
                <span
                  className="font-display shrink-0 text-xs font-extrabold w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: '#0f0f10', color: '#fff' }}
                >
                  {n}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f0f10' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPOS DE NEGOCIO ────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-20" style={{ background: '#fff', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#3b82f6' }}>MVP · Tijuana</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: '#0f0f10' }}>
              ¿Qué tipo de negocio<br />quieres analizar?
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
              Selecciona tu giro y empieza el análisis en menos de 5 minutos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BUSINESS_TYPES.map(({ icon: Icon, label, color, desc }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: `0 12px 32px 0 ${color}22` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/onboarding')}
                className="flex flex-col items-start gap-4 p-6 rounded-2xl text-left"
                style={{
                  background: '#fafafa',
                  border: `1.5px solid ${color}30`,
                  borderTop: `3px solid ${color}`,
                  boxShadow: '0 2px 8px 0 rgb(0 0 0 / 0.04)',
                  cursor: 'pointer',
                }}
              >
                <span className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}15` }}>
                  <Icon size={22} style={{ color }} />
                </span>
                <div>
                  <p className="font-bold text-base mb-1" style={{ color: '#0f0f10' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color }}>
                  Analizar este negocio <ArrowRight size={12} />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIZ DE RIESGO ──────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-20" style={{ background: '#fafafa', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>Diagnóstico rápido</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: '#0f0f10' }}>
              ¿Qué tan listo estás<br />para abrir tu negocio?
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
              Responde 4 preguntas y descubre qué le falta a tu plan.
            </p>
          </motion.div>

          <div className="space-y-3 mb-6">
            {QUIZ_QUESTIONS.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.07 }}
                className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
                style={{ background: '#fff', border: '1px solid var(--color-border)' }}
              >
                <p className="text-sm font-medium" style={{ color: '#0f0f10' }}>{q.text}</p>
                <div className="flex gap-2 shrink-0">
                  {[true, false].map((val) => {
                    const active = quizAnswers[q.id] === val
                    return (
                      <motion.button
                        key={String(val)}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => {
                          setQuizAnswers(prev => ({ ...prev, [q.id]: val }))
                          if (Object.keys({ ...quizAnswers, [q.id]: val }).length === QUIZ_QUESTIONS.length) setQuizDone(true)
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: active ? (val ? '#10b98120' : '#ef444420') : '#f3f4f6',
                          color: active ? (val ? '#10b981' : '#ef4444') : '#6b7280',
                          border: `1.5px solid ${active ? (val ? '#10b981' : '#ef4444') : 'transparent'}`,
                        }}
                      >
                        {val ? 'Sí' : 'No'}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {quizReady && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{
                  background: `${quizMessage().color}10`,
                  border: `1.5px solid ${quizMessage().color}40`,
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-bold mb-1" style={{ color: quizMessage().color }}>
                    {yesCount === 4 ? '🎉' : yesCount >= 2 ? '⚡' : '🚨'} {quizMessage().text}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    viabL analiza exactamente los puntos que te faltan — gratis y en minutos.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/onboarding')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
                  style={{ background: quizMessage().color, color: '#fff' }}
                >
                  Empezar análisis <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
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
              ¿viabL es para ti?
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
                <p key={item} className="text-sm" style={{ color: '#166534' }}>{item}</p>
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
                <p key={item} className="text-sm" style={{ color: '#991b1b' }}>{item}</p>
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
        viab<span style={{ color: '#3b82f6' }}>L</span>
        {' '}· Hackathon MVP · Tijuana, B.C., México
      </footer>

    </main>
  )
}
