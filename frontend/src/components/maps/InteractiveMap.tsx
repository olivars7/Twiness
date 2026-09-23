'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Tijuana, B.C. como ubicación por defecto (MVP placeholder)
const DEFAULT_CENTER: [number, number] = [32.5149, -117.0382]
const DEFAULT_ZOOM = 13

export default function InteractiveMap() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '500px' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={DEFAULT_CENTER}>
          <Popup>Tu ubicación seleccionada</Popup>
        </Marker>
        {/* Radio de análisis 500m */}
        <Circle center={DEFAULT_CENTER} radius={500} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />
      </MapContainer>
    </div>
  )
}
