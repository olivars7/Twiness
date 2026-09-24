'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import AnalysisCard from '@/components/ui/AnalysisCard'
import DemandCurve from '@/components/charts/DemandCurve'

export default function DemandaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: '#000000' }}>
          <TrendingUp size={24} strokeWidth={2.2} />
          Curva Oferta-Demanda
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Estimación del mercado potencial en tu zona</p>
      </motion.div>

      {/* Dark insight box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="dark-box rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs dark-box-muted mb-1">Mercado potencial</p>
            <p className="text-xl font-black">~3,200 <span className="text-sm font-normal dark-box-muted">personas</span></p>
            <p className="text-xs dark-box-muted mt-1">Radio 800 m, perfil objetivo</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-1">Elasticidad precio</p>
            <p className="text-xl font-black dark-box-accent">Media</p>
            <p className="text-xs dark-box-muted mt-1">Sensibles en rango $40–$80</p>
          </div>
          <div>
            <p className="text-xs dark-box-muted mb-1">Cuota realista mes 6</p>
            <p className="text-xl font-black">2–5%</p>
            <p className="text-xs dark-box-muted mt-1">~64–160 clientes/día</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalysisCard color="green"  title="Mercado potencial" value="~3,200 personas" description="Población activa en radio de 800 m con perfil de cliente objetivo." />
        <AnalysisCard color="yellow" title="Elasticidad precio" value="Media"           description="Consumidores sensibles a precio en rango $40–$80." />
        <AnalysisCard color="blue"   title="Cuota estimada"     value="2–5%"            description="Captura realista del 2–5% del mercado en los primeros 6 meses." />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <DemandCurve />
      </motion.div>
    </div>
  )
}
