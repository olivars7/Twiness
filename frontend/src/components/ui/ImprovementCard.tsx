'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface ImprovementCardProps {
  title: string
  action: string
  onAction?: () => void
}

export default function ImprovementCard({ title, action, onAction }: ImprovementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--color-card)', border: '1px solid #7c3aed30' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#7c3aed18', border: '1px solid #7c3aed30' }}
          >
            <Sparkles size={14} strokeWidth={1.75} style={{ color: '#a78bfa' }} />
          </div>
          <p
            className="text-sm font-semibold"
            style={{
              fontFamily: '"Playfair Display","Georgia","Times New Roman",serif',
              fontStyle: 'italic',
              color: 'var(--color-text)',
            }}
          >
            {title}
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: '#7c3aed18', color: '#a78bfa', border: '1px solid #7c3aed30' }}
        >
          IA
        </span>
      </div>
      <p className="text-sm leading-relaxed pl-1" style={{ color: 'var(--color-text-secondary)' }}>{action}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs font-semibold pl-1 transition-colors"
          style={{ color: '#a78bfa' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c4b5fd' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa' }}
        >
          Ver opciones →
        </button>
      )}
    </motion.div>
  )
}
