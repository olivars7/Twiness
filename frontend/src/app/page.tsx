'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, TrendingUp, DollarSign, BarChart3, Scale, Bot,
  ArrowRight, Sparkles, ChevronRight,
} from 'lucide-react'
import SquareField from '@/components/ui/SquareField'

// ─── localStorage ─────────────────────────────────────────────────────────────
const LS_KEY = 'viabl_business_data_v1'
function readLS(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

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
  const [hasProject, setHasProject] = useState(false)
  const [projectName, setProjectName] = useState('')

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
        className="relative px-6 sm:px-12 pt-20 pb-10 overflow-hidden"
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

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-base leading-relaxed mb-10"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Analiza demanda, precios, competencia y finanzas en 6 pasos guiados —
              con datos reales de Tijuana y asesoría impulsada por{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>watsonx.ai.</span>
            </motion.p>

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
