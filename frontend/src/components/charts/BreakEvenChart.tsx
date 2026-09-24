'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'

interface BreakEvenData {
  units: number
  revenue: number
  totalCost: number
  // puntos especiales: solo definidos en los índices marcados
  beRevenue?:      number
  beCost?:         number
  currentRevenue?: number
  currentCost?:    number
}

interface BreakEvenChartProps {
  data?: BreakEvenData[]
  breakEvenUnits?: number
  currentUnits?: number
  costosFijos?: number
  precio?: number
  costoVar?: number
}

const defaultData: BreakEvenData[] = Array.from({ length: 11 }, (_, i) => ({
  units: i * 100,
  revenue: i * 100 * 150,
  totalCost: 5000 + i * 100 * 80,
}))

// ─── Custom dot para puntos especiales ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SpecialDot(props: any) {
  const { cx, cy, fill = '#fff', label } = props
  if (cx === undefined || cy === undefined) return null
  if (isNaN(cx) || isNaN(cy)) return null

  return (
    <g>
      {/* Anillo exterior pulsante */}
      <circle cx={cx} cy={cy} r={10} fill={fill} fillOpacity={0.15} />
      {/* Dot sólido */}
      <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />
      {/* Etiqueta */}
      {label && (
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={fill}
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: number
}) {
  if (!active || !payload || payload.length === 0) return null

  // Filtra solo las series principales (ignora los puntos especiales ocultos)
  const main = payload.filter(p => p.name === 'Ingresos' || p.name === 'Costo Total')
  if (main.length < 2) return null

  const revenue   = main.find(p => p.name === 'Ingresos')?.value ?? 0
  const totalCost = main.find(p => p.name === 'Costo Total')?.value ?? 0
  const utilidad  = revenue - totalCost
  const positive  = utilidad >= 0

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 180,
      }}
    >
      <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        {typeof label === 'number' ? label.toLocaleString() : label} unidades
      </p>
      {main.map(p => (
        <div key={p.name} className="flex justify-between gap-6 text-xs mb-1">
          <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}</span>
          <span className="font-semibold" style={{ color: p.color }}>
            ${p.value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
      <div
        className="mt-2 pt-2 flex justify-between gap-6 text-xs font-bold"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {positive ? 'Utilidad' : 'Pérdida'}
        </span>
        <span style={{ color: positive ? '#16a34a' : '#dc2626' }}>
          {positive ? '+' : '−'}${Math.abs(utilidad).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  )
}

export default function BreakEvenChart({
  data = defaultData,
  breakEvenUnits = 625,
  currentUnits,
  costosFijos,
  precio,
  costoVar,
}: BreakEvenChartProps) {
  const maxX = data[data.length - 1]?.units ?? 1000

  // ─── Inyectar puntos especiales en los datos ────────────────────────────────
  // Para que Recharts los dibuje exactamente sobre las curvas, añadimos los
  // valores a los puntos del array cuyas units sean las más cercanas al valor
  // exacto, usando interpolación lineal.

  function interpolateY(xTarget: number, key: 'revenue' | 'totalCost'): number {
    for (let i = 0; i < data.length - 1; i++) {
      const a = data[i], b = data[i + 1]
      if (xTarget >= a.units && xTarget <= b.units) {
        const t = (xTarget - a.units) / (b.units - a.units)
        return a[key] + t * (b[key] - a[key])
      }
    }
    // Fallback: calcular directamente si tenemos precio y costoVar
    if (key === 'revenue' && precio !== undefined)  return xTarget * precio
    if (key === 'totalCost' && costosFijos !== undefined && costoVar !== undefined)
      return costosFijos + xTarget * costoVar
    return 0
  }

  // Punto de break-even: coordenadas exactas en ambas curvas (deberían ser iguales)
  const beY = isFinite(breakEvenUnits)
    ? interpolateY(breakEvenUnits, 'revenue')
    : null

  // Punto actual: coordenadas en Ingresos y CostoTotal
  const currentRevenueY  = currentUnits !== undefined ? interpolateY(currentUnits, 'revenue')   : null
  const currentTotalCostY = currentUnits !== undefined ? interpolateY(currentUnits, 'totalCost') : null

  // Enriquecer el array con los campos especiales en un punto sintético al final
  // Usamos series separadas (dataKey distintos) con `dot` custom, conectadas con
  // una línea invisible (strokeWidth=0). Solo tienen valor en UN punto.
  const enrichedData = data.map(d => ({ ...d })) as BreakEvenData[]

  // Añadir puntos sintéticos para BE y posición actual
  const extraPoints: BreakEvenData[] = []

  if (isFinite(breakEvenUnits) && beY !== null) {
    extraPoints.push({
      units: breakEvenUnits,
      revenue: interpolateY(breakEvenUnits, 'revenue'),
      totalCost: interpolateY(breakEvenUnits, 'totalCost'),
      beRevenue: beY,
      beCost: beY,
    })
  }

  if (currentUnits !== undefined && currentRevenueY !== null && currentTotalCostY !== null) {
    const existing = extraPoints.find(p => p.units === currentUnits)
    if (existing) {
      existing.currentRevenue = currentRevenueY
      existing.currentCost    = currentTotalCostY
    } else {
      extraPoints.push({
        units: currentUnits,
        revenue: currentRevenueY,
        totalCost: currentTotalCostY,
        currentRevenue: currentRevenueY,
        currentCost:    currentTotalCostY,
      })
    }
  }

  // Fusionar extra points en el array principal (ordenado por units)
  for (const ep of extraPoints) {
    const idx = enrichedData.findIndex(d => d.units === ep.units)
    if (idx >= 0) {
      enrichedData[idx] = { ...enrichedData[idx], ...ep }
    } else {
      enrichedData.push(ep)
      enrichedData.sort((a, b) => a.units - b.units)
    }
  }

  const [guideOpen, setGuideOpen] = useState(false)

  const currentColor = currentUnits !== undefined
    ? (currentUnits >= breakEvenUnits ? '#16a34a' : '#dc2626')
    : '#6b6b78'

  return (
    <div className="card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Punto de Equilibrio
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Break-even en{' '}
            <span className="font-semibold" style={{ color: '#6366f1' }}>
              {Math.ceil(breakEvenUnits).toLocaleString()} uds
            </span>
            {currentUnits !== undefined && (
              <> · Tú en{' '}
                <span className="font-semibold" style={{ color: currentColor }}>
                  {currentUnits.toLocaleString()} uds
                </span>{' '}
                <span style={{ color: currentColor }}>
                  ({currentUnits >= breakEvenUnits ? '▲ zona ganancia' : '▼ zona pérdida'})
                </span>
              </>
            )}
          </p>
        </div>
        {/* Leyenda de marcadores */}
        <div className="flex items-center gap-3 text-[10px] flex-wrap justify-end" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#ef444420', border: '1px solid #ef444460' }} />
            Zona de pérdida
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#16a34a20', border: '1px solid #16a34a60' }} />
            Zona de ganancia
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#6366f1', width: 8, height: 8 }} />
            Break-even
          </span>
          {currentUnits !== undefined && (
            <span className="flex items-center gap-1">
              <span className="inline-block rounded-full" style={{ background: currentColor, width: 8, height: 8 }} />
              Tú aquí
            </span>
          )}
        </div>
      </div>

      {/* ── Guía de lectura ── */}
      <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: 16 }}>
        <button
          onClick={() => setGuideOpen(v => !v)}
          className="w-full flex items-center justify-between py-2 text-left rounded-lg px-1 transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
        >
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            ¿Cómo leer esta gráfica?
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2.2}
            style={{
              color: 'var(--color-text-muted)',
              transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.22s ease',
              flexShrink: 0,
            }}
          />
        </button>

        {/* Contenido animado con max-height */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: guideOpen ? 400 : 0,
            opacity: guideOpen ? 1 : 0,
            transition: 'max-height 0.28s ease, opacity 0.2s ease',
          }}
        >
          <div className="rounded-xl px-3 py-3 mb-3 space-y-2.5 text-xs leading-relaxed"
            style={{ background: 'var(--color-surface, #f7f8fa)', border: '1px solid var(--color-border)' }}
          >
            {/* Líneas */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 w-2 h-2 rounded-full mt-0.5" style={{ background: 'var(--chart-1)' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Ingresos</span> — lo que entra según cuánto vendes.
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 w-2 h-2 rounded-full mt-0.5" style={{ background: 'var(--chart-2)' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Costo Total</span> — lo que gastas para operar.
                </p>
              </div>
            </div>

            {/* Cruce + zonas en una fila */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-2" style={{ background: '#6366f112', border: '1px solid #6366f130' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#6366f1' }}>Punto BE ●</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Donde se cruzan: ni ganas ni pierdes.</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#dc2626' }}>Zona roja ◀</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Pocas ventas, el negocio pierde.</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: '#16a34a10', border: '1px solid #16a34a30' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#16a34a' }}>Zona verde ▶</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Ventas suficientes, hay ganancia.</p>
              </div>
            </div>

            {/* Tu posición */}
            {currentUnits !== undefined && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold" style={{ color: currentColor }}>Tú aquí ●</span>{' '}
                {currentUnits >= breakEvenUnits
                  ? 'Tu negocio ya cubre costos y genera ganancia.'
                  : `Faltan ${(Math.ceil(breakEvenUnits) - currentUnits).toLocaleString()} uds para llegar al equilibrio.`}
              </p>
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={enrichedData} margin={{ top: 14, right: 24, left: 10, bottom: 20 }}>
          {/* ── Zonas de color ── */}
          <ReferenceArea x1={0} x2={breakEvenUnits} fill="#ef4444" fillOpacity={0.06} stroke="none" />
          <ReferenceArea x1={breakEvenUnits} x2={maxX} fill="#16a34a" fillOpacity={0.06} stroke="none" />

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

          <XAxis
            dataKey="units"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            label={{ value: 'Unidades / mes', position: 'insideBottom', offset: -12, fill: 'var(--color-text-muted)', fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={48}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-text-secondary)', paddingTop: 8 }}
            formatter={(value) => ['Ingresos', 'Costo Total'].includes(value) ? value : null}
          />

          {/* ── Costos fijos: línea horizontal ── */}
          {costosFijos !== undefined && costosFijos > 0 && (
            <ReferenceLine
              y={costosFijos}
              stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: 'Costos fijos', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10, fontWeight: 600 }}
            />
          )}

          {/* ── Curvas principales ── */}
          <Line
            type="monotone" dataKey="revenue" name="Ingresos"
            stroke="var(--chart-1)" strokeWidth={2}
            dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone" dataKey="totalCost" name="Costo Total"
            stroke="var(--chart-2)" strokeWidth={2}
            dot={false} strokeDasharray="5 3"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />

          {/* ── Dot del punto de break-even sobre la curva de Ingresos ── */}
          <Line
            type="monotone" dataKey="beRevenue" name=""
            stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.beRevenue) return <g key={`be-rev-${props.cx}`} />
              return <SpecialDot key={`be-rev-${props.cx}`} {...props} fill="#6366f1" label="BE" />
            }}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* ── Dot del punto actual sobre la curva de Ingresos ── */}
          <Line
            type="monotone" dataKey="currentRevenue" name=""
            stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.currentRevenue) return <g key={`cur-rev-${props.cx}`} />
              return <SpecialDot key={`cur-rev-${props.cx}`} {...props} fill={currentColor} label="Tú" />
            }}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* ── Dot del punto actual sobre la curva de Costo Total ── */}
          <Line
            type="monotone" dataKey="currentCost" name=""
            stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.currentCost) return <g key={`cur-cost-${props.cx}`} />
              return <SpecialDot key={`cur-cost-${props.cx}`} {...props} fill={currentColor} />
            }}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
