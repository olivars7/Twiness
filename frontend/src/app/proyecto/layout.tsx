'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_MODULES = [
  { href: '/proyecto',                        icon: '🏠', label: 'Mi Proyecto' },
  { href: '/proyecto/ubicacion',              icon: '📍', label: 'Ubicación' },
  { href: '/proyecto/competencia',            icon: '⚔️',  label: 'Competencia' },
  { href: '/proyecto/precios',                icon: '💲', label: 'Precios' },
  { href: '/proyecto/accesibilidad',          icon: '🚶', label: 'Accesibilidad' },
  { href: '/proyecto/ciudad',                 icon: '🗺️',  label: 'Ciudad' },
  { href: '/proyecto/demanda',                icon: '📈', label: 'Demanda' },
  { href: '/proyecto/financiero/estado-resultados', icon: '📊', label: 'Est. Resultados' },
  { href: '/proyecto/financiero/break-even',  icon: '⚖️',  label: 'Break-even' },
  { href: '/proyecto/financiero/apalancamiento', icon: '🔧', label: 'Apalancamiento' },
  { href: '/proyecto/escenarios',             icon: '🔮', label: 'Escenarios' },
  { href: '/proyecto/scamper',                icon: '💡', label: 'SCAMPER' },
  { href: '/proyecto/tramites',               icon: '🧾', label: 'Trámites' },
  { href: '/proyecto/escudo',                 icon: '🛡️',  label: 'Escudo' },
  { href: '/proyecto/agente',                 icon: '🤖', label: 'Agente IA' },
]

export default function ProyectoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-950 sticky top-0 z-30">
        <Link href="/">
          <div className="flex items-center gap-3">
            <img src="/logoBasico.png" alt="viabL" className="h-12 w-auto" />
            <span className="text-2xl font-black tracking-tight">viab<span className="text-blue-400">L</span></span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 hidden sm:block">Mi Proyecto</span>
          <Link
            href="/selector"
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-blue-600 hover:text-blue-400 transition-colors"
          >
            Cambiar modo
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-gray-800 bg-gray-950 pt-4 pb-6 overflow-y-auto shrink-0">
          <nav className="flex flex-col gap-0.5 px-2">
            {NAV_MODULES.map(({ href, icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors
                    ${isActive
                      ? 'bg-blue-950 text-blue-400 font-semibold'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                >
                  <span className="text-base">{icon}</span>
                  <span className="truncate">{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>

      </div>
    </div>
  )
}
