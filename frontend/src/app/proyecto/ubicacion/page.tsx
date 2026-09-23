'use client'

import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(
  () => import('@/components/maps/InteractiveMap'),
  { ssr: false }
)

export default function UbicacionPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Inteligencia de Ubicación</h1>
      <InteractiveMap />
    </main>
  )
}
