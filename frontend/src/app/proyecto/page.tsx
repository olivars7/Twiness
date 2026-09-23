'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboardingStore'

const MODULES = [
  { href: '/proyecto/ubicacion',                    icon: '📍', label: 'Ubicación',          desc: 'Inteligencia geográfica de tu zona',           color: 'border-blue-700' },
  { href: '/proyecto/competencia',                  icon: '⚔️',  label: 'Competencia',         desc: 'Análisis de negocios similares cercanos',      color: 'border-yellow-700' },
  { href: '/proyecto/precios',                      icon: '💲', label: 'Precios',              desc: 'Comparador y estrategia de pricing',           color: 'border-green-700' },
  { href: '/proyecto/accesibilidad',                icon: '🚶', label: 'Accesibilidad',        desc: 'Tráfico peatonal y modos de transporte',       color: 'border-blue-700' },
  { href: '/proyecto/ciudad',                       icon: '🗺️',  label: 'Ciudad',               desc: 'Zonas de oportunidad en Tijuana',              color: 'border-purple-700' },
  { href: '/proyecto/demanda',                      icon: '📈', label: 'Demanda',              desc: 'Curva oferta-demanda de tu mercado',           color: 'border-green-700' },
  { href: '/proyecto/financiero/estado-resultados', icon: '📊', label: 'Est. Resultados',     desc: 'Ingresos, costos y utilidad proyectada',       color: 'border-blue-700' },
  { href: '/proyecto/financiero/break-even',        icon: '⚖️',  label: 'Break-even',           desc: 'Punto de equilibrio y margen de seguridad',   color: 'border-yellow-700' },
  { href: '/proyecto/financiero/apalancamiento',    icon: '🔧', label: 'Apalancamiento',       desc: 'Estructura de costos fijos vs. variables',     color: 'border-red-700' },
  { href: '/proyecto/escenarios',                   icon: '🔮', label: 'Escenarios',           desc: 'Simulador ¿Qué pasa si...?',                   color: 'border-purple-700' },
  { href: '/proyecto/scamper',                      icon: '💡', label: 'SCAMPER',              desc: '6 variantes de tu negocio generadas por IA',  color: 'border-blue-700' },
  { href: '/proyecto/tramites',                     icon: '🧾', label: 'Trámites',             desc: 'Ruta de permisos RETyS para Tijuana',          color: 'border-yellow-700' },
  { href: '/proyecto/escudo',                       icon: '🛡️',  label: 'Escudo',               desc: 'Alertas y verificación del emprendedor',       color: 'border-red-700' },
  { href: '/proyecto/agente',                       icon: '🤖', label: 'Agente IA',            desc: 'Asesor contextualizado por watsonx.ai',        color: 'border-blue-700' },
]

export default function ProyectoHubPage() {
  const { data } = useOnboardingStore()
  const businessName = data.businessName || 'Mi Negocio'
  const businessType = data.businessType || ''

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-black tracking-tight text-white"
        >
          {businessName}
        </motion.h1>
        {businessType && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-sm mt-1"
          >
            {businessType} · Tijuana, B.C.
          </motion.p>
        )}
      </div>

      {/* Viability summary placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 p-5 rounded-2xl border border-gray-800 bg-gray-900 flex items-center gap-5"
      >
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-yellow-400 shrink-0">
          <span className="text-2xl font-black text-white">—</span>
          <span className="text-xs text-gray-500">Índice</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Índice de Viabilidad</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Completa los módulos para calcular tu índice ponderado de viabilidad.
            Los factores se ponderan: demanda 25%, competencia 20%, NSE 20%, accesibilidad 15%, costos 10%, POIs 10%.
          </p>
        </div>
      </motion.div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(({ href, icon, label, desc, color }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 * i }}
            whileHover={{ scale: 1.02 }}
          >
            <Link
              href={href}
              className={`flex flex-col gap-3 p-5 rounded-2xl border bg-gray-900 hover:bg-gray-800 transition-colors h-full ${color}`}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
