'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboardingStore'
import { MODULE_ICONS, type ModuleKey } from '@/lib/icons'
import SquareField from '@/components/ui/SquareField'
import { ArrowRight } from 'lucide-react'

// ─── Read localStorage (same key used by mis-datos + estado-resultados) ────────
const LS_KEY = 'viabl_business_data_v1'
function readLS(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

// ─── Data model ───────────────────────────────────────────────────────────────
interface Module {
  key: ModuleKey
  href: string
  label: string
  desc: string
  accent: string
}

// ─── Section layout ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'perfil',
    label: 'Perfil',
    color: '#6b6b78',
    description: 'Tu información base',
    modules: [
      { key: 'mis-datos' as ModuleKey, href: '/proyecto/mis-datos', label: 'Mis Datos', desc: 'Edita nombre, tipo, productos y finanzas de tu negocio', accent: '#6b6b78' },
    ],
    grid: 'single',
  },
  {
    id: 'analisis',
    label: 'Análisis',
    color: '#3b82f6',
    description: 'Entorno, mercado y precios',
    modules: [
      { key: 'ubicacion' as ModuleKey, href: '/proyecto/ubicacion', label: 'Zona estratégica',  desc: 'Entorno, competencia y zonas de oportunidad',          accent: '#3b82f6' },
      { key: 'mercado'   as ModuleKey, href: '/proyecto/mercado',   label: 'Demanda & Precios', desc: 'Mercado potencial, curva de demanda y comparador de precios', accent: '#10b981' },
    ],
    grid: 'two',
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    color: '#f59e0b',
    description: 'Proyecciones y equilibrio',
    modules: [
      { key: 'simulador' as ModuleKey, href: '/proyecto/financiero', label: 'Simulador de Rentabilidad', desc: 'Break-even, escenarios, proyección y diagnóstico financiero', accent: '#f59e0b' },
    ],
    grid: 'single',
  },
  {
    id: 'gestion',
    label: 'Gestión',
    color: '#f97316',
    description: 'Legal e inteligencia artificial',
    modules: [
      { key: 'tramites' as ModuleKey, href: '/proyecto/tramites', label: 'Cumplimiento legal', desc: 'Checklist y alertas de trámites de apertura', accent: '#f97316' },
      { key: 'agente'   as ModuleKey, href: '/proyecto/agente',   label: 'Agente IA',          desc: 'Asesor contextualizado impulsado por watsonx.ai', accent: '#7c3aed' },
    ],
    grid: 'two',
  },
]

// ─── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, delay }: { mod: Module; delay: number }) {
  const Icon = MODULE_ICONS[mod.key]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        href={mod.href}
        className="group flex flex-col justify-between rounded-2xl h-full card"
        style={{ minHeight: 130 }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--color-card-hover)'
          el.style.borderColor = 'var(--color-border-strong)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--color-card)'
          el.style.borderColor = 'var(--color-border)'
        }}
      >
        {/* Card content */}
        <div className="p-4 flex flex-col gap-3">
          {/* Icon — bare, no tinted box */}
          <Icon size={18} strokeWidth={1.75} style={{ color: mod.accent }} />

          {/* Text */}
          <div>
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
              {mod.label}
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {mod.desc}
            </p>
          </div>
        </div>

        {/* Footer — accent dot + arrow */}
        <div className="px-4 pb-3.5 flex items-center justify-between">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: mod.accent }}
          />
          <ArrowRight
            size={12}
            strokeWidth={2}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Section divider label ─────────────────────────────────────────────────────
function SectionHeader({ label, color, description: _description, delay }: {
  label: string; color: string; description: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center gap-3 mb-3"
    >
      <span
        className="text-[9px] font-bold uppercase tracking-[0.14em] shrink-0"
        style={{ color }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProyectoHubPage() {
  const storeData = useOnboardingStore((s) => s.data)
  const [lsData, setLsData] = useState<Record<string, string>>({})
  useEffect(() => { setLsData(readLS()) }, [])

  const merged = { ...storeData, ...lsData }
  const businessName = merged.businessName || 'Mi Negocio'
  const businessType = (merged.businessType as string) || ''
  const city = (merged.locationCity as string) || 'Tijuana, B.C.'

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 180 }}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.7,
          }}
        />
        <SquareField className="absolute inset-0" />
        {/* Fade the bottom so text is legible in both themes */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--color-card) 0%, transparent 55%)' }}
        />
        {/* Subtle blue accent glow — top-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
        />
        <div className="relative z-10 px-7 py-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#3b82f6' }}>
              Mi Proyecto
            </p>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight leading-none"
              style={{
                fontFamily: '"Playfair Display","Georgia","Times New Roman",serif',
                fontStyle: 'italic',
                color: 'var(--color-text)',
              }}
            >
              {businessName}
            </h1>
            {(businessType || city) && (
              <p className="text-xs mt-2.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {[businessType, city].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
              style={{ border: '1.5px solid var(--color-border-strong)', background: 'var(--color-card-hover)' }}
            >
              <span className="text-xl font-black leading-none" style={{ color: 'var(--color-text)' }}>—</span>
              <span className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Índice</span>
            </div>
            <p className="text-[9px] text-center" style={{ color: 'var(--color-text-muted)', maxWidth: 72 }}>
              Completa módulos para calcular
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── SECTIONS ──────────────────────────────────────────────────────────── */}
      {SECTIONS.map((section, si) => {
        const baseDelay = 0.12 + si * 0.08

        return (
          <motion.section key={section.id}>

            <SectionHeader
              label={section.label}
              color={section.color}
              description={section.description}
              delay={baseDelay}
            />

            {/* Perfil — single wide card */}
            {section.grid === 'single' && (
              <ModuleCard mod={section.modules[0]} delay={baseDelay + 0.05} />
            )}

            {/* Análisis / Finanzas — 3-column grid */}
            {section.grid === 'three' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {section.modules.map((mod, i) => (
                  <ModuleCard key={mod.href} mod={mod} delay={baseDelay + 0.05 + i * 0.04} />
                ))}
              </div>
            )}

            {/* Gestión — 2-column grid, same ModuleCard */}
            {section.grid === 'two' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.modules.map((mod, i) => (
                  <ModuleCard key={mod.href} mod={mod} delay={baseDelay + 0.05 + i * 0.04} />
                ))}
              </div>
            )}

          </motion.section>
        )
      })}

    </div>
  )
}
