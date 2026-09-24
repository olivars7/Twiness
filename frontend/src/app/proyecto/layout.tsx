'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { MODULE_ICONS } from '@/lib/icons'
import { Bot } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useState, useEffect } from 'react'

// ─── Sidebar structure ────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    name: 'Perfil',
    color: '#6b6b78',
    items: [
      { href: '/proyecto/mis-datos', key: 'mis-datos', label: 'Mis Datos' },
    ],
  },
  {
    name: 'Análisis',
    color: '#3b82f6',
    items: [
      { href: '/proyecto/ubicacion',  key: 'ubicacion', label: 'Zona estratégica' },
      { href: '/proyecto/demanda',    key: 'demanda',   label: 'Demanda' },
      { href: '/proyecto/precios',    key: 'precios',   label: 'Precios' },
    ],
  },
  {
    name: 'Finanzas',
    color: '#f59e0b',
    items: [
      { href: '/proyecto/financiero/estado-resultados', key: 'estado-resultados', label: 'Est. Resultados' },
      { href: '/proyecto/financiero/break-even',        key: 'break-even',        label: 'Pto. Equilibrio' },
      { href: '/proyecto/escenarios',                   key: 'escenarios',        label: 'Escenarios' },
    ],
  },
  {
    name: 'Gestión',
    color: '#f97316',
    items: [
      { href: '/proyecto/tramites', key: 'tramites', label: 'Cumplimiento' },
    ],
  },
] as const

// flat list still needed for active-check
const ALL_HREFS = NAV_SECTIONS.flatMap(s => s.items.map(i => i.href))

// ─── Read real data from localStorage (same key as mis-datos) ─────────────────
const LS_KEY = 'viabl_business_data_v1'
function readLS() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export default function ProyectoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const storeData = useOnboardingStore((s) => s.data)

  // Prefer localStorage (persisted by mis-datos page) over in-memory store
  const [lsData, setLsData] = useState<Record<string, string>>({})
  useEffect(() => { setLsData(readLS()) }, [pathname])

  const merged = { ...storeData, ...lsData }
  const businessName = merged.businessName || 'Mi Negocio'
  const businessType = merged.businessType || ''

  return (
    <div className="min-h-screen" style={{ color: 'var(--color-text)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-52 z-20 overflow-y-auto"
        style={{ background: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo + project name */}
        <div className="px-4 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/" className="flex items-center gap-3 mb-3">
            <img src="/logoBasico.png" alt="viabL" className="h-10 w-auto" />
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sora)' }}>
              viab<span style={{ color: '#3b82f6' }}>L</span>
            </span>
          </Link>
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{businessName}</p>
          {businessType
            ? <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{businessType}</p>
            : <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Mi Proyecto</p>
          }
        </div>

        {/* Hub link */}
        <div className="px-2 pt-3 pb-1">
          {(() => {
            const isActive = pathname === '/proyecto'
            const Icon = MODULE_ICONS['home']
            return (
              <Link
                href="/proyecto"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
                style={isActive
                  ? { background: '#000000', color: '#e2e8f0', fontWeight: 600 }
                  : { color: 'var(--color-text-secondary)' }
                }
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)' } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' } }}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.75} className="shrink-0" />
                <span className="truncate text-xs font-semibold">Inicio</span>
              </Link>
            )
          })()}
        </div>

        {/* Sectioned nav */}
        <nav className="flex flex-col gap-0 px-2 flex-1 pb-3">
          {NAV_SECTIONS.map(section => (
            <div key={section.name} className="mt-3">
              {/* Section divider label */}
              <div className="flex items-center gap-2 px-3 mb-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: section.color }}
                >
                  {section.name}
                </span>
                <div className="flex-1 h-px" style={{ background: `${section.color}30` }} />
              </div>

              {/* Items */}
              {section.items.map(({ href, key, label }) => {
                const isActive = pathname === href
                const Icon = MODULE_ICONS[key]
                // Active: black bg, light-tinted color text per section
                const lightColor = section.color + 'e0'  // same hue but we use a lighter tint inline
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ml-1"
                    style={isActive
                      ? { background: '#000000', color: lightColor, fontWeight: 600, borderLeft: `2px solid ${section.color}` }
                      : { color: 'var(--color-text-secondary)', borderLeft: '2px solid transparent' }
                    }
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)' } }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' } }}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.2 : 1.75} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Agente IA — CTA at bottom */}
        <div className="px-3 pb-4 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Link
            href="/proyecto/agente"
            className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: '#7c3aed12', color: '#7c3aed', border: '1px solid #7c3aed30' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed22' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed12' }}
          >
            <Bot size={14} strokeWidth={1.75} />
            <span>Agente IA</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#7c3aed', color: '#fff' }}>IA</span>
          </Link>
        </div>
      </aside>

      {/* ── Floating action buttons — top-right, tight margin ───────────────── */}
      <div
        className="fixed top-[5px] right-[5px] z-30 flex items-center gap-1.5 rounded-xl px-1.5 py-1"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: '0 4px 16px 0 rgb(0 0 0 / 0.18), 0 1px 4px 0 rgb(0 0 0 / 0.10)' }}
      >
        <Link
          href="/proyecto/agente"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; (e.currentTarget as HTMLElement).style.color = '#7c3aed' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
        >
          <Bot size={13} />
          Agente IA
        </Link>
        <Link
          href="/onboarding"
          className="flex items-center text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLElement).style.color = '#3b82f6' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
        >
          ← Editar
        </Link>
      </div>

      {/* Main content — animated bg, offset sidebar */}
      <div className="animated-bg md:ml-52 min-h-screen">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="px-6 py-[50px]"
        >
          {children}
        </motion.div>
      </div>

    </div>
  )
}
