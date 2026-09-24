'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboardingStore'

interface Mode {
  id: string
  icon: string
  title: string
  description: string
  badge?: string
}

const MODES: Mode[] = [
  {
    id: 'completo',
    icon: '🔭',
    title: 'Análisis Completo',
    description: 'Analiza todos los aspectos de tu negocio: ubicación, competencia, precios, finanzas y más.',
    badge: 'Recomendado',
  },
  {
    id: 'especifico',
    icon: '🎯',
    title: 'Análisis Específico',
    description: 'Elige exactamente qué módulos quieres revisar de tu negocio.',
  },
  {
    id: 'escenarios',
    icon: '🔮',
    title: 'Simular Escenarios',
    description: 'Proyecta el futuro financiero de tu negocio bajo distintos supuestos.',
  },
  {
    id: 'agente',
    icon: '🤖',
    title: 'Consultar al Agente IA',
    description: 'Habla directamente con el asesor de negocios impulsado por watsonx.',
  },
  {
    id: 'tramites',
    icon: '🧾',
    title: 'Conocer mis Trámites',
    description: 'Obtén la ruta de permisos y trámites para tu tipo de negocio en Tijuana.',
  },
]

export default function SelectorPage() {
  const router = useRouter()
  const { setField } = useOnboardingStore()

  function handleSelect(modeId: string) {
    // Guardamos el modo elegido en el store para que el onboarding y el proyecto lo usen
    setField('analysisMode' as never, modeId as never)
    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => router.push('/')}>
          <div className="flex items-center gap-3">
            <img src="/logoBasico.png" alt="viabL" className="h-12 w-auto" />
            <span className="text-2xl font-black tracking-tight">viab<span className="text-blue-400">L</span></span>
          </div>
        </button>
        <span className="text-xs text-gray-600 font-medium tracking-widest uppercase">
          Selector de modo
        </span>
      </nav>

      {/* Content */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-10">

        <div className="text-center max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-black tracking-tight mb-3"
          >
            ¿Qué tipo de análisis necesitas?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-base"
          >
            Elige cómo quieres construir tu Gemelo Digital Comercial.
          </motion.p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 + i * 0.07 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(mode.id)}
              className="relative flex flex-col items-start gap-3 p-6 rounded-2xl border border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 text-left transition-colors"
            >
              {mode.badge && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  {mode.badge}
                </span>
              )}
              <span className="text-3xl">{mode.icon}</span>
              <span className="font-bold text-white text-base">{mode.title}</span>
              <span className="text-sm text-gray-500 leading-relaxed">{mode.description}</span>
            </motion.button>
          ))}
        </div>

      </section>
    </main>
  )
}
