'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StepCardProps {
  stepNumber?: number
  totalSteps?: number
  title?: string
  children?: React.ReactNode
  onNext?: () => void
  onBack?: () => void
}

export default function StepCard({
  stepNumber = 1,
  totalSteps = 6,
  title = 'Paso',
  children,
  onNext,
  onBack,
}: StepCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepNumber}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-lg p-8"
      >
        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">
          Paso {stepNumber} de {totalSteps}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="mb-8">{children}</div>
        <div className="flex justify-between gap-3">
          {onBack && stepNumber > 1 && (
            <button
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              ← Atrás
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              {stepNumber === totalSteps ? 'Finalizar ✓' : 'Siguiente →'}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
