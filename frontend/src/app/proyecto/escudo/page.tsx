'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const ALERTS = [
  { level: 'red' as const,    icon: '🔴', title: 'Sin licencia de funcionamiento',      desc: 'Operación sin licencia puede resultar en clausura inmediata. Tramitar en el Ayuntamiento.' },
  { level: 'red' as const,    icon: '🔴', title: 'Sin dictamen de protección civil',    desc: 'Obligatorio para establecimientos con afluencia de público. Riesgo de multa.' },
  { level: 'yellow' as const, icon: '🟡', title: 'RFC pendiente de activar',            desc: 'Necesitas RFC activo para emitir facturas y operar formalmente.' },
  { level: 'yellow' as const, icon: '🟡', title: 'Flujo de caja negativo los primeros 2 meses', desc: 'Normal en apertura, pero debes tener reserva de efectivo mínima de 3 meses de gastos fijos.' },
  { level: 'green' as const,  icon: '🟢', title: 'Zona con alta demanda detectada',     desc: 'Tu área tiene índice de oportunidad 82/100. Buena señal para lanzar.' },
  { level: 'green' as const,  icon: '🟢', title: 'Precio dentro de rango competitivo',  desc: 'Tu precio de $50 está dentro del rango de mercado ($38–$72).' },
  { level: 'blue' as const,   icon: '🔵', title: 'Considera un fondo de emergencia',    desc: 'Recomendamos tener $15,000–$20,000 de reserva operativa antes de abrir.' },
]

export default function EscudoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">🛡️ Escudo del Emprendedor</h1>
        <p className="text-gray-500 text-sm mt-1">Alertas de riesgo y verificación de cumplimiento</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="red"    title="Alertas críticas"  value={ALERTS.filter(a => a.level === 'red').length}    description="Deben resolverse antes de abrir." />
        <AnalysisCard color="yellow" title="Precauciones"      value={ALERTS.filter(a => a.level === 'yellow').length}  description="Aspectos que debes monitorear." />
        <AnalysisCard color="green"  title="Factores positivos" value={ALERTS.filter(a => a.level === 'green').length}  description="Señales favorables para tu negocio." />
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {ALERTS.map(({ level, icon, title, desc }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i }}
            whileHover={{ scale: 1.01 }}
          >
            <AnalysisCard color={level} title={`${icon} ${title}`} value="" description={desc} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
