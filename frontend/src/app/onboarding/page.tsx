'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore, type BusinessStatus } from '@/store/onboardingStore'
import { useRouter } from 'next/navigation'

// ─── slide variants ───────────────────────────────────────────────────────────
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}
const transition = { type: 'spring' as const, stiffness: 280, damping: 28 }

// ─── shared input styles ──────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 transition'

const selectCls =
  'w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'

// ─── option card ─────────────────────────────────────────────────────────────
function OptionCard({
  icon, label, selected, onClick,
}: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-2 text-sm font-medium transition-colors
        ${selected
          ? 'border-blue-500 bg-blue-950 text-blue-400'
          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-700'}`}
    >
      <span className="text-3xl">{icon}</span>
      {label}
    </motion.button>
  )
}

// ─── step nav buttons ─────────────────────────────────────────────────────────
function Nav({
  onBack, onNext, canNext, isLast,
}: { onBack?: () => void; onNext: () => void; canNext: boolean; isLast?: boolean }) {
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:bg-gray-800 transition"
        >
          ← Atrás
        </button>
      )}
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition
          ${canNext
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
      >
        {isLast ? 'Ver mi proyecto →' : 'Continuar →'}
      </button>
    </div>
  )
}

// ─── STEPS ────────────────────────────────────────────────────────────────────

function Step0({ onNext }: { onNext: () => void }) {
  const { data, setField } = useOnboardingStore()
  const options: { icon: string; label: string; value: BusinessStatus }[] = [
    { icon: '🏪', label: 'Mi negocio ya existe', value: 'existente' },
    { icon: '🚀', label: 'Voy a abrir pronto', value: 'nuevo' },
    { icon: '💡', label: 'Es solo una idea por ahora', value: 'hipotetico' },
  ]
  return (
    <div>
      <Label>¿En qué etapa está tu negocio?</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {options.map((o) => (
          <OptionCard
            key={o.value}
            icon={o.icon}
            label={o.label}
            selected={data.businessStatus === o.value}
            onClick={() => setField('businessStatus', o.value)}
          />
        ))}
      </div>
      <Nav onNext={onNext} canNext={!!data.businessStatus} />
    </div>
  )
}

function Step1({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  const types = [
    'Cafetería / Restaurante', 'Barbería / Salón', 'Tienda de conveniencia',
    'Ropa / Moda', 'Tecnología / Software', 'Salud / Bienestar',
    'Educación', 'Servicios profesionales', 'Otro',
  ]
  return (
    <div>
      <Label>¿Qué tipo de negocio es?</Label>
      <Hint>Elige la categoría que mejor lo describe.</Hint>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setField('businessType', t)}
            className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition
              ${data.businessType === t
                ? 'border-blue-500 bg-blue-950 text-blue-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-700'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.businessType} />
    </div>
  )
}

