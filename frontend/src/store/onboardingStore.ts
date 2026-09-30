import { create } from 'zustand'

export type BusinessStatus = 'existente' | 'nuevo' | 'hipotetico' | null

export interface OnboardingData {
  // ── Paso 0: Contexto ──────────────────────────────────────────────────────
  businessStatus: BusinessStatus          // etapa del negocio

  // ── Paso 1: Tipo de negocio ───────────────────────────────────────────────
  businessType: string

  // ── Paso 2: Identidad ─────────────────────────────────────────────────────
  businessName: string
  businessDescription: string

  // ── Paso 3: Ubicación ─────────────────────────────────────────────────────
  locationCountry: string
  locationState: string
  locationCity: string
  locationNeighborhood: string
  locationLat: number | null
  locationLng: number | null

  // ── Paso 4: Operación ─────────────────────────────────────────────────────
  operatingHours: string                  // ej. "Corrido (8–20h)" o texto libre
  employeeCount: string                   // número de empleados (texto para consistencia)
  salesChannel: string                    // canal de venta principal

  // ── Paso 5: Productos & costos ────────────────────────────────────────────
  // Producto 1 (requerido)
  product1Name: string
  product1Price: string
  product1Cost: string
  product1Unit: string
  // Producto 2 (opcional)
  product2Name: string
  product2Price: string
  product2Cost: string
  product2Unit: string
  // Productos adicionales (3+) serializados como JSON
  extraProducts: string                   // JSON: Array<{name,price,cost,unit}>
  // Gastos fijos (todos los flujos)
  monthlyFixedCosts: string

  // ── Paso 6: Escala ────────────────────────────────────────────────────────
  monthlyUnits: string                    // unidades/mes que vende o estima vender
  capitalAvailable: string                // capital disponible / inversión inicial

  // ── Paso 7: Cliente & motivación (skipeable) ──────────────────────────────
  targetCustomer: string                  // perfil de cliente
  businessMotivation: string             // reto actual O razón de la idea (texto libre)

  // ── Parámetros financieros (Estado de Resultados — editados en su módulo) ──
  er_precioPromedio: string
  er_ventasEstimadasMes: string
  er_costoVariableUnitario: string
  er_gastosOperativosFijos: string
  er_gastosAdministrativos: string
  er_otrosIngresos: string
  er_impuestosPct: string
  er_inversionInicial: string
  er_tasaCrecimiento: string
}

interface OnboardingStore {
  data: Partial<OnboardingData>
  currentStep: number
  direction: 1 | -1
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  setStep: (step: number, direction: 1 | -1) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: {},
  currentStep: 0,
  direction: 1,
  setField: (key, value) =>
    set((state) => ({ data: { ...state.data, [key]: value } })),
  setStep: (step, direction) => set({ currentStep: step, direction }),
  reset: () => set({ data: {}, currentStep: 0, direction: 1 }),
}))
