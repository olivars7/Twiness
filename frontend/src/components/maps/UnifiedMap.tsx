'use client'

import { useEffect } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup, Circle,
  CircleMarker, useMapEvents, useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { CompetitorSnapshot } from '@/types/analysis'

// ─── Fix Leaflet default icon (webpack) ───────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Pin azul (negocio propio)
const userIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
})

// Pin rojo (competidores)
const competitorIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
})

const DEFAULT_CENTER: [number, number] = [32.5149, -117.0382]
const DEFAULT_ZOOM = 13

// ─── Helpers internos ────────────────────────────────────────────

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng) } })
  return null
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, map.getZoom(), { duration: 0.8 }) }, [center, map])
  return null
}

// ─── Zonas de calor — círculos simples superpuestos ───────────────
// (HeatmapLayer original no tenía datos reales, solo un TileLayer extra.
//  Aquí representamos las zonas con CircleMarker con opacidad.)
const HEAT_ZONES: { coords: [number, number]; label: string; score: number }[] = [
  { coords: [32.5309, -117.0189], label: 'Zona Río',        score: 82 },
  { coords: [32.5320, -117.0382], label: 'Centro Histórico', score: 68 },
  { coords: [32.5000, -116.9600], label: 'La Mesa',          score: 61 },
  { coords: [32.5089, -117.1200], label: 'Playas',           score: 54 },
  { coords: [32.5424, -116.9750], label: 'Otay',             score: 45 },
]

function heatColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 55) return '#f59e0b'
  return '#ef4444'
}

// ─── Props ───────────────────────────────────────────────────────

export interface UnifiedMapProps {
  center?:          [number, number]
  radius?:          number
  onLocationSelect?: (lat: number, lng: number) => void
  showHeatmap?:     boolean
  showCompetitors?: boolean
  userLocation?:    { lat: number; lng: number; name: string }
  competitors?:     CompetitorSnapshot[]
  radioMeters?:     number
}

// ─── Componente ──────────────────────────────────────────────────

export default function UnifiedMap({
  center,
  radius = 500,
  onLocationSelect,
  showHeatmap = false,
  showCompetitors = false,
  userLocation,
  competitors = [],
  radioMeters = 800,
}: UnifiedMapProps) {
  const pinPosition = center ?? DEFAULT_CENTER

  return (
    <div style={{ height: 500, background: '#000', position: 'relative', filter: 'invert(100%) hue-rotate(180deg) brightness(0.85) contrast(0.9)' }}>
      <MapContainer
        center={pinPosition}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        {/* ── TileLayer OpenStreetMap (sin API key) + filtro CSS dark en el wrapper ── */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── Recenter al cambiar ubicación ── */}
        {center && <RecenterMap center={center} />}

        {/* ── Click handler ── */}
        {onLocationSelect && <ClickHandler onLocationSelect={onLocationSelect} />}

        {/* ── Marcador y radio del negocio propio ── */}
        <Marker position={pinPosition} icon={userLocation ? userIcon : undefined}>
          <Popup>
            <strong>📍 {userLocation?.name ?? 'Mi negocio'}</strong><br />
            {center ? 'Ubicación seleccionada' : 'Haz clic en el mapa para cambiar'}
          </Popup>
        </Marker>
        <Circle
          center={pinPosition}
          radius={radius}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1.5 }}
        />

        {/* ── CAPA: Mapa de calor (zonas de oportunidad) ── */}
        {showHeatmap && HEAT_ZONES.map((z) => (
          <CircleMarker
            key={z.label}
            center={z.coords}
            radius={28}
            pathOptions={{
              color:       heatColor(z.score),
              fillColor:   heatColor(z.score),
              fillOpacity: 0.35,
              weight:      1.5,
            }}
          >
            <Popup>
              <strong>{z.label}</strong><br />
              Índice de oportunidad: {z.score}/100
            </Popup>
          </CircleMarker>
        ))}

        {/* ── CAPA: Pins de competidores ── */}
        {showCompetitors && userLocation && (
          <>
            {/* Radio de análisis de competencia */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radioMeters}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '6 4' }}
            />
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
          </>
        )}
      </MapContainer>
    </div>
  )
}