function Step2({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  return (
    <div>
      <Label>Cuéntanos sobre tu negocio</Label>
      <Hint>Solo lo básico por ahora.</Hint>
      <div className="flex flex-col gap-4 mt-5">
        <div>
          <FieldLabel>Nombre del negocio</FieldLabel>
          <input
            className={inputCls}
            placeholder="ej. Café El Buen Gusto"
            value={data.businessName ?? ''}
            onChange={(e) => setField('businessName', e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>¿Qué ofrece? (en una oración)</FieldLabel>
          <textarea
            rows={3}
            className={inputCls + ' resize-none'}
            placeholder="ej. Vendemos café de especialidad y postres artesanales a trabajadores de oficina"
            value={data.businessDescription ?? ''}
            onChange={(e) => setField('businessDescription', e.target.value)}
          />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.businessName && data.businessDescription)} />
    </div>
  )
}

// ── Pasos para negocio EXISTENTE ──────────────────────────────────────────────

function StepExistente1({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  return (
    <div>
      <Label>Números actuales de tu negocio</Label>
      <Hint>Aproximados están bien — son solo para ti.</Hint>
      <div className="flex flex-col gap-4 mt-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>¿Cuántos meses lleva abierto?</FieldLabel>
            <input type="number" className={inputCls} placeholder="ej. 18"
              value={data.monthsOperating ?? ''}
              onChange={(e) => setField('monthsOperating', e.target.value)} />
          </div>
          <div>
            <FieldLabel>¿Cuántos empleados tiene?</FieldLabel>
            <input type="number" className={inputCls} placeholder="ej. 3"
              value={data.employeeCount ?? ''}
              onChange={(e) => setField('employeeCount', e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel>Ingresos mensuales aproximados ($)</FieldLabel>
          <input type="number" className={inputCls} placeholder="ej. 45000"
            value={data.currentMonthlyRevenue ?? ''}
            onChange={(e) => setField('currentMonthlyRevenue', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Gastos fijos mensuales aproximados ($)</FieldLabel>
          <input type="number" className={inputCls} placeholder="ej. 28000"
            value={data.currentMonthlyExpenses ?? ''}
            onChange={(e) => setField('currentMonthlyExpenses', e.target.value)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.currentMonthlyRevenue)} />
    </div>
  )
}

function StepExistente2({ onBack, onNext }: NavProps & { isLast?: boolean }) {
  const { data, setField } = useOnboardingStore()
  const challenges = [
    'Atraer más clientes', 'Reducir costos', 'Competencia muy fuerte',
    'Falta de flujo de caja', 'Problemas con proveedores', 'Otro',
  ]
  return (
    <div>
      <Label>¿Cuál es tu mayor reto ahora mismo?</Label>
      <div className="grid grid-cols-2 gap-2 mt-5">
        {challenges.map((c) => (
          <button key={c} onClick={() => setField('mainChallenge', c)}
            className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition text-left
              ${data.mainChallenge === c
                ? 'border-blue-500 bg-blue-950 text-blue-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-700'}`}>
            {c}
          </button>
        ))}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.mainChallenge} isLast />
    </div>
  )
}

// ── Pasos para negocio NUEVO ──────────────────────────────────────────────────

function StepNuevo1({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  return (
    <div>
      <Label>Datos de apertura</Label>
      <div className="flex flex-col gap-4 mt-5">
        <div>
          <FieldLabel>¿Cuándo planeas abrir? (aproximado)</FieldLabel>
          <input type="month" className={inputCls}
            value={data.plannedOpeningDate ?? ''}
            onChange={(e) => setField('plannedOpeningDate', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Inversión inicial disponible ($)</FieldLabel>
          <input type="number" className={inputCls} placeholder="ej. 80000"
            value={data.initialInvestment ?? ''}
            onChange={(e) => setField('initialInvestment', e.target.value)} />
        </div>
        <div>
          <FieldLabel>¿Ya tienes local o ubicación?</FieldLabel>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[{ label: 'Sí, ya tengo', val: true }, { label: 'Todavía no', val: false }].map(({ label, val }) => (
              <button key={String(val)} onClick={() => setField('hasLocation', val)}
                className={`py-3 rounded-xl border text-sm font-medium transition
                  ${data.hasLocation === val
                    ? 'border-blue-500 bg-blue-950 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {data.hasLocation === true && (
          <div>
            <FieldLabel>Dirección del local</FieldLabel>
            <input className={inputCls} placeholder="ej. Av. Revolución 1234, Zona Centro, Tijuana"
              value={data.locationAddress ?? ''}
              onChange={(e) => setField('locationAddress', e.target.value)} />
          </div>
        )}
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.initialInvestment && data.hasLocation !== null && data.hasLocation !== undefined)} isLast />
    </div>
  )
}

// ── Pasos para negocio HIPOTÉTICO ─────────────────────────────────────────────

function StepHipotetico1({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  return (
    <div>
      <Label>¿Dónde y para quién?</Label>
      <Hint>No tiene que ser exacto — estamos explorando.</Hint>
      <div className="flex flex-col gap-4 mt-5">
        <div>
          <FieldLabel>Ciudad donde abrirías</FieldLabel>
          <input className={inputCls} placeholder="ej. Tijuana, B.C."
            value={data.targetCity ?? ''}
            onChange={(e) => setField('targetCity', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Zona o colonia pensada (opcional)</FieldLabel>
          <input className={inputCls} placeholder="ej. Zona Río, Centro Histórico"
            value={data.targetZone ?? ''}
            onChange={(e) => setField('targetZone', e.target.value)} />
        </div>
        <div>
          <FieldLabel>¿A quién le venderías?</FieldLabel>
          <input className={inputCls} placeholder="ej. Jóvenes universitarios de 18–25 años"
            value={data.targetCustomer ?? ''}
            onChange={(e) => setField('targetCustomer', e.target.value)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.targetCity && data.targetCustomer)} />
    </div>
  )
}

function StepHipotetico2({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  const channels = ['Local físico', 'En línea / e-commerce', 'A domicilio / delivery', 'Marketplace', 'Mixto']
  return (
    <div>
      <Label>Modelo y presupuesto</Label>
      <div className="flex flex-col gap-5 mt-5">
        <div>
          <FieldLabel>¿Cómo venderías?</FieldLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channels.map((c) => (
              <button key={c} onClick={() => setField('salesChannel', c)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition text-left
                  ${data.salesChannel === c
                    ? 'border-blue-500 bg-blue-950 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-700'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Presupuesto estimado que tendrías ($)</FieldLabel>
          <input type="number" className={inputCls} placeholder="ej. 50000"
            value={data.estimatedBudget ?? ''}
            onChange={(e) => setField('estimatedBudget', e.target.value)} />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!(data.salesChannel && data.estimatedBudget)} />
    </div>
  )
}

function StepHipotetico3({ onBack, onNext }: NavProps) {
  const { data, setField } = useOnboardingStore()
  return (
    <div>
      <Label>¿Qué problema resuelve tu idea?</Label>
      <Hint>Esta respuesta nos ayuda a analizar el potencial de tu negocio.</Hint>
      <div className="mt-5">
        <textarea rows={4} className={inputCls + ' resize-none'}
          placeholder="ej. En mi colonia no hay cafeterías de buena calidad cerca de las oficinas, y los trabajadores tienen que manejar 15 minutos para encontrar una..."
          value={data.problemSolved ?? ''}
          onChange={(e) => setField('problemSolved', e.target.value)} />
      </div>
      <Nav onBack={onBack} onNext={onNext} canNext={!!data.problemSolved} isLast />
    </div>
  )
}

// ─── helper components ────────────────────────────────────────────────────────
interface NavProps { onBack?: () => void; onNext: () => void }
function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-white leading-snug">{children}</h2>
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-gray-400 mb-1.5">{children}</p>
}

// ─── step resolver ────────────────────────────────────────────────────────────
function buildSteps(status: BusinessStatus) {
  // Steps: [0] estado, [1] tipo, [2] nombre+desc, [3+] específicos
  const common = [Step0, Step1, Step2]

  if (status === 'existente') return [...common, StepExistente1, StepExistente2]
  if (status === 'nuevo')     return [...common, StepNuevo1]
  if (status === 'hipotetico') return [...common, StepHipotetico1, StepHipotetico2, StepHipotetico3]
  return common
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, direction, setStep, data } = useOnboardingStore()
  const steps = buildSteps(data.businessStatus ?? null)
  const total = steps.length

  const goNext = () => {
    if (currentStep === total - 1) {
      router.push('/proyecto')
      return
    }
    setStep(currentStep + 1, 1)
  }
  const goBack = () => {
    if (currentStep === 0) {
      router.push('/selector')
      return
    }
    setStep(currentStep - 1, -1)
  }

  const StepComponent = steps[currentStep]

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-16">
      {/* logo */}
      <div className="absolute top-5 left-8 text-xl font-black tracking-tight text-white">
        viab<span className="text-blue-400">L</span>
      </div>
      {/* progress dots */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300
              ${i === currentStep ? 'w-6 bg-blue-500' : i < currentStep ? 'w-1.5 bg-blue-800' : 'w-1.5 bg-gray-700'}`}
          />
        ))}
      </div>

      {/* card window — overflow hidden clips the slide */}
      <div className="w-full max-w-lg overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            <StepComponent
              onBack={goBack}
              onNext={goNext}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
