'use client'

import { motion } from 'framer-motion'

type CardColor = 'green' | 'yellow' | 'red' | 'blue'

interface AnalysisCardProps {
  color: CardColor
  title: string
  value: string | number
  description: string
  children?: React.ReactNode
  onShowDetails?: () => void
}

const colorMap: Record<CardColor, { accent: string; badge: string; label: string }> = {
  green:  { accent: '#10b981', badge: 'bg-emerald-50 text-emerald-700',  label: 'Oportunidad' },
  yellow: { accent: '#f59e0b', badge: 'bg-amber-50 text-amber-700',      label: 'Precaución'  },
  red:    { accent: '#ef4444', badge: 'bg-red-50 text-red-700',          label: 'Riesgo'      },
  blue:   { accent: '#3b82f6', badge: 'bg-blue-50 text-blue-700',        label: 'Sugerencia'  },
}

export default function AnalysisCard({ color, title, value, description, children, onShowDetails }: AnalysisCardProps) {
  const styles = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02 }}
      className="card rounded-2xl p-5"
      style={{ borderLeft: `4px solid ${styles.accent}` }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}>
          {styles.label}
        </span>
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{value}</p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      {children}
      {onShowDetails && (
        <button
          onClick={onShowDetails}
          className="mt-3 text-sm underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Mostrar detalles
        </button>
      )}
    </motion.div>
  )
}
