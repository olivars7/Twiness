'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Dot grid decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #dbeafe 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-xs font-medium tracking-wide"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Gemelo Digital para tu negocio
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl font-bold text-gray-900 leading-tight tracking-tight"
        >
          Conoce si tu negocio{' '}
          <span className="text-blue-600">va a funcionar</span>
          <br />antes de invertir.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-gray-400 text-lg leading-relaxed"
        >
          Responde unas preguntas sobre tu idea y recibe un análisis real
          de viabilidad, competencia y finanzas — sin necesitar ser experto.
        </motion.p>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/onboarding')}
          className="mt-2 px-10 py-4 rounded-2xl bg-blue-600 text-white text-lg font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Empezar →
        </motion.button>

        {/* Micro-copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-300"
        >
          Sin registro · Sin tarjeta de crédito · Gratis
        </motion.p>
      </div>
    </main>
  )
}
