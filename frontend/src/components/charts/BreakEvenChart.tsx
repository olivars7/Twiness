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
  beRevenue?:      number
  beCost?:         number
  currentRevenue?: number
  currentCost?:    number
}

interface BreakEvenChartProps {
  data?: BreakEvenData[]
  breakEvenUnits?: number
  currentUnits?: number
  baseUnits?: number          // unidades base (sin escenario) — para la etiqueta
  costosFijos?: number
  precio?: number
  costoVar?: number
  // Switch de escenarios
  scenarioIdx?: number
  onScenarioChange?: (idx: number) => void
}

const SCENARIO_LABELS = ['−50%', '−20%', 'Base', '+20%', '+50%']
// Color visible en ambos modos (claro y oscuro): Base usa un gris medio en lugar de blanco puro
const SCENARIO_COLORS = ['#ef4444', '#f97316', '#a1a1aa', '#86efac', '#22c55e']

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
      <circle cx={cx} cy={cy} r={10} fill={fill} fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />
      {label && (
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill={fill}>
          {label}
        </text>
      )}
    </g>
  )
}

function fmtMXN(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}k`
  return `$${abs.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: number
}) {
  if (!active || !payload || payload.length === 0) return null
  const main = payload.filter(p => p.name === 'Ingresos' || p.name === 'Costo Total')
  if (main.length < 2) return null
  const revenue   = main.find(p => p.name === 'Ingresos')?.value ?? 0
  const totalCost = main.find(p => p.name === 'Costo Total')?.value ?? 0
  const utilidad  = revenue - totalCost
  const positive  = utilidad >= 0
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', minWidth: 200 }}>
      <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        {typeof label === 'number' ? label.toLocaleString('es-MX') : label} unidades
      </p>
      {main.map(p => (
        <div key={p.name} className="flex justify-between gap-6 text-xs mb-1">
          <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}</span>
          <span className="font-semibold" style={{ color: p.color }}>{fmtMXN(p.value)}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 flex justify-between gap-6 text-xs font-bold" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{positive ? 'Ganancia' : 'Pérdida'}</span>
        <span style={{ color: positive ? '#16a34a' : '#dc2626' }}>
          {positive ? '+' : '−'}{fmtMXN(Math.abs(utilidad))}
        </span>
      </div>
    </div>
  )
}

export default function BreakEvenChart({
  data = defaultData,
  breakEvenUnits = 625,
  currentUnits,
  baseUnits,
  costosFijos,
  precio,
  costoVar,
  scenarioIdx = 2,
  onScenarioChange,
}: BreakEvenChartProps) {
  const maxX = data[data.length - 1]?.units ?? 1000

  function interpolateY(xTarget: number, key: 'revenue' | 'totalCost'): number {
    for (let i = 0; i < data.length - 1; i++) {
      const a = data[i], b = data[i + 1]
      if (xTarget >= a.units && xTarget <= b.units) {
        const t = (xTarget - a.units) / (b.units - a.units)
        return a[key] + t * (b[key] - a[key])
      }
    }
    if (key === 'revenue' && precio !== undefined) return xTarget * precio
    if (key === 'totalCost' && costosFijos !== undefined && costoVar !== undefined)
      return costosFijos + xTarget * costoVar
    return 0
  }

  const beY = isFinite(breakEvenUnits) ? interpolateY(breakEvenUnits, 'revenue') : null
  const currentRevenueY   = currentUnits !== undefined ? interpolateY(currentUnits, 'revenue')   : null
  const currentTotalCostY = currentUnits !== undefined ? interpolateY(currentUnits, 'totalCost') : null

  const enrichedData = data.map(d => ({ ...d })) as BreakEvenData[]
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

  const currentColor = SCENARIO_COLORS[scenarioIdx] ?? '#fff'

  // ─── Texto en lenguaje simple ─────────────────────────────────────────────
  const beUnitsRounded = Math.ceil(breakEvenUnits)
  const beRevenue = isFinite(breakEvenUnits) && precio ? Math.round(breakEvenUnits * precio) : null
  const effectiveUnits = currentUnits ?? baseUnits ?? 0
  const isAboveBE = effectiveUnits >= breakEvenUnits
  const diff = Math.abs(effectiveUnits - beUnitsRounded)

  const simpleText = isAboveBE
    ? `Vendes ${effectiveUnits.toLocaleString('es-MX')} unidades al mes — ${diff.toLocaleString('es-MX')} más de lo necesario para no perder dinero.`
    : `Te faltan ${diff.toLocaleString('es-MX')} unidades por mes para cubrir todos tus gastos.`

  return (
    <div className="card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Punto de Equilibrio
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Necesitas vender{' '}
            <span className="font-semibold" style={{ color: '#6366f1' }}>
              {beUnitsRounded.toLocaleString()} uds/mes
            </span>
            {beRevenue && (
              <> ({fmtMXN(beRevenue)})</>
            )}
            {' '}para no perder dinero.{' '}
            {currentUnits !== undefined && (
              <span style={{ color: currentColor }}>
                Tú estás en{' '}
                <span className="font-semibold">{effectiveUnits.toLocaleString()} uds</span>
                {' '}
                <span style={{ color: isAboveBE ? '#22c55e' : '#ef4444' }}>
                  ({isAboveBE ? '▲ zona de ganancia' : '▼ zona de pérdida'})
                </span>
              </span>
            )}
          </p>
          {/* Texto simple */}
          <p className="text-xs mt-1.5 font-medium" style={{ color: isAboveBE ? '#16a34a' : '#dc2626' }}>
            {simpleText}
          </p>
        </div>
        {/* Leyenda */}
        <div className="flex items-center gap-3 text-[10px] flex-wrap justify-end" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#ef444420', border: '1px solid #ef444460' }} />
            Perdiendo
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#16a34a20', border: '1px solid #16a34a60' }} />
            Ganando
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block rounded-full" style={{ background: '#6366f1', width: 8, height: 8 }} />
            Equilibrio
          </span>
          {currentUnits !== undefined && (
            <span className="flex items-center gap-1">
              <span className="inline-block rounded-full" style={{ background: currentColor, width: 8, height: 8 }} />
              Tú aquí
            </span>
          )}
        </div>
      </div>

      {/* ─── Switch de escenarios ─────────────────────────────────────────── */}
      {onScenarioChange && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-widest mr-1" style={{ color: 'var(--color-text-muted)' }}>
            Escenario
          </span>
          {SCENARIO_LABELS.map((lbl, i) => {
            const isCenter = i === 2
            const isActive = i === scenarioIdx
            return (
              <button
                key={lbl}
                onClick={() => onScenarioChange(i)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition"
                style={isActive
                      ? { background: SCENARIO_COLORS[i] + '25', color: isCenter ? 'var(--color-text)' : SCENARIO_COLORS[i], border: `1.5px solid ${SCENARIO_COLORS[i]}80`, fontWeight: 800 }
                      : isCenter
                      ? { background: 'var(--color-input)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-strong)' }
                      : { background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }
                    }
              >
                {lbl}
              </button>
            )
          })}
        </div>
      )}

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
          <ChevronDown size={13} strokeWidth={2.2}
            style={{ color: 'var(--color-text-muted)', transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease', flexShrink: 0 }} />
        </button>
        <div style={{ overflow: 'hidden', maxHeight: guideOpen ? 400 : 0, opacity: guideOpen ? 1 : 0, transition: 'max-height 0.28s ease, opacity 0.2s ease' }}>
          <div className="rounded-xl px-3 py-3 mb-3 space-y-2.5 text-xs leading-relaxed"
            style={{ background: 'var(--color-card-hover)', border: '1px solid var(--color-border)' }}>
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
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-2" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#818cf8' }}>Punto de equilibrio ●</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Donde se cruzan: no ganas, no pierdes.</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#f87171' }}>Zona roja ◀</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Pocas ventas, el negocio pierde.</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <p className="font-semibold text-[10px] mb-0.5" style={{ color: '#34d399' }}>Zona verde ▶</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Ventas suficientes, hay ganancia.</p>
              </div>
            </div>
            {currentUnits !== undefined && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold" style={{ color: currentColor }}>Tú aquí ●</span>{' '}
                {isAboveBE
                  ? 'Tu negocio ya cubre costos y genera ganancia.'
                  : `Faltan ${diff.toLocaleString('es-MX')} uds para llegar al equilibrio.`}
              </p>
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={enrichedData} margin={{ top: 14, right: 24, left: 10, bottom: 20 }}>
          <ReferenceArea x1={0} x2={breakEvenUnits} fill="#ef4444" fillOpacity={0.06} stroke="none" />
          <ReferenceArea x1={breakEvenUnits} x2={maxX} fill="#16a34a" fillOpacity={0.06} stroke="none" />
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="units" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            tickFormatter={(v) => v.toLocaleString('es-MX')}
            label={{ value: 'Unidades / mes', position: 'insideBottom', offset: -12, fill: 'var(--color-text-muted)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            tickFormatter={(v) => {
              const abs = Math.abs(v)
              if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`
              if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}k`
              return `$${abs}`
            }} width={52} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-text-secondary)', paddingTop: 8 }}
            formatter={(value) => ['Ingresos', 'Costo Total'].includes(value) ? value : null} />
          {costosFijos !== undefined && costosFijos > 0 && (
            <ReferenceLine y={costosFijos} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: 'Costos fijos', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10, fontWeight: 600 }} />
          )}
          <Line type="monotone" dataKey="revenue" name="Ingresos"
            stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="totalCost" name="Costo Total"
            stroke="var(--chart-2)" strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r: 4, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="beRevenue" name="" stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.beRevenue) return <g key={`be-rev-${props.cx}`} />
              return <SpecialDot key={`be-rev-${props.cx}`} {...props} fill="#6366f1" label="BE" />
            }}
            activeDot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="currentRevenue" name="" stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.currentRevenue) return <g key={`cur-rev-${props.cx}`} />
              return <SpecialDot key={`cur-rev-${props.cx}`} {...props} fill={currentColor}
                label={scenarioIdx === 2 ? 'Tú' : SCENARIO_LABELS[scenarioIdx]} />
            }}
            activeDot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="currentCost" name="" stroke="none" strokeWidth={0} legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              if (!props.payload?.currentCost) return <g key={`cur-cost-${props.cx}`} />
              return <SpecialDot key={`cur-cost-${props.cx}`} {...props} fill={currentColor} />
            }}
            activeDot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
