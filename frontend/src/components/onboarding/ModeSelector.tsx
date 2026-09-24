'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, SlidersHorizontal, GitBranch, Bot, FileText, type LucideIcon } from 'lucide-react'

interface Mode {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

const MODES: Mode[] = [
  { id: 'completo',    icon: LayoutDashboard,    title: 'Análisis Completo',    description: 'Analiza todos los aspectos de tu negocio' },
  { id: 'especifico',  icon: SlidersHorizontal,  title: 'Análisis Específico',  description: 'Elige qué módulos quieres analizar' },
  { id: 'escenarios',  icon: GitBranch,           title: 'Simular Escenarios',   description: 'Proyecta el futuro de tu negocio' },
  { id: 'agente',      icon: Bot,                 title: 'Consultar al Agente',  description: 'Habla con el asesor IA de tu negocio' },
  { id: 'tramites',    icon: FileText,             title: 'Conocer mis Trámites', description: 'Ruta de permisos para tu tipo de negocio' },
]

interface ModeSelectorProps {
  onSelect?: (modeId: string) => void
}

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-center text-white mb-2">¿Qué quieres hacer?</h2>
      <p className="text-center text-gray-500 mb-8">Elige cómo empezar a construir tu Gemelo Digital</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODES.map((mode, i) => {
          const Icon = mode.icon
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.07 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect?.(mode.id)}
              className="flex flex-col items-start gap-2 p-5 rounded-2xl border border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 text-left transition-colors"
            >
              <Icon size={24} strokeWidth={1.75} className="text-blue-400" />
              <span className="font-semibold text-white">{mode.title}</span>
              <span className="text-sm text-gray-500">{mode.description}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
