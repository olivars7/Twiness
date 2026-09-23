'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'
import DemandCurve from '@/components/charts/DemandCurve'

export default function DemandaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">📈 Curva Oferta-Demanda</h1>
        <p className="text-gray-500 text-sm mt-1">Estimación del mercado potencial en tu zona</p>
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
