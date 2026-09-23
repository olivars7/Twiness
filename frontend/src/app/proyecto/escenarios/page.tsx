'use client'

import CashFlowChart from '@/components/charts/CashFlowChart'

export default function EscenariosPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Simulador de Escenarios "¿Qué pasa si...?"</h1>
      <CashFlowChart />
    </main>
  )
}
