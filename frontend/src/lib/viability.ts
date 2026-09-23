/**
 * Motor de viabilidad ponderado (client-side preview)
 * Pesos MVP: demanda 25%, competencia 20%, NSE 20%, accesibilidad 15%, costos 10%, POIs 10%
 */

export interface ViabilityFactors {
  demanda: number       // 0–100
  competencia: number   // 0–100 (invertido: menos competencia = más viabilidad)
  nivelSocioeconomico: number // 0–100
  accesibilidad: number // 0–100
  costos: number        // 0–100 (invertido: menores costos = más viabilidad)
  pois: number          // 0–100
}

const WEIGHTS: Record<keyof ViabilityFactors, number> = {
  demanda:               0.25,
  competencia:           0.20,
  nivelSocioeconomico:   0.20,
  accesibilidad:         0.15,
  costos:                0.10,
  pois:                  0.10,
}

export function calcViabilityIndex(factors: ViabilityFactors): number {
  return Object.entries(factors).reduce((sum, [key, value]) => {
    return sum + value * (WEIGHTS[key as keyof ViabilityFactors] ?? 0)
  }, 0)
}

export function viabilityColor(index: number): 'green' | 'yellow' | 'red' {
  if (index >= 70) return 'green'
  if (index >= 40) return 'yellow'
  return 'red'
}
