'use client'

import { motion } from 'framer-motion'
import ChatPanel from '@/components/agent/ChatPanel'

export default function AgentePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Agente IA</h1>
        <p className="text-gray-500 text-sm mt-1">Asesor de negocios contextualizado · Impulsado por watsonx.ai</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ChatPanel />
      </motion.div>
    </div>
  )
}
