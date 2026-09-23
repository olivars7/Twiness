'use client'

import { motion } from 'framer-motion'

interface ImprovementCardProps {
  title: string
  action: string
  onAction?: () => void
}

export default function ImprovementCard({ title, action, onAction }: ImprovementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border-l-4 border-blue-400 bg-blue-50 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-blue-900">💡 {title}</h3>
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
          Sugerencia
        </span>
      </div>
      <p className="text-sm text-blue-700 mb-3">{action}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
        >
          Ver opciones →
        </button>
      )}
    </motion.div>
  )
}
