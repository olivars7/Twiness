import { create } from 'zustand'

export type BusinessStatus = 'existente' | 'nuevo' | 'hipotetico' | null

export interface OnboardingData {
  // Paso 1 — tipo
  businessStatus: BusinessStatus
  businessType: string

  // Paso 2 — info básica (todos)
  businessName: string
  businessDescription: string

  // Solo negocios EXISTENTES
  monthsOperating: string
  currentMonthlyRevenue: string
  currentMonthlyExpenses: string
  employeeCount: string
  mainChallenge: string

  // Solo negocios NUEVOS (ya sabe lo que quiere pero aún no abre)
  plannedOpeningDate: string
  initialInvestment: string
  hasLocation: boolean | null
  locationAddress: string

  // Solo negocios HIPOTÉTICOS (planea, sin certeza)
  targetCity: string
  targetZone: string
  estimatedBudget: string
  targetCustomer: string
  salesChannel: string
  problemSolved: string
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
