export interface Location {
  lat: number
  lng: number
  address?: string
  city: string
  zone?: string
}

export interface BusinessProfile {
  description: string          // Paso 1: ¿Qué?
  targetAge?: string           // Paso 2: ¿Quién?
  targetProfile?: string
  targetNeeds?: string
  location: Location           // Paso 3: ¿Dónde?
  initialCapital?: number      // Paso 4: ¿Cuánto?
  monthlyBudget?: number
  employees?: number
  salesChannel?: SalesChannel  // Paso 5: ¿Cómo?
  problemSolved?: string       // Paso 6: ¿Por qué?
}

export type SalesChannel = 'local' | 'internet' | 'delivery' | 'marketplace' | 'mixed'

export type BusinessType = 'cafeteria' | 'barberia' | 'tienda_conveniencia' | string

export interface Project {
  id?: string
  name?: string
  businessType: BusinessType
  profile: BusinessProfile
  location: Location
  createdAt?: string
  updatedAt?: string
}
