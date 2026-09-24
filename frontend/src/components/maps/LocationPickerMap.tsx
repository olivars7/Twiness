'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
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

// ─── Subcomponent: mover el mapa cuando el centro cambia ──────────────────────
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 15, { duration: 0.8 })
  }, [center, map])
  return null
}

// ─── Subcomponent: click handler ─────────────────────────────────────────────
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

// ─── Nominatim result type ────────────────────────────────────────────────────
interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export interface LocationPickerMapProps {
  lat?: number | null
  lng?: number | null
  onPick: (lat: number, lng: number, displayName?: string) => void
}

export default function LocationPickerMap({ lat, lng, onPick }: LocationPickerMapProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const markerPos: [number, number] | null =
    lat != null && lng != null ? [lat, lng] : null

  // Debounced Nominatim search
  function handleQueryChange(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function selectResult(r: NominatimResult) {
    const la = parseFloat(r.lat)
    const lo = parseFloat(r.lon)
    setFlyTo([la, lo])
    setQuery(r.display_name)
    setResults([])
    onPick(la, lo, r.display_name)
  }

  function handleMapClick(la: number, lo: number) {
    onPick(la, lo)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar dirección o lugar…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-text-muted)]"
            style={{ color: 'var(--color-text)' }}
          />
          {loading && (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </div>

        {/* Dropdown results */}
        {results.length > 0 && (
          <ul className="absolute z-[9999] left-0 right-0 mt-1 rounded-xl border shadow-lg overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            {results.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-50"
                  style={{ color: 'var(--color-text)' }}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border" style={{ height: 280, borderColor: 'var(--color-border)' }}>
        <MapContainer
          center={markerPos ?? DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handleMapClick} />
          {flyTo && <FlyTo center={flyTo} />}
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Haz clic en el mapa o busca una dirección para fijar la ubicación.
      </p>
    </div>
  )
}
