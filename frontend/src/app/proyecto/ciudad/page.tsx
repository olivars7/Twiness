'use client'

import dynamic from 'next/dynamic'

const HeatmapLayer = dynamic(
  () => import('@/components/maps/HeatmapLayer'),
  { ssr: false }
)

export default function CiudadPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Análisis de Ciudad / Zonas</h1>
      <HeatmapLayer />
    </main>
  )
}
