'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface CashFlowPoint {
  month: string
  cashFlow: number
  accumulated: number
  // punto especial: solo definido en el mes de recuperación
  recoveryPoint?: number
}

// ─── Custom dot para el mes de recuperación ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecoveryDot(props: any) {
  const { cx, cy } = props
  if (cx === undefined || cy === undefined) return null
  if (isNaN(cx) || isNaN(cy)) return null
  if (!props.payload?.recoveryPoint) return null

  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#16a34a" fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={5}  fill="#16a34a" stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#16a34a">
        Recuperación
      </text>
    </g>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const accum = payload.find(p => p.name === 'Acumulado')?.value
  if (accum === undefined) return null
  const positive = accum >= 0

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 160,
    }}>
      <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>{label}</p>
      <div className="flex justify-between gap-6 text-xs">
        <span style={{ color: 'var(--color-text-secondary)' }}>Flujo acumulado</span>
        <span className="font-bold" style={{ color: positive ? '#16a34a' : '#dc2626' }}>
          {positive ? '+' : '−'}${Math.abs(accum).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </span>
      </div>
      {positive && (
        <p className="text-[10px] mt-1.5" style={{ color: '#16a34a' }}>
          ✓ Inversión recuperada
        </p>
      )}
    </div>
  )
}

export default function CashFlowChart({
  data = defaultData,
  mesRecuperacion,
}: {
  data?: CashFlowPoint[]
  mesRecuperacion?: number | null
}) {
  // Inyectar recoveryPoint en el mes de recuperación
  const enrichedData: CashFlowPoint[] = data.map((p, i) => {
    const mes = i + 1
    if (mesRecuperacion !== undefined && mesRecuperacion !== null && mes === mesRecuperacion) {
      return { ...p, recoveryPoint: p.accumulated }
    }
    return { ...p }
  })

  return (
    <div className="card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Proyección de Flujo de Caja
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {mesRecuperacion
              ? <>Inversión recuperada en{' '}
                  <span className="font-semibold" style={{ color: '#16a34a' }}>
                    Mes {mesRecuperacion}
                  </span>
                </>
              : <span style={{ color: '#dc2626' }}>Sin recuperación en el horizonte proyectado</span>
            }
          </p>
        </div>
        {mesRecuperacion && (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span className="inline-block rounded-full" style={{ background: '#16a34a', width: 8, height: 8 }} />
            Mes de recuperación
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={enrichedData} margin={{ top: 16, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradAccumPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAccumNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={48}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Línea de cero — recuperación */}
          <ReferenceLine
            y={0}
            stroke="#6366f1"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: 'Equilibrio', position: 'insideTopRight', fill: '#6366f1', fontSize: 10, fontWeight: 600 }}
          />

          {/* Curva acumulada */}
          <Area
            type="monotone" dataKey="accumulated" name="Acumulado"
            stroke="var(--chart-1)" strokeWidth={2}
            fill="url(#gradAccumPos)"
            activeDot={{ r: 4, strokeWidth: 0 }}
            dot={false}
          />

          {/* Dot del mes de recuperación */}
          <Area
            type="monotone" dataKey="recoveryPoint" name=""
            stroke="none" strokeWidth={0}
            fill="none"
            legendType="none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => <RecoveryDot key={`rec-${props.cx}`} {...props} />}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const defaultData: CashFlowPoint[] = [
  { month: 'Mes 1', cashFlow: -8000, accumulated: -88000 },
  { month: 'Mes 2', cashFlow: -3000, accumulated: -91000 },
  { month: 'Mes 3', cashFlow:  2000, accumulated: -89000 },
  { month: 'Mes 4', cashFlow:  5000, accumulated: -84000 },
  { month: 'Mes 5', cashFlow: 10000, accumulated: -74000 },
  { month: 'Mes 6', cashFlow: 15000, accumulated: -59000 },
]
