import { create } from 'zustand'

export type BusinessStatus = 'existente' | 'nuevo' | 'hipotetico' | null

export interface OnboardingData {
  // ── Sección A: Identidad ───────────────────────────────────────────────────
  businessStatus: BusinessStatus
  businessType: string
  businessName: string
  businessDescription: string

  // ── Sección B: Finanzas base (todos — Step 2.5) ───────────────────────────
  // Producto 1
  product1Name: string          // Nombre del producto/servicio principal
  product1Price: string         // Precio de venta ($)
  product1Cost: string          // Costo variable por unidad ($)
  product1Unit: string          // Unidad de medida (pieza, kg, hora…)
  // Producto 2
  product2Name: string          // Nombre del segundo producto/servicio
  product2Price: string         // Precio de venta ($)
  product2Cost: string          // Costo variable por unidad ($)
  product2Unit: string          // Unidad de medida
  // Global
  monthlyFixedCosts: string     // Gastos fijos mensuales estimados
  extraProducts: string         // JSON array of {name,price,cost,unit} for products 3+

  // ── Sección C: Negocio EXISTENTE ──────────────────────────────────────────
  monthsOperating: string
  currentMonthlyRevenue: string
  currentMonthlyExpenses: string
  employeeCount: string
  mainChallenge: string

  // ── Sección D: Negocio NUEVO ──────────────────────────────────────────────
  plannedOpeningDate: string
  initialInvestment: string
  hasLocation: boolean | null
  locationCountry: string
  locationState: string
  locationCity: string
  locationNeighborhood: string
  locationLat: number | null
  locationLng: number | null

  // ── Sección E: Negocio HIPOTÉTICO ─────────────────────────────────────────
  targetCity: string
  targetZone: string
  estimatedBudget: string
  targetCustomer: string
  salesChannel: string
  problemSolved: string

  // ── Sección F: Análisis / Proyección ──────────────────────────────────────
  costVariablePct: string        // % costos variables (0–80) para estado de resultados
  ventasEstimadasMes: string     // Ventas estimadas por mes $ (nuevo)
  ticketPromedio: string         // Ticket promedio $ (nuevo)

  // ── Sección G: Estado de Resultados (financiero) ──────────────────────────
  er_precioPromedio: string        // Precio promedio por unidad ($)
  er_ventasEstimadasMes: string    // Unidades estimadas por mes
  er_costoVariableUnitario: string // Costo variable por unidad ($)
  er_gastosOperativosFijos: string // Gastos fijos mensuales ($)
  er_gastosAdministrativos: string // Gastos administrativos y de ventas ($)
  er_otrosIngresos: string         // Otros ingresos mensuales ($)
  er_impuestosPct: string          // Tasa de impuestos % (0–100)
  er_inversionInicial: string      // Inversión inicial ($)
  er_tasaCrecimiento: string       // Tasa de crecimiento mensual (0.01 = 1%)
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
