'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER: [number, number] = [32.5149, -117.0382]
const DEFAULT_ZOOM = 12

interface Zone {
  name: string
  coords: [number, number]
}

interface FlyToZoneProps {
  selectedZone: string | null
  zones: Zone[]
}

function FlyToZone({ selectedZone, zones }: FlyToZoneProps) {
  const map = useMap()
  useEffect(() => {
    if (!selectedZone) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 })
      return
    }
    const zone = zones.find((z) => z.name === selectedZone)
    if (zone) {
      map.flyTo(zone.coords, 14, { duration: 1 })
    }
  }, [selectedZone, zones, map])
  return null
}

interface HeatmapLayerProps {
  selectedZone?: string | null
  zones?: Zone[]
}

export default function HeatmapLayer({ selectedZone = null, zones = [] }: HeatmapLayerProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-sm" style={{ height: '500px' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToZone selectedZone={selectedZone} zones={zones} />
      </MapContainer>
    </div>
  )
}
