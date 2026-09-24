'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { CompetitorSnapshot } from '@/types/analysis'

// Fix default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Pin azul para el negocio del usuario
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Pin rojo para competidores
const competitorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface CompetitorMapProps {
  userLocation: { lat: number; lng: number; name: string }
  competitors: CompetitorSnapshot[]
  radioMeters: number
}

export default function CompetitorMap({ userLocation, competitors, radioMeters }: CompetitorMapProps) {
  const center: [number, number] = [userLocation.lat, userLocation.lng]

  return (
    <div style={{ height: '380px', position: 'relative', zIndex: 0 }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Radio de análisis */}
        <Circle
          center={center}
          radius={radioMeters}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.07, weight: 1.5 }}
        />

        {/* Pin del usuario */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <strong>📍 {userLocation.name}</strong><br />
            Tu negocio
          </Popup>
        </Marker>

        {/* Pins de competidores */}
        {competitors.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={competitorIcon}>
            <Popup>
              <strong>{c.name}</strong><br />
              {c.rating ? `${c.rating} ★` : 'Sin rating'} · {c.distance} m<br />
              {c.reviewCount?.toLocaleString()} reseñas<br />
              <span style={{ color: c.openNow ? '#16a34a' : '#9ca3af' }}>
                {c.openNow ? '● Abierto' : '● Cerrado'}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
