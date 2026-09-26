'use client'

import { motion } from 'framer-motion'
import { Bot, Zap, TrendingUp, MapPin, DollarSign, Users, BarChart3 } from 'lucide-react'
import ChatPanel from '@/components/agent/ChatPanel'

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: '¿Mi negocio es viable?',
    prompt: '¿Mi negocio es viable con los datos que tengo actualmente? Dame un diagnóstico rápido.',
  },
  {
    icon: DollarSign,
    label: 'Estrategia de precios',
    prompt: '¿Cuál sería la mejor estrategia de precios para mi negocio considerando la competencia en la zona?',
  },
  {
    icon: MapPin,
    label: 'Análisis de ubicación',
    prompt: 'Analiza mi ubicación actual. ¿Es una buena zona para mi tipo de negocio?',
  },
  {
    icon: Users,
    label: 'Perfil de cliente ideal',
    prompt: '¿Quién es mi cliente ideal y cómo debería enfocar mi comunicación hacia él?',
  },
  {
    icon: BarChart3,
    label: 'Reducir punto de equilibrio',
    prompt: '¿Qué puedo hacer para reducir mi punto de equilibrio y llegar más rápido a la rentabilidad?',
  },
  {
    icon: Zap,
    label: 'Plan de acción en 30 días',
    prompt: 'Dame un plan de acción concreto para los próximos 30 días enfocado en hacer viable mi negocio.',
  },
]

export default function AgentePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: '#7c3aed18', border: '1px solid #7c3aed40' }}
          >
            <Bot size={20} strokeWidth={1.75} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1
              className="text-2xl"
              style={{ fontFamily: '"Playfair Display","Georgia","Times New Roman",serif', fontWeight: 700, fontStyle: 'italic', color: 'var(--color-text)' }}
            >
              Agente IA
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Asesor de negocios contextualizado · Impulsado por watsonx.ai
            </p>
          </div>
          <span
            className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: '#7c3aed18', color: '#a78bfa', border: '1px solid #7c3aed30' }}
          >
            watsonx.ai
          </span>
        </div>
      </motion.div>

      {/* ── Quick prompts ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Preguntas rápidas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all group"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onClick={() => {
                // Dispatch custom event that ChatPanel can listen to
                window.dispatchEvent(new CustomEvent('viabl:quick-prompt', { detail: prompt }))
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#7c3aed50'
                el.style.color = 'var(--color-text)'
                el.style.background = '#7c3aed08'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--color-border)'
                el.style.color = 'var(--color-text-secondary)'
                el.style.background = 'var(--color-card)'
              }}
            >
              <Icon size={13} strokeWidth={1.75} style={{ color: '#a78bfa', flexShrink: 0 }} />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Chat panel ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <ChatPanel />
      </motion.div>

      {/* ── Context note ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}>
        <p className="text-[10px] text-center" style={{ color: 'var(--color-text-muted)' }}>
          El agente tiene acceso a los datos de tu proyecto · Las respuestas son estimaciones, no asesoría financiera oficial
        </p>
      </motion.div>

    </div>
  )
}
