export type DataSourceType = 'dato' | 'estimacion' | 'suposicion' | 'faltante'

export interface CompetitorSnapshot {
  id: string
  name: string
  distance: number         // metros
  rating?: number          // 1–5
  reviewCount?: number
  businessType: string
  lat: number
  lng: number
  openNow?: boolean
  source: 'google_places'
}

export interface PriceSnapshot {
  competitorName: string
  price: number
  productName: string
  source: DataSourceType
}

export interface ViabilityFactor {
  name: string
  score: number            // 0–100
  weight: number           // 0–1
  color: 'green' | 'yellow' | 'red'
  source: DataSourceType
  explanation: string
}

export interface AnalysisResult {
  viabilityIndex: number
  color: 'green' | 'yellow' | 'red'
  factors: ViabilityFactor[]
  competitors?: CompetitorSnapshot[]
  prices?: PriceSnapshot[]
  improvements?: string[]
  generatedAt: string
}
