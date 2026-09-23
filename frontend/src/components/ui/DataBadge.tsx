type BadgeType = 'dato' | 'estimacion' | 'suposicion' | 'faltante'

interface DataBadgeProps {
  type: BadgeType
  label?: string
}

const badgeConfig: Record<BadgeType, { emoji: string; text: string; className: string }> = {
  dato:       { emoji: '🔵', text: 'Dato',       className: 'bg-blue-100 text-blue-800' },
  estimacion: { emoji: '🟡', text: 'Estimación', className: 'bg-yellow-100 text-yellow-800' },
  suposicion: { emoji: '🟠', text: 'Suposición', className: 'bg-orange-100 text-orange-800' },
  faltante:   { emoji: '🔴', text: 'Faltante',   className: 'bg-red-100 text-red-800' },
}

export default function DataBadge({ type, label }: DataBadgeProps) {
  const config = badgeConfig[type]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
      {config.emoji} {label ?? config.text}
    </span>
  )
}
