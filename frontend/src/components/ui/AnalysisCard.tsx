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

const colorMap: Record<CardColor, { border: string; bg: string; badge: string; label: string }> = {
  green:  { border: 'border-green-400',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-800',  label: 'Oportunidad' },
  yellow: { border: 'border-yellow-400', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', label: 'Precaución' },
  red:    { border: 'border-red-400',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-800',       label: 'Riesgo' },
  blue:   { border: 'border-blue-400',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-800',     label: 'Sugerencia' },
}

export default function AnalysisCard({ color, title, value, description, children, onShowDetails }: AnalysisCardProps) {
  const styles = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl border-l-4 p-5 ${styles.border} ${styles.bg} shadow-sm`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}>
          {styles.label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
      {children}
      {onShowDetails && (
        <button
          onClick={onShowDetails}
          className="mt-3 text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Mostrar detalles
        </button>
      )}
    </motion.div>
  )
}
