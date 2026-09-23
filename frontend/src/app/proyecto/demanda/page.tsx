'use client'

import DemandCurve from '@/components/charts/DemandCurve'

export default function DemandaPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Curva Oferta-Demanda</h1>
      <DemandCurve />
    </main>
  )
}
