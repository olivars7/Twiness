'use client'

import { motion } from 'framer-motion'
import AnalysisCard from '@/components/ui/AnalysisCard'

const SCAMPER_CARDS = [
  { letter: 'S', label: 'Sustituir',  idea: 'Sustituir el café físico por un modelo de suscripción mensual de café en oficinas. Reduce renta y aumenta recurrencia.' },
  { letter: 'C', label: 'Combinar',   idea: 'Combinar cafetería con espacio de coworking. Clientes pagan por horas de trabajo + consumo mínimo.' },
  { letter: 'A', label: 'Adaptar',    idea: 'Adaptar el menú a temporadas: bebidas frías en verano, atole y ponche en diciembre. Mayor relevancia estacional.' },
  { letter: 'M', label: 'Modificar',  idea: 'Modificar el servicio para incluir entrega por aplicación propia a oficinas en radio de 1 km.' },
  { letter: 'P', label: 'Para otro uso', idea: 'Usar el espacio de madrugada como cocina oscura (dark kitchen) para desayunos empresariales.' },
  { letter: 'E', label: 'Eliminar',   idea: 'Eliminar la caja física — solo pagos digitales. Reduce tiempo de cobro y costos operativos.' },
  { letter: 'R', label: 'Reorganizar', idea: 'Reorganizar el horario: abrir solo 7–11 am y 4–8 pm. Reduce personal y costos de energía en horas muertas.' },
]

export default function ScamperPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">💡 Variantes de tu Negocio — SCAMPER</h1>
        <p className="text-gray-500 text-sm mt-1">7 ideas generadas por IA para reinventar tu modelo de negocio</p>
      </motion.div>

      <AnalysisCard color="blue" title="¿Qué es SCAMPER?" value="Marco de innovación"
        description="SCAMPER te ayuda a encontrar nuevas versiones de tu negocio: Sustituir, Combinar, Adaptar, Modificar, Para otro uso, Eliminar, Reorganizar." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCAMPER_CARDS.map(({ letter, label, idea }, i) => (
          <motion.div key={letter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.07 * i }}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 font-black text-lg flex items-center justify-center">
                {letter}
              </span>
              <span className="font-semibold text-white">{label}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{idea}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
