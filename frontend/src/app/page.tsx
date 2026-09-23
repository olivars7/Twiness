'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const BUSINESS_TYPES = [
  { icon: '☕', label: 'Cafetería' },
  { icon: '✂️', label: 'Barbería' },
  { icon: '🏪', label: 'Tienda de conveniencia' },
]

const STEPS = [
  { num: '01', title: 'Define tu negocio', desc: 'Tipo, nombre y descripción' },
  { num: '02', title: 'Elige tu ubicación', desc: 'Zona y análisis geográfico' },
  { num: '03', title: 'Analiza competidores', desc: 'Quién más compite contigo' },
  { num: '04', title: 'Fija tus precios', desc: 'Estrategia de pricing' },
  { num: '05', title: 'Proyecta tus finanzas', desc: 'Flujo de caja y break-even' },
  { num: '06', title: 'Consulta al agente IA', desc: 'Asesoría contextualizada watsonx' },
]

const FEATURES = [
  { color: 'bg-green-400', label: 'Oportunidad', desc: 'Factores positivos para tu negocio' },
  { color: 'bg-yellow-400', label: 'Precaución', desc: 'Puntos que debes vigilar' },
  { color: 'bg-red-400', label: 'Riesgo', desc: 'Alertas críticas a resolver' },
  { color: 'bg-blue-400', label: 'Sugerencia', desc: 'Recomendaciones del agente IA' },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-2xl font-black tracking-tight">
          viab<span className="text-blue-400">L</span>
        </span>
        <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
          MVP · Tijuana, B.C.
        </span>
      </nav>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 gap-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-800 bg-blue-950 text-blue-400 text-xs font-medium tracking-wide"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Gemelo Digital Comercial
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl sm:text-6xl font-black leading-tight tracking-tight max-w-3xl"
        >
          Simula tu negocio{' '}
          <span className="text-blue-400">antes de abrirlo.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-gray-400 text-lg leading-relaxed max-w-xl"
        >
          Define tu idea en 6 pasos y obtén un análisis de viabilidad,
          competencia, precios y finanzas — con datos reales de Tijuana.
        </motion.p>

        {/* Business type chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {BUSINESS_TYPES.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-sm font-medium"
            >
              {icon} {label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.35 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/selector')}
          className="mt-2 px-12 py-4 rounded-2xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-500 transition-colors"
        >
          Empezar →
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-600"
        >
          Sin registro · Sin tarjeta de crédito · Gratis
        </motion.p>
      </section>

      {/* ── 6 PASOS ── */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            Cómo funciona
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            6 pasos guiados para analizar tu negocio
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 * i }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-2"
              >
                <span className="text-blue-400 text-xs font-bold tracking-widest">{num}</span>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-gray-500 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SISTEMA DE TARJETAS ── */}
      <section className="px-6 py-16 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            Análisis con código de colores
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            Cada resultado viene categorizado para que sepas exactamente qué hacer
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ color, label, desc }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4"
              >
                <span className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        viab<span className="text-blue-500">L</span> · Hackathon MVP · Tijuana, B.C., México
      </footer>

    </main>
  )
}
