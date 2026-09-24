'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER: [number, number] = [32.5149, -117.0382]
const DEFAULT_ZOOM = 13

interface ClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onLocationSelect }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface InteractiveMapProps {
  center?: [number, number]
  radius?: number
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function InteractiveMap({
  center,
  radius = 500,
  onLocationSelect,
}: InteractiveMapProps) {
  const pinPosition = center ?? DEFAULT_CENTER

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-800 shadow-sm"
      style={{ height: '500px' }}
    >
      <MapContainer
        center={pinPosition}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onLocationSelect && <ClickHandler onLocationSelect={onLocationSelect} />}
        <Marker position={pinPosition}>
          <Popup>
            {center ? 'Ubicación seleccionada' : 'Ubicación por defecto — haz clic para cambiar'}
          </Popup>
        </Marker>
        <Circle
          center={pinPosition}
          radius={radius}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
